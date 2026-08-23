import re

with open('routers/lessons.py', 'r', encoding='utf-8') as f:
    text = f.read()

new_route = """
@router.get("/add")
def add_lesson_page(request: Request, db: Session = Depends(get_db)):
    groups = db.query(Group).filter(Group.status == "active").all()
    return templates.TemplateResponse("add_lesson.html", {
        "request": request, "groups": groups, "active_page": "timetable", "main_section": "schedule"
    })
"""

text = text.replace('@router.post("/add")', new_route + '\n@router.post("/add")')
# Also make it redirect to /timetable/weekly
text = text.replace('return RedirectResponse("/lessons", status_code=303)', 'return RedirectResponse("/timetable/weekly", status_code=303)')

with open('routers/lessons.py', 'w', encoding='utf-8') as f:
    f.write(text)
