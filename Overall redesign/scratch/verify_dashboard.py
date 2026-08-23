import requests

s = requests.Session()
# Login using correct JSON and wait for redirect
url_login = "http://127.0.0.1:8000/login"
r = s.post(url_login, json={"identifier": "teacher_demo1", "password": "demo"})
print("POST /login ->", r.status_code, r.text)
s.headers.update({"Referer": "http://127.0.0.1:8000/login"})
r = s.get("http://127.0.0.1:8000/dashboard")
print("GET /dashboard ->", r.status_code)
if r.status_code == 500:
    print(r.text)
