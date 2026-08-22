import requests

session = requests.Session()
resp = session.post("http://localhost:8000/login", data={"identifier": "student@liberum.uz", "password": "password"})
print("Login status:", resp.status_code)

payload = {
    "message": "hello",
    "include_profile": True,
    "include_lessons": False,
    "include_tests": False,
    "include_grammar": False,
    "chat_history": [],
    "session_id": None
}
resp2 = session.post("http://localhost:8000/library/ai/chat", json=payload)
print("Chat status:", resp2.status_code)
print("Chat text:", resp2.text)
