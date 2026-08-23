import requests
import re

s = requests.Session()
r = s.get("http://127.0.0.1:8000/login")
csrf_token = re.search(r'id="csrf_token" value="([^"]+)"', r.text).group(1)
print("Extracted CSRF:", csrf_token[:20])

r = s.post("http://127.0.0.1:8000/login", json={"identifier": "teacher_demo1", "password": "demo", "csrf_token": csrf_token})
print("POST /login ->", r.status_code, r.text)
if r.status_code == 200:
    r = s.get("http://127.0.0.1:8000/dashboard")
    print("GET /dashboard ->", r.status_code)
