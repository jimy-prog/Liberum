import urllib.request
import json
import traceback

urls = [
    "http://127.0.0.1:8000/students/1?modal=1",
    "http://127.0.0.1:8000/finance/payroll",
    "http://127.0.0.1:8000/monthly-report/"
]

for u in urls:
    try:
        req = urllib.request.Request(u, headers={'Cookie': 'session=YOUR_SESSION'})
        res = urllib.request.urlopen(req)
        print(f"{u}: {res.status}")
    except Exception as e:
        print(f"{u}: Error {e}")
