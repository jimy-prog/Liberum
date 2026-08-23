import requests, time
time.sleep(1)
cookies = {"user_id": "1"}
for route in ["/waitlist/", "/performance/", "/placement/", "/groups/", "/students/"]:
    r = requests.get(f"http://localhost:8000{route}", cookies=cookies, allow_redirects=True)
    print(f"{route} -> {r.status_code}")
