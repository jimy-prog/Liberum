from fastapi import APIRouter, Request, Depends, Form
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from datetime import date
from database import get_db, Group, Lesson, Attendance, Expense, Student
from finance_rules import get_group_epl
from auth import require_teacher_or_owner

router = APIRouter(prefix="/finance", dependencies=[Depends(require_teacher_or_owner)])
templates = Jinja2Templates(directory="templates")

def nm(d):
    if d.month == 12: return date(d.year+1,1,1)
    return date(d.year, d.month+1, 1)

def calc(db, group, ms, me):
    held = db.query(Lesson).filter(
        Lesson.group_id==group.id, Lesson.date>=ms,
        Lesson.date<me, Lesson.status=="Held").count()
    countable = db.query(Attendance).join(Lesson).filter(
        Lesson.group_id==group.id, Lesson.date>=ms, Lesson.date<me,
        Lesson.status=="Held",
        Attendance.status.in_(["Present","Absent"])).count()
    epl = get_group_epl(db, group)
    return {"group":group,"held":held,"countable":countable,
            "earn_per_lesson":round(epl),"income":round(countable*epl)}

@router.get("/")
def finance_view(request: Request, month: str = None, db: Session = Depends(get_db)):
    today = date.today()
    if month:
        y,m = map(int,month.split("-")); ms = date(y,m,1)
    else:
        ms = today.replace(day=1)
    me = nm(ms)

    active_groups   = db.query(Group).filter(Group.status=="active").all()
    active_stats    = [calc(db,g,ms,me) for g in active_groups]
    active_income   = sum(g["income"] for g in active_stats)
    active_countable= sum(g["countable"] for g in active_stats)

    archived_groups  = db.query(Group).filter(Group.status=="archived").all()
    archived_stats   = [calc(db,g,ms,me) for g in archived_groups]

    archived_alltime = []
    for g in archived_groups:
        first = db.query(Lesson).filter(Lesson.group_id==g.id,Lesson.status=="Held").order_by(Lesson.date).first()
        last  = db.query(Lesson).filter(Lesson.group_id==g.id,Lesson.status=="Held").order_by(Lesson.date.desc()).first()
        total_held = db.query(Lesson).filter(Lesson.group_id==g.id,Lesson.status=="Held").count()
        total_cnt  = db.query(Attendance).join(Lesson).filter(
            Lesson.group_id==g.id,Lesson.status=="Held",
            Attendance.status.in_(["Present","Absent"])).count()
        epl = get_group_epl(db, g)
        period = f"{first.date.strftime('%b %Y')} – {last.date.strftime('%b %Y')}" if first and last else "—"
        archived_alltime.append({"group":g,"period":period,"total_held":total_held,
                                  "total_countable":total_cnt,"total_income":round(total_cnt*epl)})

    history = []
    for i in range(5,-1,-1):
        m2=ms.month-i; y2=ms.year
        while m2<=0: m2+=12; y2-=1
        hms=date(y2,m2,1); hme=nm(hms)
        total=sum(calc(db,g,hms,hme)["income"] for g in active_groups)
        history.append({"month":hms.strftime("%b %Y"),"income":total})

    expenses = db.query(Expense).filter(Expense.date >= ms, Expense.date < me).order_by(Expense.date.desc()).all()
    total_expense = sum(e.amount for e in expenses)
    net_income = active_income - total_expense

    return templates.TemplateResponse("finance.html",{
        "request":request,"month_start":ms,"month_str":ms.strftime("%Y-%m"),
        "active_stats":active_stats,"active_income":active_income, 
        "total_expense": total_expense, "net_income": net_income, "expenses": expenses,
        "active_countable":active_countable,"archived_stats":archived_stats,
        "archived_alltime":archived_alltime,"history":history,"active_page": "finance", "main_section": "money"
    })

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
