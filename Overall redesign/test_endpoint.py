import sys
import asyncio
from pydantic import BaseModel
from fastapi import Request

from routers.ai import ai_chat_endpoint, ChatRequest
from master_database import SessionMaster, User

class MockRequest:
    def __init__(self, user_id):
        self.session = {"user_id": user_id}

master_db = SessionMaster()
user = master_db.query(User).first()
if not user:
    print("No user")
    sys.exit(1)

req = MockRequest(user.id)
payload = ChatRequest(message="Hello", include_profile=True, include_lessons=False, include_tests=False, include_grammar=False, chat_history=[], session_id=None)

try:
    response = ai_chat_endpoint(req, payload)
    print("Response:", response.body)
except Exception as e:
    print(f"Endpoint Exception: {type(e).__name__}: {str(e)}")
