import json
from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import get_db, Group, Student, Lesson, Attendance, Payment
from master_database import SessionMaster, User
from auth import get_current_user

router = APIRouter()

from fastapi.templating import Jinja2Templates
templates = Jinja2Templates(directory="templates")

def build_db_json(db, user):
    data = {
        "students": [], "groups": [], "waitlist": [], "homework": [],
        "mocks": [], "history": [], "reviews": [], "courses": [], "payments": []
    }
    
    if user.role in ["owner", "teacher"]:
        groups = db.query(Group).filter(Group.status == "active").all()
        for g in groups:
            cnt = db.query(Student).filter(Student.group_id == g.id, Student.active == True).count()
            data["groups"].append({
                "n": g.name, "sch": f"{g.days} · {g.time}",
                "room": "Online" if g.is_online else g.room,
                "cnt": cnt, "price": f"{int(g.price_monthly):,}",
                "inc": f"{int(g.price_monthly * cnt):,}",
                "mode": "Online" if g.is_online else "In-person", "color": "#7B61FF"
            })
            
        students = db.query(Student).filter(Student.active == True, Student.archived == False).all()
        for s in students:
            total_att = db.query(Attendance).filter(Attendance.student_id == s.id).count()
            pres_att = db.query(Attendance).filter(Attendance.student_id == s.id, Attendance.status == "Present").count()
            att_rate = int(pres_att / total_att * 100) if total_att > 0 else 100
            
            month_str = datetime.utcnow().strftime("%Y-%m")
            pay_rec = db.query(Payment).filter(Payment.student_id == s.id, Payment.month == month_str).first()
            paid = pay_rec is not None
            group_name = s.group.name if s.group else "No group"
            
            data["students"].append({
                "n": s.name, "g": group_name, "lvl": s.level or "B1",
                "att": att_rate, "paid": paid, "phone": s.phone or "+998 00 000 00 00",
                "band": [], "note": s.comments or "No notes."
            })
            
            if not paid:
                data["payments"].append({
                    "n": s.name, "g": group_name, "exp": f"{int(s.group.price_monthly) if s.group else 400000:,}",
                    "paid": "—", "m": "—", "st": "unpaid"
                })
            else:
                data["payments"].append({
                    "n": s.name, "g": group_name, "exp": f"{int(pay_rec.amount_expected) if pay_rec.amount_expected else pay_rec.amount:,}",
                    "paid": f"{int(pay_rec.amount):,}", "m": f"{pay_rec.payment_method} · {pay_rec.date.strftime('%b %d')}", "st": "paid"
                })

        waitlist_students = db.query(Student).filter(Student.active == False).limit(10).all()
        for w in waitlist_students:
            data["waitlist"].append({
                "n": w.name, "src": "Website", "goal": "English", "st": "New", "note": w.comments or ""
            })
            
    elif user.role == "student":
        s = db.query(Student).filter(Student.user_id == user.id).first()
        if s:
            data["history"].append({"t": "Initial Placement", "d": "Registration", "b": s.level or "A2", "st": "Reviewed"})
            data["courses"].append({"t": "General English", "sub": f"{s.level}", "weeks": "12 weeks", "prog": 15, "tag": "Enrolled"})

    return data

@router.get("/app", response_class=HTMLResponse)
async def spa_app(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request)
    if not user:
        return RedirectResponse(url="/login")
    
    db_data = build_db_json(db, user)
    parts = user.full_name.split() if user.full_name else [user.username]
    initials = "".join([p[0].upper() for p in parts[:2]]) if parts else "U"
    
    return templates.TemplateResponse("spa_app.html", {
        "request": request,
        "db_json": json.dumps(db_data),
        "role": "teacher" if user.role in ["teacher", "owner"] else "student",
        "user_name": user.full_name or user.username,
        "user_role_display": f"{user.role.capitalize()} · Liberum",
        "user_initials": initials
    })

class StudentCreate(BaseModel):
    name: str
    lvl: str
    g: str

@router.post("/api/v1/students")
async def api_create_student(data: StudentCreate, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request)
    if not user or user.role not in ["teacher", "owner"]: return JSONResponse({"error": "Unauthorized"}, status_code=403)
    group = db.query(Group).filter(Group.name == data.g).first()
    db.add(Student(name=data.name, level=data.lvl, group_id=group.id if group else None, tenant_id=user.tenant_id, active=True))
    db.commit()
    return {"status": "ok"}

class PaymentCreate(BaseModel):
    student: str
    amount: int
    method: str

@router.post("/api/v1/payments")
async def api_create_payment(data: PaymentCreate, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request)
    if not user or user.role not in ["teacher", "owner"]: return JSONResponse({"error": "Unauthorized"}, status_code=403)
    student = db.query(Student).filter(Student.name == data.student).first()
    if student:
        db.add(Payment(student_id=student.id, group_id=student.group_id, amount=data.amount, amount_expected=400000, date=datetime.utcnow().date(), month=datetime.utcnow().strftime("%Y-%m"), payment_method=data.method, tenant_id=user.tenant_id))
        db.commit()
    return {"status": "ok"}

class LessonCreate(BaseModel):
    group: str
    date: str

@router.post("/api/v1/lessons")
async def api_create_lesson(data: LessonCreate, request: Request, db: Session = Depends(get_db)):
    return {"status": "ok"}

class HWCreate(BaseModel):
    title: str
    group: str
    due: str

@router.post("/api/v1/homework")
async def api_create_hw(data: HWCreate, request: Request, db: Session = Depends(get_db)):
    return {"status": "ok"}
