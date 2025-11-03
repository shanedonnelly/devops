import os
import json
from openai import OpenAI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fuzzywuzzy import process

# --- Client & App Setup ---
client = OpenAI(
    base_url="http://host.docker.internal:11434/v1",
    api_key="ollama"
)
MODEL_NAME = "qwen3:4b"
app = FastAPI(
    title="E-commerce Chatbot Service (Stateful)",
    description="A robust chatbot microservice using 'qwen3:4b' with a state machine"
)

# Enable permissive CORS for local development (so front-end can call the API from another origin)
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

class ChatResponse(BaseModel):
    response: str
    new_state: str | None = None

# --- Schemas (with REFUND) ---
CLASSIFICATION_SCHEMA = {
    "type": "object",
    "properties": {
        "intent": {"type": "string", "enum": ["ORDER_STATUS", "CATALOG_SEARCH", "REFUND", "GREETING", "HELP", "OTHER"]},
        "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0}
    },
    "required": ["intent", "confidence"]
}

ACTION_SCHEMAS = {
    "ORDER_STATUS": {
        "type": "object",
        "properties": {
            "action_type": {"type": "string", "enum": ["CHECK_ORDER_STATUS"]},
            "order_id": {"type": "string", "description": "The order ID, e.g., ORD-2024-1003. Extract null if not provided."}
        },
        "required": ["action_type", "order_id"]
    },
    "REFUND": {
        "type": "object",
        "properties": {
            "action_type": {"type": "string", "enum": ["REQUEST_REFUND"]},
            "order_id": {"type": "string", "description": "The order ID, e.g., ORD-2024-1008. Extract null if not provided."}
        },
        "required": ["action_type", "order_id"]
    },
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
    "AstroWatch": {"price": 299.99, "stock": 50, "description": "Smartwatch with lunar cycle tracking...", "category": "Wearables"},
    "CosmicMug": {"price": 19.50, "stock": 200, "description": "Temperature-retaining mug...", "category": "Homeware"},
    "ZenithPad": {"price": 49.99, "stock": 100, "description": "Extra-large, ergonomic mouse pad...", "category": "Accessories"},
    "StellarLens": {"price": 599.00, "stock": 10, "description": "Professional-grade smartphone camera attachment...", "category": "Optics"},
    "NovaBackpack": {"price": 89.99, "stock": 30, "description": "Durable, water-resistant backpack...", "category": "Bags"},
    "OrionBelt": {"price": 39.99, "stock": 150, "description": "Reversible leather belt...", "category": "Apparel"},
    "GalacticSocks": {"price": 14.99, "stock": 300, "description": "Pack of 3 cotton socks...", "category": "Apparel"},
    "EclipseShades": {"price": 129.50, "stock": 40, "description": "Polarized sunglasses...", "category": "Accessories"},
    "PulsarHeadphones": {"price": 199.99, "stock": 25, "description": "Wireless noise-cancelling headphones...", "category": "Electronics"},
    "QuasarCharger": {"price": 59.99, "stock": 70, "description": "High-speed 100W GaN wall charger...", "category": "Electronics"},
    "MeteoritePen": {"price": 75.00, "stock": 50, "description": "Heavyweight executive pen...", "category": "Stationery"},
    "NebulaNotebook": {"price": 24.99, "stock": 120, "description": "A5 dotted journal...", "category": "Stationery"},
    "StarSailLamp": {"price": 99.00, "stock": 35, "description": "Touch-activated desk lamp...", "category": "Homeware"},
    "TerraWallet": {"price": 49.95, "stock": 90, "description": "Slim, RFID-blocking cardholder...", "category": "Accessories"},
    "LunarLoungePants": {"price": 65.00, "stock": 60, "description": "Ultra-soft modal pajama pants...", "category": "Apparel"},
    "AuroraDeskMat": {"price": 34.99, "stock": 80, "description": "XL desk mat...", "category": "Accessories"},
    "GravityBlanket": {"price": 119.00, "stock": 20, "description": "15lb weighted blanket...", "category": "Homeware"},
    "RocketshipBookends": {"price": 45.50, "stock": 45, "description": "Set of 2 metal bookends...", "category": "Homeware"},
    "CosmoCandle": {"price": 29.00, "stock": 100, "description": "Scented soy wax candle...", "category": "Homeware"},
    "VoyagerWaterBottle": {"price": 32.00, "stock": 110, "description": "32oz insulated stainless steel bottle...", "category": "Homeware"},
    "ApertureTelescope": {"price": 399.00, "stock": 15, "description": "Beginner-friendly 70mm refractor telescope...", "category": "Optics"},
    "AndromedaTee": {"price": 28.00, "stock": 200, "description": "100% organic cotton t-shirt...", "category": "Apparel"},
    "SaturnSphere": {"price": 55.00, "stock": 30, "description": "3D laser-etched crystal sphere...", "category": "Homeware"},
    "BlackHoleCoasters": {"price": 22.99, "stock": 75, "description": "Set of 4 slate coasters...", "category": "Homeware"}
}

ORDER_DB = {
    "ORD-2024-1001": {"status": "Shipped"}, "ORD-2024-1002": {"status": "Delivered"},
    "ORD-2024-1003": {"status": "Processing"}, "ORD-2024-1004": {"status": "Delivered"},
    "ORD-2024-1005": {"status": "Processing"}, "ORD-2024-1006": {"status": "Shipped"},
    "ORD-2024-1007": {"status": "Delivered"}, "ORD-2024-1008": {"status": "Cancelled"},
    "ORD-2024-1009": {"status": "Processing"}, "ORD-2024-1010": {"status": "Shipped"},
    "ORD-2024-1011": {"status": "Delivered"}, "ORD-2024-1012": {"status": "Shipped"},
    "ORD-2024-1013": {"status": "Delivered"}, "ORD-2024-1014": {"status": "Processing"},
    "ORD-2024-1015": {"status": "Shipped"}, "ORD-2024-1016": {"status": "Delivered"},
    "ORD-2024-1017": {"status": "Processing"}, "ORD-2024-1018": {"status": "Delivered"},
    "ORD-2024-1019": {"status": "Cancelled"}, "ORD-2024-1020": {"status": "Shipped"},
    "ORD-2024-1021": {"status": "Processing"}, "ORD-2024-1022": {"status": "Delivered"},
    "ORD-2024-1023": {"status": "Shipped"}, "ORD-2024-1024": {"status": "Processing"}
}
PRODUCT_NAMES = list(PRODUCT_CATALOG.keys())

# --- Core Chatbot Logic ---

def get_json_response(system_prompt: str, user_query: str) -> dict | None:
    """Helper function to get a JSON response from Ollama."""
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            response_format={"type": "json_object"}, 
            temperature=0.0
        )
        content = response.choices[0].message.content
        if content.startswith("```json"):
            content = content[7:-3].strip()
        return json.loads(content)
        
    except Exception as e:
        print(f"Error calling local model ({MODEL_NAME}): {e}")
        try:
            print("Retrying query without 'response_format'...")
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                temperature=0.0
            )
            content = response.choices[0].message.content
            if content.startswith("```json"):
                content = content[7:-3].strip()
            return json.loads(content)
        except Exception as retry_e:
            print(f"Error on retry: {retry_e}")
            return None

def classify_intent(user_query: str) -> dict:
    """Classifies user intent using a more robust 'few-shot' prompt."""
    
    # (UPDATED) Added REFUND examples
    system_prompt = f"""
    You are an expert intent classification agent. Classify the user's query
    into one of the following intents: ORDER_STATUS, REFUND, CATALOG_SEARCH, GREETING, HELP, OTHER.

    Here are some examples:
    User: "Hello there!" -> {{"intent": "GREETING", "confidence": 1.0}}
    User: "Where is my package ORD-2024-1002?" -> {{"intent": "ORDER_STATUS", "confidence": 1.0}}
    User: "Do you sell smartwatches?" -> {{"intent": "CATALOG_SEARCH", "confidence": 1.0}}
    User: "I want a refund." -> {{"intent": "REFUND", "confidence": 1.0}}
    User: "I need to return order 1008" -> {{"intent": "REFUND", "confidence": 1.0}}
    User: "help" -> {{"intent": "HELP", "confidence": 1.0}}
    User: "What can you do?" -> {{"intent": "HELP", "confidence": 1.0}}
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
    if intent == "ORDER_STATUS":
        examples = """
        Here are some examples:
        User: "Where is my package ORD-2024-1002?" -> {"action_type": "CHECK_ORDER_STATUS", "order_id": "ORD-2024-1002"}
        User: "Status update for ord-2024-1003 please." -> {"action_type": "CHECK_ORDER_STATUS", "order_id": "ORD-2024-1003"}
        """
    elif intent == "REFUND":
        examples = """
        Here are some examples:
        User: "I need a refund for my order." -> {"action_type": "REQUEST_REFUND", "order_id": null}
        User: "I want to return order ORD-2024-1008." -> {"action_type": "REQUEST_REFUND", "order_id": "ORD-2024-1008"}
        """
    elif intent == "CATALOG_SEARCH":
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

def do_check_order_status(order_id: str) -> str:
    """Looks up an order and returns a response string."""
    if not order_id or order_id == "null":
        return "I can't seem to find an order ID. Please provide an ID (e.g., ORD-2024-1001)."

    order_id = order_id.upper()
    if order_id in ORDER_DB:
        order = ORDER_DB[order_id]
        return f"✅ Order {order_id} is currently {order['status']}."
    else:
        return f"⚠️ I couldn't find an order with the ID '{order_id}'. Please check the ID."

def do_refund(order_id: str) -> str:
    """Handles the business logic for a refund request."""
    if not order_id or order_id == "null":
        # This case should be handled by the state machine, but as a fallback:
        return "I can't seem to find an order ID. Please provide an ID (e.g., ORD-2024-1001)."

    order_id = order_id.upper()
    if order_id not in ORDER_DB:
        return f"⚠️ I couldn't find an order with the ID '{order_id}'. Please check the ID."

    status = ORDER_DB[order_id]["status"]
    if status == "Cancelled":
        return f"✅ Order {order_id} is already cancelled. No refund is necessary."
    if status == "Delivered":
        return f"✅ Order {order_id} was delivered. I have started a return request for you. Please check your email for a shipping label."
    if status == "Processing":
        ORDER_DB[order_id]["status"] = "Cancelled" # Mock update
        return f"✅ Order {order_id} is still 'Processing'. I have successfully cancelled the order and a refund will be issued."
    if status == "Shipped":
        return f"⚠️ Order {order_id} has already 'Shipped'. Please wait for the item to be delivered, then contact us for a return."
    return "I'm not sure how to handle a refund for this order. Let me get a human agent."

def do_get_product_info(product_name: str) -> str:
    """Looks up a product and returns a response string."""
    if not product_name:
        return "I can't seem to find a product name. What product are you interested in?"

    product_name_lower = product_name.lower()
    found_products = []
    for name, details in PRODUCT_CATALOG.items():
        search_string = (f"{name} {details['description']} {details.get('category', '')}").lower()
        if product_name_lower in search_string:
            found_products.append(name)

    if not found_products:
        best_match, score = process.extractOne(product_name, PRODUCT_NAMES)
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

def chatbot_main(user_query: str, state: str | None) -> tuple[str, str | None]:
    """
    Main chatbot logic flow using a simple state machine.
    Returns: (response_string, new_state_string)
    """
    
    # --- Step 1: Handle any existing state FIRST ---
    # This is the most important part.
    
    if state == "AWAITING_ORDER_ID_FOR_STATUS":
        # The user's query is the order ID.
        # We completely bypass classification.
        response = do_check_order_status(user_query)
        return response, None # Clear state after handling
    
    if state == "AWAITING_ORDER_ID_FOR_REFUND":
        # The user's query is the order ID.
        # We bypass classification and run the refund logic.
        response = do_refund(user_query)
        return response, None # Clear state after handling
        
    if state == "AWAITING_PRODUCT_NAME":
        # The user's query is the product name.
        response = do_get_product_info(user_query)
        # If the response is *still* a list, stay in this state
        if "I found" in response and "items matching" in response:
            return response, "AWAITING_PRODUCT_NAME"
        return response, None # Clear state

    # --- Step 2: If NO state, process as a new query ---
    
    intent_obj = classify_intent(user_query)
    intent = intent_obj.get("intent", "OTHER")

    if intent == "GREETING":
        response = "👋 Hello! How can I assist you today?"
        return response, None

    # (NEW) Full help text
    if intent == "HELP":
        response = (
            "I am a customer service assistant. Here is what I can do for you:\n\n"
            "**📦 Order Support**\n"
            "You can ask me to check the status of an order or request a refund.\n"
            "*Example: 'Where is my order?'*\n"
            "*Example: 'I need to return order ORD-2024-1008'*\n\n"
            "**🛍️ Product Catalog**\n"
            "You can ask me about any product we sell, or ask for items by category.\n"
            "*Example: 'Tell me about the AstroWatch'*\n"
            "*Example: 'Do you sell any headphones?'*\n\n"
            "If I need more information, like an order ID, I will ask you for it. "
            "You can then just provide the missing info in your next message."
        )
        return response, None

    if intent == "OTHER":
        response = "🤔 I'm sorry, I can only help with order status, refunds, or product questions."
        return response, None

    # --- Step 3: Extract action for new, valid intents ---
    
    action = extract_action(intent, user_query)
    action_type = action.get("action_type")
    
    if action_type == "CHECK_ORDER_STATUS":
        order_id = action.get("order_id")
        if not order_id or order_id == "null":
            # (FIX) Set the specific state
            response = "I can help with that! What is your order ID (e.g., ORD-2024-1001)?"
            return response, "AWAITING_ORDER_ID_FOR_STATUS" 
        response = do_check_order_status(order_id)
        return response, None

    if action_type == "REQUEST_REFUND":
        order_id = action.get("order_id")
        if not order_id or order_id == "null":
            # (FIX) Set the specific state
            response = "I can help with your refund. What is the order ID?"
            return response, "AWAITING_ORDER_ID_FOR_REFUND"
        response = do_refund(order_id)
        return response, None

    if action_type == "GET_PRODUCT_INFO":
        product_name = action.get("product_name")
        if not product_name:
            response = "I can look up products for you. What's the name of the product?"
            return response, "AWAITING_PRODUCT_NAME"
        
        response = do_get_product_info(product_name)
        if "I found" in response and "items matching" in response:
            return response, "AWAITING_PRODUCT_NAME"
        return response, None

    return "🤔 I understood your request but had trouble processing it.", None

# --- API Endpoint ---

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(query: UserQuery):
    if not query.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    response_text, new_state = chatbot_main(query.query, query.state)
    return ChatResponse(response=response_text, new_state=new_state)

# --- Health Check ---

@app.get("/health")
async def health_check():
    return {"status": "ok"}