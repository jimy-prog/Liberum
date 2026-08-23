with open("routers/timetable_router.py", "r") as f:
    text = f.read()

if "@router.get(\"/monthly\")" not in text:
    route = '''
@router.get("/monthly")
def monthly_view(request: Request, db: Session = Depends(get_db)):
    # Render calendar.html as a mock month view
    return templates.TemplateResponse("calendar.html", {
        "request": request, "view": "monthly", "active_page": "timetable", "main_section": "schedule"
    })
'''
    text += route
    with open("routers/timetable_router.py", "w") as f:
        f.write(text)
