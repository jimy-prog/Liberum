import requests
s = requests.Session()
s.get("http://127.0.0.1:8000/login")
r = s.post("http://127.0.0.1:8000/login", json={"identifier": "teacher_demo1", "password": "demo"})
print(s.cookies.get_dict())
