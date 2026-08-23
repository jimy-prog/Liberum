import re

with open("routers/dashboard.py", "r") as f:
    text = f.read()

text = text.replace("from database import get_db, Group, Waitlist, Student", "from database import get_db, Group, Student")
text = text.replace("from auth import get_current_user", "from auth import get_current_user\nfrom routers.waitlist import WaitlistEntry as Waitlist")

with open("routers/dashboard.py", "w") as f:
    f.write(text)
