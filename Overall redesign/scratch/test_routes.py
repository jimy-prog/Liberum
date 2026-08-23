import requests

s = requests.Session()
r = s.post("http://127.0.0.1:8000/login", json={"identifier": "teacher_demo1", "password": "demo"})

routes = ["/dashboard", "/finance/", "/payments/", "/monthly-report/", "/settings/"]
for route in routes:
    r = s.get("http://127.0.0.1:8000" + route)
    print(route, r.status_code)
    if r.status_code == 500:
        print(r.text)
