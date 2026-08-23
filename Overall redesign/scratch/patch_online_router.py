with open("routers/timetable_router.py", "r") as f:
    text = f.read()

import re
old_online = '''def online_view(request: Request, db: Session = Depends(get_db)):
    return templates.TemplateResponse("online.html", {
        "request": request, "view": "online", "active_page": "timetable", "main_section": "schedule"
    })'''

new_online = '''def online_view(request: Request, db: Session = Depends(get_db)):
    online_groups = db.query(Group).filter(Group.status == 'active', Group.mode == 'Online').all()
    students_count = sum(len(g.students) for g in online_groups)
    income = sum((g.price_monthly or g.price_per_lesson or 0) * len(g.students) for g in online_groups)
    
    return templates.TemplateResponse("online.html", {
        "request": request, "view": "online", "active_page": "timetable", "main_section": "schedule",
        "online_groups": online_groups, "students_count": students_count, "income": income
    })'''

text = text.replace(old_online, new_online)
with open("routers/timetable_router.py", "w") as f:
    f.write(text)
