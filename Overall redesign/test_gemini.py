import os
from config import GEMINI_API_KEY
import google.generativeai as genai

print(f"Key used: {GEMINI_API_KEY[:10]}...")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')
try:
    response = model.generate_content("Hello")
    print(response.text)
except Exception as e:
    print(f"Exception: {type(e).__name__}: {str(e)}")
