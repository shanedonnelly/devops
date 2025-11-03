import os
from dotenv import load_dotenv
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from mistralai.exceptions import MistralException

# 1. Load variables from your .env file
load_dotenv()

# 2. Get the API key
api_key = os.environ.get("MISTRAL_API_KEY")

if not api_key:
    print("🛑 ERROR: MISTRAL_API_KEY not found in .env file.")
    print("Make sure your .env file is in the same directory.")
    exit()

# 3. Check if it's the old, blocked key
if "lWtExqmjxd1P9DNc" in api_key:
    print("🛑 WARNING: You are still using the old, blocked API key.")
    print("This test will fail. Please get a new key from console.mistral.ai")

print(f"✅ Key loaded successfully (Key starts with: {api_key[:4]}...)")

try:
    # 4. Create the Mistral client
    client = MistralClient(api_key=api_key)

    print("... Contacting Mistral API with 'mistral-tiny-latest' ...")

    # 5. Make a single, simple API call
    response = client.chat(
        model="mistral-tiny-latest", # Use a small, fast model
        messages=[ChatMessage(role="user", content="Hello, respond with 'OK'")]
    )

    # 6. If it works, print the response
    print("\n--- ✅ API SUCCESS ---")
    print(f"Response: {response.choices[0].message.content}")

except MistralException as e:
    # 7. If it fails, print the *exact* API error
    print("\n--- 🛑 API FAILED (MistralException) ---")
    print(f"This is the crash test you wanted. The API returned an error:")
    print(f"HTTP Status Code: {e.status_code}")
    print(f"Error Message: {e.message}")
    print("\nThis confirms your API key is blocked, invalid, or has no credits.")

except Exception as e:
    # Catch any other errors (like network issues)
    print(f"\n--- 🛑 SCRIPT FAILED (Other Exception) ---")
    print(e)