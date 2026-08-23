import requests

cookies = {"user_id": "1"}
for route in ["/waitlist/", "/performance/", "/placement/", "/groups/"]:
    res = requests.get(f"http://localhost:8000{route}", cookies=cookies)
    print(f"{route} -> {res.status_code}")
