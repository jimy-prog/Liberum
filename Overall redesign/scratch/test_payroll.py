import sys
import os
sys.path.append(os.path.abspath('.'))
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)
resp = client.get("/finance/payroll", cookies={"session": "teacher_demo1"})
print(f"payroll: {resp.status_code}")
if resp.status_code == 500:
    print(resp.text)
    
resp2 = client.get("/monthly-report/", cookies={"session": "teacher_demo1"})
print(f"monthly-report: {resp2.status_code}")
if resp2.status_code == 500:
    print(resp2.text)
