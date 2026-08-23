import requests
s = requests.Session()
s.post("http://127.0.0.1:8000/login", json={"identifier": "owner", "password": "demo"})
r = s.get("http://127.0.0.1:8000/owner/")
print("Owner dashboard:", r.status_code)
if r.status_code == 500:
    print(r.text)
