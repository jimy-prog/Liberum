import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from master_database import SessionMaster, User
from database import get_tenant_engine, Student
import traceback

master_db = SessionMaster()
user = master_db.query(User).filter(User.role == 'student').first()
if not user:
    print("No student user found in master_db")
    sys.exit(1)

print(f"Testing with User: {user.email}, {user.full_name}, {user.phone}")

from routers.ai import ai_chat_endpoint, ChatRequest
from auth import create_session

class MockRequest:
    def __init__(self, token):
        self.cookies = {"liberum_session": token}

token = create_session(user.id)
req = MockRequest(token)
payload = ChatRequest(message="hello", include_profile=True, include_lessons=False, include_tests=False, include_grammar=False, chat_history=[], session_id=None)

try:
    resp = ai_chat_endpoint(req, payload)
    print("Response status:", resp.status_code)
    print("Response body:", resp.body)
except Exception as e:
    traceback.print_exc()

