import re
with open('routers/dashboard.py', 'r', encoding='utf-8') as f:
    text = f.read()

# Add get_group_epl import if not there
if 'from finance_rules import get_group_epl' not in text:
    text = text.replace('from database import ', 'from finance_rules import get_group_epl\nfrom database import ')

history_logic = """
    # 6 Month History
    history = []
    def nm(d):
        if d.month == 12: return date(d.year+1,1,1)
        return date(d.year, d.month+1, 1)

    for i in range(5,-1,-1):
        m2 = ms.month - i; y2 = ms.year
        while m2 <= 0: m2 += 12; y2 -= 1
        hms = date(y2, m2, 1); hme = nm(hms)
        h_inc = 0
        h_groups = db.query(Group).join(Lesson).filter(Lesson.date>=hms, Lesson.date<hme).distinct().all()
        for g in h_groups:
            gc = db.query(Attendance).join(Lesson).filter(
                Lesson.date>=hms, Lesson.date<hme, Lesson.status=="Held",
                Attendance.status.in_(["Present","Absent"]), Lesson.group_id==g.id
            ).count()
            epl = get_group_epl(db, g)
            h_inc += round(gc * epl)
        history.append({"month_name": hms.strftime("%b"), "income": h_inc})
    
    max_history_income = max(h["income"] for h in history) if history else 0
"""

# Insert before return templates.TemplateResponse
text = re.sub(r'    notifications = db\.query\(Notification\)', history_logic + r'\n    notifications = db.query(Notification)', text)

# Pass history and max_history_income
text = text.replace('"groups_data": groups_data,', '"groups_data": groups_data, "history": history, "max_history_income": max_history_income,')

with open('routers/dashboard.py', 'w', encoding='utf-8') as f:
    f.write(text)
