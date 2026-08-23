import re

with open('routers/performance.py', 'r', encoding='utf-8') as f:
    text = f.read()

new_code = """
    from auth import get_current_user
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/login?next=/performance/", status_code=302)
    today = date.today()
"""

text = text.replace('    today = date.today()', new_code)
text = text.replace('"request": request, "groups": groups, "sel_group": sel_group,', '"request": request, "user": user, "groups": groups, "sel_group": sel_group,')

with open('routers/performance.py', 'w', encoding='utf-8') as f:
    f.write(text)
