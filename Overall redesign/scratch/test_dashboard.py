import requests

s = requests.Session()
r = s.get("http://127.0.0.1:8000/login")
csrf = s.cookies.get("csrf_access_token", "")
r = s.post("http://127.0.0.1:8000/login", json={"identifier": "teacher_demo1", "password": "demo"})
print(r.status_code, r.text)
r = s.get("http://127.0.0.1:8000/dashboard")
print(r.status_code)
if r.status_code == 500:
    print(r.text)
