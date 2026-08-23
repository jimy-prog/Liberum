import re
with open('routers/timetable_router.py', 'r', encoding='utf-8') as f:
    text = f.read()

new_routes = """
@router.get("/online")
def online_view(request: Request, db: Session = Depends(get_db)):
    return templates.TemplateResponse("online.html", {
        "request": request, "view": "online", "active_page": "timetable", "main_section": "schedule"
    })
"""

if '@router.get("/online")' not in text:
    text = text.replace('@router.post("/lesson/{lid}/status")', new_routes + '\n@router.post("/lesson/{lid}/status")')

with open('routers/timetable_router.py', 'w', encoding='utf-8') as f:
    f.write(text)
