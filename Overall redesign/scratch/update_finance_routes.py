with open("routers/finance.py", "r") as f:
    text = f.read()

import re

# We need to import Expense and Form
text = text.replace("from database import get_db, Group, Lesson, Attendance", "from database import get_db, Group, Lesson, Attendance, Expense, Student")
text = text.replace("from fastapi import APIRouter, Request, Depends", "from fastapi import APIRouter, Request, Depends, Form\nfrom fastapi.responses import RedirectResponse")

# Replace finance_view to actually query expenses
old_finance = '''    return templates.TemplateResponse("finance.html",{
        "request":request,"month_start":ms,"month_str":ms.strftime("%Y-%m"),
        "active_stats":active_stats,"active_income":active_income, "total_expense": 0, "net_income": active_income, "expenses": [],
        "active_countable":active_countable,"archived_stats":archived_stats,
        "archived_alltime":archived_alltime,"history":history,"active_page": "finance", "main_section": "money"
    })'''

new_finance = '''    expenses = db.query(Expense).filter(Expense.date >= ms, Expense.date < me).order_by(Expense.date.desc()).all()
    total_expense = sum(e.amount for e in expenses)
    net_income = active_income - total_expense

    return templates.TemplateResponse("finance.html",{
        "request":request,"month_start":ms,"month_str":ms.strftime("%Y-%m"),
        "active_stats":active_stats,"active_income":active_income, 
        "total_expense": total_expense, "net_income": net_income, "expenses": expenses,
        "active_countable":active_countable,"archived_stats":archived_stats,
        "archived_alltime":archived_alltime,"history":history,"active_page": "finance", "main_section": "money"
    })'''

text = text.replace(old_finance, new_finance)

# Add route to create expense and payroll view
new_routes = '''
@router.post("/expense")
def add_expense(
    amount: float = Form(...),
    description: str = Form(...),
    date_str: str = Form(None),
    db: Session = Depends(get_db)
):
    d = date.fromisoformat(date_str) if date_str else date.today()
    db.add(Expense(amount=amount, description=description, date=d))
    db.commit()
    return RedirectResponse("/finance/", status_code=303)

@router.get("/payroll")
def payroll_view(request: Request, month: str = None, db: Session = Depends(get_db)):
    today = date.today()
    if month:
        y,m = map(int,month.split("-")); ms = date(y,m,1)
    else:
        ms = today.replace(day=1)
    me = nm(ms)
    
    active_groups = db.query(Group).filter(Group.status=="active").all()
    payroll_data = []
    total_teacher_share = 0
    
    for g in active_groups:
        held = db.query(Lesson).filter(Lesson.group_id==g.id, Lesson.date>=ms, Lesson.date<me, Lesson.status=="Held").count()
        countable = db.query(Attendance).join(Lesson).filter(
            Lesson.group_id==g.id, Lesson.date>=ms, Lesson.date<me,
            Lesson.status=="Held", Attendance.status.in_(["Present","Absent"])
        ).count()
        
        epl = get_group_epl(db, g)
        group_revenue = countable * epl
        teacher_pct = getattr(g, "teacher_pct", 0) or 0
        if teacher_pct <= 0: teacher_pct = 0.4 # Default 40%
        
        teacher_share = group_revenue * teacher_pct
        total_teacher_share += teacher_share
        
        if group_revenue > 0:
            payroll_data.append({
                "group": g,
                "held": held,
                "countable": countable,
                "revenue": group_revenue,
                "teacher_pct": teacher_pct,
                "teacher_share": teacher_share
            })
            
    return templates.TemplateResponse("payroll.html", {
        "request": request, "month_str": ms.strftime("%Y-%m"), "month_start": ms,
        "payroll_data": payroll_data, "total_teacher_share": total_teacher_share,
        "active_page": "payroll", "main_section": "money"
    })
'''

if 'def payroll_view' not in text:
    text += new_routes
    with open("routers/finance.py", "w") as f:
        f.write(text)
