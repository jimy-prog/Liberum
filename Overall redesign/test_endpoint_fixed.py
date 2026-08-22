import sys
import traceback
from fastapi import Request
from pydantic import BaseModel
from master_database import SessionMaster, User
from routers.ai import ai_chat_endpoint, ChatRequest
import routers.ai as ai_module

# Mock get_current_user
master_db = SessionMaster()
user = master_db.query(User).filter(User.role == 'student').first()
if not user:
    print("No student user found")
    sys.exit(1)

def mock_get_current_user(request):
    return user

ai_module.get_current_user = mock_get_current_user

class MockRequest:
    def __init__(self):
        pass

req = MockRequest()
payload = ChatRequest(message="hello", include_profile=True, include_lessons=False, include_tests=False, include_grammar=False, chat_history=[], session_id=None)

try:
    resp = ai_chat_endpoint(req, payload)
    print("Status Code:", resp.status_code)
    print("Body:", resp.body)
except Exception as e:
    print("EXCEPTION CAUGHT BY TEST SCRIPT:")
    traceback.print_exc()
