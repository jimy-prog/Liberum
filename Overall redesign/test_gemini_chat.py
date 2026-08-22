import os
from config import GEMINI_API_KEY
import google.generativeai as genai
import traceback

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

print("Testing chat with 2.5-flash")
chat = model.start_chat(history=[])
full_message = "SYSTEM INSTRUCTION:\nYou are a helpful AI.\n\nUSER MESSAGE:\nhello"
try:
    response = chat.send_message(full_message)
    print("Response text:", response.text)
except Exception as e:
    print("Error during send_message:")
    traceback.print_exc()
