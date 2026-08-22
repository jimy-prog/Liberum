import re
with open('routers/dashboard.py', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('"active_page": "dashboard", "main_section": "home"', '"active_page": "dashboard", "main_section": "studio_home"')

with open('routers/dashboard.py', 'w', encoding='utf-8') as f:
    f.write(text)
