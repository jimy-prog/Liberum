import re

with open('routers/waitlist.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Add user = get_current_user(request) and if not user return redirect
new_code = """
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/login?next=/waitlist/", status_code=302)
    entries = db.query(WaitlistEntry).filter(
"""

text = text.replace('    entries = db.query(WaitlistEntry).filter(', new_code)
text = text.replace('"request": request, "entries": entries,', '"request": request, "user": user, "entries": entries,')

with open('routers/waitlist.py', 'w', encoding='utf-8') as f:
    f.write(text)
