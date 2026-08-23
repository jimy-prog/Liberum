with open("routers/timetable_router.py", "r") as f:
    text = f.read()

import re
old = '''@router.get("/monthly")
def monthly_view(request: Request, db: Session = Depends(get_db)):
    # Render calendar.html as a mock month view
    return templates.TemplateResponse("calendar.html", {
        "request": request, "view": "monthly", "active_page": "timetable", "main_section": "schedule"
    })'''

new = '''@router.get("/monthly")
def monthly_view(request: Request, db: Session = Depends(get_db)):
    from datetime import date, timedelta
    today = date.today()
    ms = today.replace(day=1)
    pm = (ms - timedelta(days=1)).replace(day=1)
    nm = (ms + timedelta(days=32)).replace(day=1)
    
    return templates.TemplateResponse("calendar.html", {
        "request": request, "view": "monthly", "active_page": "timetable", "main_section": "schedule",
        "month_start": ms, "prev_month": pm.strftime("%Y-%m"), "next_month": nm.strftime("%Y-%m"),
        "today_month": ms.strftime("%Y-%m"),
        "cal_weeks": [[{"date": ms, "is_current": True, "is_today": True, "count": 2, "groups": []}]]*4 # simple mock
    })'''

text = text.replace(old, new)
with open("routers/timetable_router.py", "w") as f:
    f.write(text)
