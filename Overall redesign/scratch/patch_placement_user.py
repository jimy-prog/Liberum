import re

with open('routers/placement.py', 'r', encoding='utf-8') as f:
    text = f.read()

new_code = """
    from auth import get_current_user
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/login?next=/placement/", status_code=302)
    active_sessions = db.query(PlacementSession).filter(
"""

text = text.replace('    active_sessions = db.query(PlacementSession).filter(', new_code)
text = text.replace('"request": request, "active_sessions": active_sessions,', '"request": request, "user": user, "active_sessions": active_sessions,')

with open('routers/placement.py', 'w', encoding='utf-8') as f:
    f.write(text)
