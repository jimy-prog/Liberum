from fastapi import APIRouter, Request, Depends, Form, Header, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date, Boolean, or_
from sqlalchemy.orm import Session, relationship
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional
from database import get_db, Base, Group, Student, Settings, PlacementSession
from student_history import log_student_event
from auth import get_current_user

router = APIRouter(prefix="/waitlist")
templates = Jinja2Templates(directory="templates")

class WaitlistEntry(Base):
    __tablename__ = "waitlist"
    __table_args__ = {"extend_existing": True}
    id                 = Column(Integer, primary_key=True)
    name               = Column(String, nullable=False)
    phone              = Column(String, default="")
    parent_phone       = Column(String, default="")
    desired_group_id   = Column(Integer, ForeignKey("groups.id"), nullable=True)
    preferred_schedule = Column(String, default="")
    how_found          = Column(String, default="")
    learning_goal      = Column(Text, default="")
    notes              = Column(Text, default="")
    status             = Column(String, default="new")  # new/contacted/trial/enrolled
    mode               = Column(String, default="in-person")  # in-person/online
    trial_date         = Column(Date, nullable=True)
    trial_done         = Column(Boolean, default=False)
    enquiry_date       = Column(Date, default=date.today)
    created_at         = Column(DateTime, default=datetime.utcnow)
    desired_group      = relationship("Group")
    level              = Column(String, default="")



STATUS_LABELS = {
    "new":       ("New Enquiry",   "pill-orange"),
    "contacted": ("Contacted",     "pill-blue"),
    "trial":     ("Trial Lesson",  "pill-yellow"),
    "enrolled":  ("Enrolled",      "pill-green"),
}
HOW_FOUND = ["Instagram","Friend/Referral","Telegram","Google","Company","Other"]


@router.get("/")
def waitlist_view(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request)
    if not user or user.role not in {"owner", "teacher"}:
        return RedirectResponse("/mock", status_code=302)

    entries = db.query(WaitlistEntry).filter(
        WaitlistEntry.status != "enrolled"
    ).order_by(WaitlistEntry.enquiry_date.desc()).all()
    groups = db.query(Group).filter(Group.status == "active").all()
    
    active_sessions = db.query(PlacementSession).filter(
        PlacementSession.status.in_(["pending", "active"])
    ).order_by(PlacementSession.id.desc()).all()
    completed_sessions = db.query(PlacementSession).filter(
        PlacementSession.status == "completed"
    ).order_by(PlacementSession.completed_at.desc()).all()

    return templates.TemplateResponse("waitlist.html", {
        "request": request, "entries": entries,
        "groups": groups, "status_labels": STATUS_LABELS,
        "how_found_options": HOW_FOUND,
        "active_page": "waitlist",
        "active_sessions": active_sessions,
        "completed_sessions": completed_sessions
    })



@router.post("/add")
def add_entry(
    name: str = Form(...), phone: str = Form(""),
    parent_phone: str = Form(""), desired_group_id: str = Form(""),
    preferred_schedule: str = Form(""), how_found: str = Form(""),
    learning_goal: str = Form(""), notes: str = Form(""),
    mode: str = Form("in-person"),
    db: Session = Depends(get_db)
):
    if phone.strip():
        banned_match = db.query(Student).filter(
            Student.banned == True,
            or_(
                Student.phone == phone.strip(),
                Student.parent_phone == phone.strip()
            )
        ).first()
        if banned_match:
            return RedirectResponse("/waitlist/?err=banned_phone", status_code=303)

    db.add(WaitlistEntry(
        name=name, phone=phone, parent_phone=parent_phone,
        desired_group_id=int(desired_group_id) if desired_group_id else None,
        preferred_schedule=preferred_schedule, how_found=how_found,
        learning_goal=learning_goal, notes=notes,
        mode=mode, status="new", enquiry_date=date.today()
    ))
    db.commit()
    return RedirectResponse("/waitlist/", status_code=303)

@router.post("/{eid}/status")
def update_status(eid: int, status: str = Form(...),
                  db: Session = Depends(get_db)):
    e = db.query(WaitlistEntry).get(eid)
    if e: e.status = status; db.commit()
    return RedirectResponse("/waitlist/", status_code=303)

@router.post("/{eid}/trial")
def set_trial(eid: int, trial_date: str = Form(...),
              db: Session = Depends(get_db)):
    e = db.query(WaitlistEntry).get(eid)
    if e:
        e.trial_date = date.fromisoformat(trial_date)
        e.status = "trial"
        db.commit()
    return RedirectResponse("/waitlist/", status_code=303)

@router.post("/{eid}/trial-done")
def trial_done(eid: int, db: Session = Depends(get_db)):
    e = db.query(WaitlistEntry).get(eid)
    if e: e.trial_done = True; db.commit()
    return RedirectResponse("/waitlist/", status_code=303)

@router.post("/{eid}/enroll")
def enroll_student(eid: int, group_id: int = Form(...),
                   level: str = Form(""),
                   db: Session = Depends(get_db)):
    e = db.query(WaitlistEntry).get(eid)
    if not e:
        return RedirectResponse("/waitlist/", status_code=303)
    banned_match = None
    if (e.phone or "").strip():
        banned_match = db.query(Student).filter(
            Student.banned == True,
            or_(
                Student.phone == e.phone.strip(),
                Student.parent_phone == e.phone.strip()
            )
        ).first()
    if banned_match:
        return RedirectResponse("/waitlist/?err=banned_phone", status_code=303)

    s = Student(
        name=e.name, group_id=group_id, phone=e.phone,
        parent_phone=e.parent_phone, level=level,
        notes=e.learning_goal, active=True, archived=False,
        start_date=date.today()
    )
    db.add(s)
    db.flush()
    log_student_event(
        db, student=s, event_type="created", source="waitlist",
        details=(
            f"Enrolled from waitlist entry #{e.id}. "
            f"Mode={e.mode}, Preferred schedule={e.preferred_schedule or '-'}, "
            f"How found={e.how_found or '-'}, Goal={e.learning_goal or '-'}"
        )
    )
    e.status = "enrolled"
    db.commit()
    return RedirectResponse("/students/", status_code=303)

@router.post("/{eid}/log-call")
def log_call_waitlist(eid: int, db: Session = Depends(get_db)):
    e = db.query(WaitlistEntry).get(eid)
    if e:
        # Keep lightweight event trail even before full enrollment.
        db.add(Settings(
            key=f"waitlist_call_log_{eid}_{datetime.utcnow().timestamp()}",
            value=f"{e.name}|{e.phone}|{date.today()}",
            label="waitlist_call_log",
            category="audit"
        ))
        db.commit()
    return JSONResponse({"ok": True})

@router.post("/{eid}/delete")
def delete_entry(eid: int, db: Session = Depends(get_db)):
    e = db.query(WaitlistEntry).get(eid)
    if e: db.delete(e); db.commit()
    return RedirectResponse("/waitlist/", status_code=303)
