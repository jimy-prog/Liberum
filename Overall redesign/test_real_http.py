import requests
from auth import create_session
from master_database import SessionMaster, User

master_db = SessionMaster()
user = master_db.query(User).filter(User.role == 'student').first()

token = create_session(user.id)
session = requests.Session()
session.cookies.set("liberum_session", token)

payload = {
    "message": "hello",
    "include_profile": True,
    "include_lessons": False,
    "include_tests": False,
    "include_grammar": False,
    "chat_history": [],
    "session_id": None
}
resp2 = session.post("http://127.0.0.1:8000/library/ai/chat", json=payload, allow_redirects=False)
print("Chat status:", resp2.status_code)
print("Headers:", resp2.headers)
