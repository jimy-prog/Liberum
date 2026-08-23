with open('routers/dashboard.py', 'r') as f:
    text = f.read()

import re
old_waitlist = '''recent_waitlist = []
    if user.role == "owner":
        recent_waitlist = db.query(Waitlist).filter(Waitlist.status.in_(["trial", "new"])).limit(3).all()'''
new_waitlist = 'recent_waitlist = db.query(Waitlist).filter(Waitlist.status.in_(["trial", "new"])).limit(3).all()'
text = text.replace(old_waitlist, new_waitlist)
with open('routers/dashboard.py', 'w') as f:
    f.write(text)
