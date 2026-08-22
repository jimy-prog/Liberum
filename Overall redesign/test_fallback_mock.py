import os
from config import GEMINI_API_KEY, OPENAI_API_KEY
from services.ai_client import UniversalAIClient

client = UniversalAIClient(primary_provider="gemini")
client.openai_client = True # Fake it

def mock_gemini_generate(*args, **kwargs):
    raise Exception("429 ResourceExhausted: Quota exceeded")

def mock_openai_generate(*args, **kwargs):
    return "OPENAI SUCCESS"

client._call_gemini_generate = mock_gemini_generate
client._call_openai_generate = mock_openai_generate

try:
    res = client.generate_structured_response("Hello")
    print("Fallback Success:", res)
except Exception as e:
    print("Caught Exception in fallback:", type(e).__name__, str(e))
