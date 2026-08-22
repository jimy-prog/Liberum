import os
from config import GEMINI_API_KEY, OPENAI_API_KEY
from services.ai_client import UniversalAIClient

print("Gemini Key:", bool(GEMINI_API_KEY))
print("OpenAI Key:", bool(OPENAI_API_KEY))

client = UniversalAIClient(primary_provider="gemini")
try:
    print("Testing generate_structured_response...")
    # Because Gemini has 429 quota exhausted right now, it SHOULD fallback to OpenAI.
    # Wait, the user didn't give me the OpenAI key yet, but they said they WILL paste it.
    # So right now OPENAI_API_KEY is empty. We expect an Exception!
    res = client.generate_structured_response("Hello, reply in JSON with {'msg': 'hi'}")
    print("Success:", res)
except Exception as e:
    print("Expected Error:", type(e).__name__, str(e))
