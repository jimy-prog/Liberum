with open("routers/finance.py", "r") as f:
    text = f.read()

import re
text = re.sub(
    r'"active_income":active_income,', 
    '"active_income":active_income, "total_expense": 0, "net_income": active_income, "expenses": [],', 
    text
)

with open("routers/finance.py", "w") as f:
    f.write(text)
