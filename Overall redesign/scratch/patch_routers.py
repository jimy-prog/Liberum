import os
import re

mapping = {
    "dashboard": "home",
    "owner_dashboard": "home",
    "owner_updates": "users",
    "owner_users": "users",
    "manage_mocks": "mock",
    
    "timetable": "schedule",
    "classes": "schedule",
    "online": "schedule",
    
    "students": "students",
    "groups": "students",
    "waitlist": "students",
    "banned": "students",
    "performance": "students",
    "placement_dashboard": "students",
    
    "library": "learning",
    "books": "learning",
    "audio": "learning",
    "courses": "learning",
    "homework": "learning",
    
    "mock_dashboard": "mock",
    "mock_history": "mock",
    "reviews": "mock",
    
    "payments": "money",
    "debts": "money",
    "income": "money",
    "finance": "money",
    "monthly_report": "money",
    
    "settings": "settings",
    "archive": "settings"
}

for filename in os.listdir('routers'):
    if not filename.endswith('.py'):
        continue
    filepath = os.path.join('routers', filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def repl(m):
        active_val = m.group(1)
        main_sec = mapping.get(active_val, active_val)
        return f'"active_page": "{active_val}", "main_section": "{main_sec}"'

    new_content = re.sub(r'"active_page":\s*"([^"]+)"(?!\s*,\s*"main_section")', repl, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched {filename}")

