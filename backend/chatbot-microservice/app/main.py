import os
import json
import time
from openai import OpenAI
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fuzzywuzzy import process
import re


OPENROUTER_BASE = "https://openrouter.ai/api/v1"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_KEY")
if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_KEY environment variable is not set. Please set it to your OpenRouter API key.")

client = OpenAI(
    base_url=OPENROUTER_BASE,
    api_key=OPENROUTER_API_KEY,
)

MODEL_NAME =  "meta-llama/llama-3.3-70b-instruct:free"
app = FastAPI(
    title="E-commerce Chatbot Service (Stateful)",
    description="A robust chatbot microservice using 'qwen3:4b' with a state machine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class UserQuery(BaseModel):
    query: str
    state: str | None = None
    site_id: str | None = None

class ChatResponse(BaseModel):
    response: str
    new_state: str | None = None

# --- Schemas (with REFUND) ---
CLASSIFICATION_SCHEMA = {
    "type": "object",
    "properties": {
        "intent": {"type": "string", "enum": ["CATALOG_SEARCH", "RECOMMENDATION", "GREETING", "HELP", "OTHER"]},
        "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0}
    },
    "required": ["intent", "confidence"]
}

ACTION_SCHEMAS = {
    "CATALOG_SEARCH": {
        "type": "object",
        "properties": {
            "action_type": {"type": "string", "enum": ["GET_PRODUCT_INFO"]},
            "product_name": {"type": "string", "description": "The general item name, e.g., 'smartwatch', 'mug', or 'AstroWatch'."}
        },
        "required": ["action_type", "product_name"]
    }
}

# --- Databases ---
PRODUCT_CATALOG = {

}

PRODUCT_NAMES = list(PRODUCT_CATALOG.keys())

# --- Catalogue service wiring ---
CATALOGUE_BASE = os.getenv("CATALOGUE_BASE", "http://catalogue-service:8000/devops/api/catalogue-service")
CATALOGUE_CACHE_TTL = int(os.getenv("CATALOGUE_CACHE_TTL", "60"))
CHATBOT_SITE_ID = os.getenv("CHATBOT_SITE_ID")

_catalogue_cache: dict = {}
_site_index: dict = {}

def _build_index_from_catalogue(cat: dict) -> dict:
    """Build a search index from a site catalogue.

    Returns a dict with:
    - products: flattened product list [{name, description, price, variants, category}]
    - names: list of product names (for fuzzy matching)
    """
    products = _flatten_products_from_catalogue(cat)
    names = [p.get("name") for p in products if p.get("name")]
    return {"products": products, "names": names}

def _get_cached_catalogue(site_string_id: str):
    entry = _catalogue_cache.get(site_string_id)
    if not entry:
        return None
    data, ts = entry
    if time.time() - ts > CATALOGUE_CACHE_TTL:
        del _catalogue_cache[site_string_id]
        return None
    return data

def _set_cached_catalogue(site_string_id: str, data: dict):
    _catalogue_cache[site_string_id] = (data, time.time())

def fetch_catalogue(site_string_id: str) -> dict | None:
    """Fetch the catalogue for a site from the catalogue-service.

    Returns a structured dict matching the CatalogueResponse shape, or None on error.
    This is a blocking HTTP call (requests). Cached for CATALOGUE_CACHE_TTL seconds.
    """
    if not site_string_id:
        return None

    # Serve from cache when fresh
    cached = _get_cached_catalogue(site_string_id)
    if cached is not None:
        return cached

    import requests

    url = f"{CATALOGUE_BASE}/sites/{site_string_id}/catalogue"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            _set_cached_catalogue(site_string_id, data)
            return data
        else:
            print(f"Catalogue service returned {resp.status_code} for {site_string_id}")
            return None
    except Exception as e:
        print(f"Error fetching catalogue for {site_string_id}: {e}")
        return None

def ensure_site_index(site_string_id: str) -> dict | None:
    """Ensure an in-memory index exists for the site and is within TTL; rebuild if needed."""
    # Reuse the raw JSON TTL for simplicity
    entry = _site_index.get(site_string_id)
    now = time.time()
    if entry and (now - entry.get("ts", 0) <= CATALOGUE_CACHE_TTL):
        return entry

    cat = fetch_catalogue(site_string_id)
    if not cat:
        return None
    idx = _build_index_from_catalogue(cat)
    idx["ts"] = now
    _site_index[site_string_id] = idx
    return idx

def _flatten_products_from_catalogue(cat: dict) -> list:
    """Return a list of product dicts with keys: name, description, price, variants, category"""
    products = []
    if not cat:
        return products
    for category in cat.get("categories", []):
        cat_name = category.get("name")
        for p in category.get("products", []):
            prod = {
                "name": p.get("name"),
                "description": p.get("description"),
                "price": p.get("price"),
                "variants": p.get("variants", []),
                "category": cat_name,
            }
            products.append(prod)
    return products

# --- Recommendation helpers ---
def _format_catalogue_for_prompt(products: list) -> str:
    """Format up to the first 60 products into a compact string for LLM prompts.

    Each line: - Product Name ($Price): Description [Category]
    """
    if not products:
        return "(no products available)"

    lines = []
    for p in products[:60]:
        name = p.get("name") or "<unknown>"
        price = p.get("price")
        price_str = f"(${price})" if price is not None else ""
        desc = p.get("description") or ""
        cat = p.get("category") or ""
        line = f"- {name} {price_str}: {desc} [{cat}]"
        lines.append(line)
    return "\n".join(lines)


def get_vibe_recommendation(user_query: str, site_id: str) -> str:
    """Return a Markdown-formatted recommendation list (1-3 items) matching the user's vibe.

    Uses the LLM to score/pick the best matches from the site's catalogue (limited to 60 items).
    """
    # Fetch site index (cached) and fall back to local PRODUCT_CATALOG
    idx = None
    if site_id:
        idx = ensure_site_index(site_id)

    products = []
    if idx:
        products = idx.get("products", [])
    else:
        # build from local PRODUCT_CATALOG
        for name, d in PRODUCT_CATALOG.items():
            products.append({"name": name, "description": d.get("description", ""), "price": d.get("price"), "category": d.get("category", "")})

    if not products:
        return "**Recommendations:**\n\n_I'm sorry — I couldn't find the site's catalogue to make recommendations right now._"

    inventory_text = _format_catalogue_for_prompt(products)

    system_prompt = f"""
    You are a product recommender assistant. Given a short inventory list and a user's "vibe" or description,
    pick the top 1 to 3 items that best match the vibe. Ignore items that clearly don't match.

    Inventory (first 60 items):
    {inventory_text}

    Respond only with a JSON object matching the schema:
    {{"recommendations": [{{"name": "...", "reason": "..."}}]}}

    The "reason" should be a short sentence explaining why the item fits the vibe.
    """

    result = get_json_response(system_prompt, user_query)
    if not result:
        return "**Recommendations:**\n\n_Sorry — I couldn't reach the recommendation model right now._"

    recs = result.get("recommendations") if isinstance(result, dict) else None
    if not recs:
        return "**Recommendations:**\n\n_No suitable recommendations were returned._"

    # Build a compact, consistent Markdown output (max 3 recommendations)
    name_to_product = {p.get("name"): p for p in products}

    def _clean_text(s: str, max_len: int = 140) -> str:
        if not s:
            return ""
        # remove code fences and inline code
        s = re.sub(r'```.*?```', '', s, flags=re.S)
        s = re.sub(r'`(.+?)`', r'\1', s, flags=re.S)
        # remove bold/italic markers (**text**, *text*, __text__, _text_)
        s = re.sub(r'(\*\*|__)(.*?)\1', r'\2', s, flags=re.S)
        s = re.sub(r'(\*|_)(.*?)\1', r'\2', s, flags=re.S)
        # remove any leftover stray asterisks
        s = s.replace('*', '')
        # normalize dash characters to a single em-dash marker for splitting
        s = re.sub(r'[\u2012\u2013\u2014\u2015]+', ' — ', s)
        # collapse whitespace
        s = ' '.join(s.split())
        # trim surrounding punctuation and separators
        s = s.strip(' \t\n\r-–—,:;')
        # truncate if necessary
        if len(s) > max_len:
            s = s[: max_len - 3].rstrip() + '...'
        return s

    # Plain text header (no markdown)
    header_query = _clean_text(user_query, max_len=120)
    header = f"Recommendations for \"{header_query}\""

    lines = [header]
    for idx, r in enumerate(recs[:3], start=1):
        raw_name = r.get('name') or '<unknown>'
        name = _clean_text(raw_name)
        reason = _clean_text(r.get('reason') or '')

        # try to find product by original name first, then by cleaned name
        prod = name_to_product.get(raw_name) or name_to_product.get(name)

        category = prod.get('category') if prod else None
        price = prod.get('price') if prod else None
        price_str = ''
        if price is not None and price != '':
            try:
                price_val = float(price)
                price_str = f'${price_val:.2f}'
            except Exception:
                price_str = f'${price}'

        # Build plain numbered item
        item_core = name
        extras = []
        if category:
            extras.append(str(category))
        if price_str:
            extras.append(price_str)
        if extras:
            item_core += ' (' + ', '.join(extras) + ')'
        if reason:
            item_core += ' — ' + reason

        lines.append(f"{idx}. {item_core}")

    return '\n'.join(lines)
# --- Core Chatbot Logic ---

def get_json_response(system_prompt: str, user_query: str) -> dict | None:
    """Helper function to get a JSON response from the configured model endpoint.

    Runs the model call inside a worker thread with a short timeout to avoid
    blocking the FastAPI worker and causing upstream nginx 504s when the
    model or network is slow or unresponsive.
    """
    from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout

    # inner callable that performs the model request (optionally with response_format)
    def _call_model(use_response_format: bool):
        # small pause to avoid bursting requests to the upstream model
        time.sleep(1)
        kwargs = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            "temperature": 0.0,
        }
        if use_response_format:
            # prefer structured JSON response when available
            kwargs["response_format"] = {"type": "json_object"}
            kwargs["extra_body"] = {
                "models": ["nvidia/nemotron-nano-9b-v2:free", "nousresearch/hermes-3-llama-3.1-405b:free"],
            }

        resp = client.chat.completions.create(**kwargs)
        return resp

    # Limit how long we'll wait for any single model attempt (seconds)
    MODEL_TIMEOUT = int(os.getenv("CHATBOT_MODEL_TIMEOUT", "8"))

    with ThreadPoolExecutor(max_workers=1) as ex:
        # Try with structured response first, then fallback without structured format
        for use_fmt in (True, False):
            future = ex.submit(_call_model, use_fmt)
            try:
                response = future.result(timeout=MODEL_TIMEOUT)
            except FuturesTimeout:
                print(f"Model call timed out after {MODEL_TIMEOUT}s (use_response_format={use_fmt})")
                # cancel and try next fallback
                try:
                    future.cancel()
                except Exception:
                    pass
                continue
            except Exception as e:
                print(f"Error calling model (attempt use_response_format={use_fmt}): {e}")
                continue

            try:
                content = response.choices[0].message.content
                if isinstance(content, str) and content.startswith("```json"):
                    content = content[7:-3].strip()
                return json.loads(content)
            except Exception as parse_e:
                print(f"Error parsing model response: {parse_e}")
                # try next fallback
                continue

    # If all attempts fail, return None so caller can respond quickly
    return None

def classify_intent(user_query: str) -> dict:
    """Classifies user intent using a few-shot prompt (catalog search, help, greeting, other)."""

    system_prompt = f"""
    You are an expert intent classification agent. Classify the user's query
    into one of the following intents: CATALOG_SEARCH, RECOMMENDATION, GREETING, HELP, OTHER.

    Use RECOMMENDATION when the user describes a need, occasion, feeling, or vague request
    that is best served by suggesting products (examples: "something for a party",
    "a gift for dad", "summer vibe outfit").

    Here are some examples:
    User: "Hello there!" -> {{"intent": "GREETING", "confidence": 1.0}}
    User: "Do you sell smartwatches?" -> {{"intent": "CATALOG_SEARCH", "confidence": 1.0}}
    User: "I need a gift for my dad, something practical" -> {{"intent": "RECOMMENDATION", "confidence": 1.0}}
    User: "something for a party" -> {{"intent": "RECOMMENDATION", "confidence": 1.0}}
    User: "help" -> {{"intent": "HELP", "confidence": 1.0}}
    User: "What's the weather?" -> {{"intent": "OTHER", "confidence": 1.0}}

    Respond *only* with a valid JSON object matching this schema:
    {json.dumps(CLASSIFICATION_SCHEMA)}
    """

    result = get_json_response(system_prompt, user_query)
    if result:
        return result
    return {"intent": "OTHER", "confidence": 0.0}

def extract_action(intent: str, user_query: str) -> dict:
    """Extracts action parameters using a more robust 'few-shot' prompt."""
    schema = ACTION_SCHEMAS.get(intent)
    if not schema:
        return {"action_type": "NO_ACTION"}

    examples = ""
    if intent == "CATALOG_SEARCH":
        examples = """
        Here are some examples:
        User: "Tell me about the AstroWatch" -> {"action_type": "GET_PRODUCT_INFO", "product_name": "AstroWatch"}
        User: "Do you have any smartwatches?" -> {"action_type": "GET_PRODUCT_INFO", "product_name": "smartwatch"}
        """

    system_prompt = f"""
    You are an expert parameter extraction agent. Based on the user's query
    and their classified intent, extract the parameters.
    Intent: "{intent}"
    Query: "{user_query}"
    {examples}
    Respond *only* with a valid JSON object matching this schema:
    {json.dumps(schema)}
    """

    result = get_json_response(system_prompt, user_query)
    if result:
        return result
    return {"action_type": "EXTRACTION_FAILED"}

# --- Logic Functions ---

# Order-related functionality removed: orders/refunds are not implemented.

def do_get_product_info(product_name: str, site_id: str | None = None) -> str:
    """Looks up a product and returns a response string."""
    if not product_name:
        return "I can't seem to find a product name. What product are you interested in?"

    product_name_lower = product_name.lower()
    found_products = []

    # If site_id provided or CHATBOT_SITE_ID env var is set, try fetching catalogue
    use_site = site_id or CHATBOT_SITE_ID
    if use_site:
        idx = ensure_site_index(use_site)
        products = (idx or {}).get("products", [])
        names = (idx or {}).get("names", [])
        # Search in site products
        for p in products:
            search_string = (f"{p.get('name')} {p.get('description', '')} {p.get('category', '')}").lower()
            if product_name_lower in search_string:
                found_products.append(p['name'])
        # fuzzy match if none
        if not found_products and names:
            try:
                best_match, score = process.extractOne(product_name, names)
            except Exception:
                best_match, score = (None, 0)
            if best_match and score >= 80:
                found_products = [best_match]
            
        # If found, build response from site catalogue
        if found_products:
            if len(found_products) == 1:
                pname = found_products[0]
                # find product details
                prod = next((x for x in products if x['name'] == pname), None)
                if prod:
                    return (
                        f"📦 Product: {prod['name']}\n"
                        f"Description: {prod.get('description','')}\n"
                        f"Price: ${prod.get('price')}\n"
                        f"Stock: {sum(v.get('stock',0) for v in prod.get('variants',[]))}"
                    )
            else:
                list_of_names = "\n* ".join(found_products)
                return (
                    f"I found {len(found_products)} items matching '{product_name}':\n"
                    f"* {list_of_names}\n\n"
                    "Which one would you like to know more about?"
                )

    # Fallback to built-in PRODUCT_CATALOG if site catalogue not available or no match
    for name, details in PRODUCT_CATALOG.items():
        search_string = (f"{name} {details['description']} {details.get('category', '')}").lower()
        if product_name_lower in search_string:
            found_products.append(name)

    if not found_products and PRODUCT_NAMES:
        match = process.extractOne(product_name, PRODUCT_NAMES)
        if match:
            best_match, score = match
            if score >= 80:
                found_products = [best_match]

    if not found_products:
        return f"⚠️ I'm sorry, I couldn't find any products matching '{product_name}'."

    if len(found_products) == 1:
        product_name = found_products[0]
        product = PRODUCT_CATALOG[product_name]
        return (
            f"📦 Product: {product_name}\n"
            f"Description: {product['description']}\n"
            f"Price: ${product['price']}\n"
            f"Stock: {product['stock']}"
        )

    list_of_names = "\n* ".join(found_products)
    response = (
        f"I found {len(found_products)} items matching '{product_name}':\n"
        f"* {list_of_names}\n\n"
        "Which one would you like to know more about?"
    )
    return response

# --- (NEW) Main Logic with a CLEAN STATE MACHINE ---

def chatbot_main(user_query: str, state: str | None, site_id: str | None = None) -> tuple[str, str | None]:
    """
    Main chatbot logic flow using a simple state machine.
    Returns: (response_string, new_state_string)
    """
    
    # --- Step 1: Handle any existing state FIRST ---
    # This is the most important part.
    
    # No order state handling — orders/refunds not implemented
    if state == "AWAITING_PRODUCT_NAME":
        # The user's query is the product name.
        response = do_get_product_info(user_query, site_id)
        # If the response is *still* a list, stay in this state
        if "I found" in response and "items matching" in response:
            return response, "AWAITING_PRODUCT_NAME"
        return response, None # Clear state

    # --- Step 2: If NO state, process as a new query ---
    
    intent_obj = classify_intent(user_query)
    intent = intent_obj.get("intent", "OTHER")

    # --- New: Recommendation intent ---
    if intent == "RECOMMENDATION":
        # Try to derive site_id from environment or passed-in parameter
        use_site = site_id or CHATBOT_SITE_ID
        md = get_vibe_recommendation(user_query, use_site)
        return md, None

    if intent == "GREETING":
        response = "👋 Hello! How can I assist you today?"
        return response, None

    # Full help text (orders not supported)
    if intent == "HELP":
        response = (
            "I am a customer service assistant. Here is what I can do for you:\n\n"
            "**🛍️ Product Catalog**\n"
            "You can ask me about any product we sell, or ask for items by category.\n"
            "*Example: 'Tell me about the AstroWatch'*\n"
            "*Example: 'Do you sell any headphones?'*\n\n"
            "If I need more information to answer, I will ask you for it. "
            "You can then provide the missing info in your next message."
        )
        return response, None

    if intent == "OTHER":
        response = "🤔 I'm sorry, I can only help with product questions or provide general help."
        return response, None

    # --- Step 3: Extract action for new, valid intents ---
    
    action = extract_action(intent, user_query)
    action_type = action.get("action_type")
    
    # No order/refund actions — unsupported

    if action_type == "GET_PRODUCT_INFO":
        product_name = action.get("product_name")
        if not product_name:
            response = "I can look up products for you. What's the name of the product?"
            return response, "AWAITING_PRODUCT_NAME"
        
        response = do_get_product_info(product_name, site_id)
        if "I found" in response and "items matching" in response:
            return response, "AWAITING_PRODUCT_NAME"
        return response, None

    return "🤔 I understood your request but had trouble processing it.", None

# --- API Endpoint ---

def _derive_site_id(request: Request, body_site_id: str | None) -> str | None:
    """Best-effort derivation of site_id when the frontend doesn't send it explicitly.

    Priority:
    1) body.site_id
    2) query parameter (?site_id= / ?site= / ?sid=)
    3) header (x-site-id / x-site / x-siteid)
    4) Referer URL path: looks for '/devops/shanify/<siteId>' or '/shanify/<siteId>'
    """
    if body_site_id:
        return body_site_id

    # 1) Query params (explicit)
    try:
        qp = request.query_params
        for key in ("site_id", "site", "sid"):
            if key in qp and qp[key]:
                return qp[key]
    except Exception:
        pass

    # 2) Explicit headers
    try:
        headers = request.headers
        for key in ("x-site-id", "x-site", "x-siteid"):
            v = headers.get(key)
            if v:
                return v
    except Exception:
        pass

    # 3) Heuristics: look through referer/origin/x-forwarded-prefix/x-original-uri
    try:
        candidates = []
        h = request.headers
        for header_name in ("referer", "Referer", "origin", "Origin", "x-forwarded-prefix", "x-original-uri", "x-forwarded-uri", "x-original-url", "x-rewrite-url"):
            v = h.get(header_name)
            if v:
                candidates.append(v)

        # Also check forwarded header (may contain a URI)
        fwd = h.get("forwarded")
        if fwd:
            candidates.append(fwd)

        # Check request.url.path + root_path (some proxies set root_path)
        try:
            path_candidate = str(request.url)
            if path_candidate:
                candidates.append(path_candidate)
        except Exception:
            pass

        import re
        from urllib.parse import urlparse

        for cand in candidates:
            try:
                # Clean candidate (if it's a forwarded header, try to extract URL-like parts)
                # Try to find '/shanify/<siteId>' anywhere in the candidate string
                m = re.search(r"/shanify/([^/?#\\s]+)", cand, re.IGNORECASE)
                if m:
                    return m.group(1)

                # Try a slightly broader pattern: '/devops/shanify/<id>' or '/devops/<something>/shanify/<id>'
                m2 = re.search(r"/devops(?:/[^/]+)*/shanify/([^/?#\\s]+)", cand, re.IGNORECASE)
                if m2:
                    return m2.group(1)

                # If candidate looks like a full URL, parse its path and try the segment approach
                try:
                    parsed = urlparse(cand)
                    path = parsed.path or ""
                    parts = [p for p in path.split('/') if p]
                    for i, seg in enumerate(parts):
                        if seg.lower() == 'shanify' and (i + 1) < len(parts):
                            return parts[i + 1]
                except Exception:
                    pass
            except Exception:
                continue
    except Exception:
        pass

    return None


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(query: UserQuery, request: Request):
    if not query.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Derive site id if not present
    site_id = _derive_site_id(request, query.site_id)
    try:
        if query.site_id != site_id:
            print(f"[chatbot] site_id resolved to '{site_id}' (body was '{query.site_id}')")
    except Exception:
        pass

    response_text, new_state = chatbot_main(query.query, query.state, site_id)
    return ChatResponse(response=response_text, new_state=new_state)

# --- Health Check ---

@app.get("/health", tags=["Health"])
async def root():
    return {"service": "chatbot-microservice", "status": "running"}

@app.get("/catalogue/{site_string_id}")
async def catalogue_proxy(site_string_id: str):
    """Proxy endpoint to fetch catalogue for a site via catalogue-service.

    This returns the raw catalogue JSON (same shape as CatalogueResponse) or
    404 if not found.
    """
    data = fetch_catalogue(site_string_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Catalogue not found for site")
    return data