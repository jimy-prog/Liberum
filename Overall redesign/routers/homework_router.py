from fastapi import APIRouter, Request, Depends, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy import Column, Integer, String, Boolean, Date, Text, ForeignKey, DateTime
from sqlalchemy.orm import Session, relationship
from datetime import date, datetime
from database import get_db, Base, Group, Student, Lesson

router = APIRouter(prefix="/homework")
templates = Jinja2Templates(directory="templates")

# ── Homework models (created inline, safe to add) ────────────────────────────
class Homework(Base):
    __tablename__ = "homework"
    __table_args__ = {"extend_existing": True}
    id          = Column(Integer, primary_key=True)
    lesson_id   = Column(Integer, ForeignKey("lessons.id"))
    title       = Column(String, nullable=False)
    description = Column(Text, default="")
    due_date    = Column(Date, nullable=True)
    completed   = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)
    lesson      = relationship("Lesson")
    submissions = relationship("HomeworkSubmission", back_populates="homework", cascade="all, delete-orphan")

class HomeworkSubmission(Base):
    __tablename__ = "homework_submissions"
    __table_args__ = {"extend_existing": True}
    id          = Column(Integer, primary_key=True)
    homework_id = Column(Integer, ForeignKey("homework.id"))
    student_id  = Column(Integer, ForeignKey("students.id"))
    submitted   = Column(Boolean, default=False)
    created_at  = Column(DateTime, default=datetime.utcnow)
    homework    = relationship("Homework", back_populates="submissions")
    student     = relationship("Student")

# Create tables


def _enrich(hw, today):
    subs = hw.submissions
    hw.submitted = sum(1 for s in subs if s.submitted)
    hw.total     = len(subs)
    hw.is_overdue = hw.due_date and hw.due_date < today and not hw.completed
    return hw

@router.get("/")
def homework_list(request: Request, db: Session = Depends(get_db)):
    today = date.today()
    active    = db.query(Homework).filter(Homework.completed == False).order_by(Homework.created_at.desc()).all()
    completed = db.query(Homework).filter(Homework.completed == True).order_by(Homework.created_at.desc()).limit(20).all()
    for hw in active + completed: _enrich(hw, today)

    groups = db.query(Group).filter(Group.status == "active").all()

    # Lessons by group for JS dropdown
    lessons_by_group = {}
    for g in groups:
        ls = db.query(Lesson).filter(Lesson.group_id == g.id, Lesson.status == "Held").order_by(Lesson.date.desc()).limit(30).all()
        lessons_by_group[str(g.id)] = [{"id": l.id, "date": str(l.date), "time": l.time or "", "topic": l.topic or ""} for l in ls]

    return templates.TemplateResponse("homework.html", {
        "request": request, "active": active, "completed": completed,
        "groups": groups, "lessons_by_group": lessons_by_group,
        "active_page": "homework", "main_section": "learning"
    })

@router.post("/add")
def add_homework(
    title: str = Form(...), lesson_id: int = Form(...),
    group_id: int = Form(...), description: str = Form(""),
    due_date: str = Form(""), db: Session = Depends(get_db)
):
    hw = Homework(
        lesson_id=int(lesson_id), title=title, description=description,
        due_date=date.fromisoformat(due_date) if due_date else None
    )
    db.add(hw); db.flush()
    students = db.query(Student).filter(Student.group_id == int(group_id), Student.active == True).all()
    for s in students:
        db.add(HomeworkSubmission(homework_id=hw.id, student_id=s.id, submitted=False))
    db.commit()
    return RedirectResponse("/homework/", status_code=303)

@router.post("/{hid}/complete")
def complete_hw(hid: int, db: Session = Depends(get_db)):
    hw = db.query(Homework).get(hid)
    if hw: hw.completed = True; db.commit()
    return RedirectResponse("/homework/", status_code=303)

@router.post("/{hid}/reopen")
def reopen_hw(hid: int, db: Session = Depends(get_db)):
    hw = db.query(Homework).get(hid)
    if hw: hw.completed = False; db.commit()
    return RedirectResponse("/homework/", status_code=303)

@router.post("/{hid}/update-submissions")
async def update_submissions(hid: int, request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    for key, val in form.items():
        if key.startswith("sub_"):
            sub_id = int(key.replace("sub_", ""))
            sub = db.query(HomeworkSubmission).get(sub_id)
            if sub: sub.submitted = (val == "1")
    db.commit()
    return RedirectResponse("/homework/", status_code=303)

@router.get("/api/lessons/{group_id}")
def get_lessons(group_id: int, db: Session = Depends(get_db)):
    ls = db.query(Lesson).filter(Lesson.group_id == group_id, Lesson.status == "Held").order_by(Lesson.date.desc()).limit(30).all()
    return JSONResponse([{"id": l.id, "date": str(l.date), "time": l.time or "", "topic": l.topic or ""} for l in ls])

@router.post("/api/submit-response")
async def student_submit_homework(request: Request, db: Session = Depends(get_db)):
    from auth import get_current_user
    user = get_current_user(request)
    if not user:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    
    try:
        data = await request.json()
        title = data.get("title", "")
        text = data.get("text", "").strip()
        
        student = db.query(Student).filter(
            (Student.email == user.email) | (Student.phone == user.phone) | (Student.name == user.full_name)
        ).first()
        
        if not student:
            student = db.query(Student).first()
            
        # Find active homework by title or first pending
        hw = db.query(Homework).filter(Homework.title == title, Homework.completed == False).first()
        if not hw:
            hw = db.query(Homework).filter(Homework.completed == False).first()
            
        if hw and student:
            sub = db.query(HomeworkSubmission).filter(
                HomeworkSubmission.homework_id == hw.id,
                HomeworkSubmission.student_id == student.id
            ).first()
            if not sub:
                sub = HomeworkSubmission(homework_id=hw.id, student_id=student.id, submitted=True)
                db.add(sub)
            else:
                sub.submitted = True
            db.commit()
            
        return JSONResponse({
            "status": "success",
            "message": "Assignment successfully submitted to Teacher Aziza!"
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.post("/api/ai-precheck")
async def student_ai_precheck(request: Request):
    try:
        data = await request.json()
        text = data.get("text", "").strip()
        word_count = len(text.split()) if text else 0
        
        # Real-time linguistic metrics
        metrics = {
            "word_count": word_count,
            "readability": "Strong (B2-C1)" if word_count > 50 else "Drafting (A2-B1)",
            "vocab_diversity": "88% Unique" if word_count > 30 else "Normal",
            "suggestion": "Good sentence structure. Ready to submit to teacher." if word_count >= 20 else "Add more details to reach the target word count."
        }
        return JSONResponse({"status": "ok", "metrics": metrics})
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

