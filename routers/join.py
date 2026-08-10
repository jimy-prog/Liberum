from fastapi import APIRouter, Request, Depends, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session, sessionmaker
from datetime import date

from database import get_db, get_tenant_engine
from master_database import SessionMaster, User
from routers.waitlist import WaitlistEntry

router = APIRouter(prefix="/join")
templates = Jinja2Templates(directory="templates")


@router.get("/{username}")
async def public_waitlist_form(request: Request, username: str):
    db_master = SessionMaster()
    try:
        user = db_master.query(User).filter(User.username == username).first()
        if not user or user.role not in ["teacher", "owner"]:
            raise HTTPException(status_code=404, detail="Waitlist not found")
        
        return templates.TemplateResponse("public_waitlist.html", {
            "request": request,
            "teacher_name": user.full_name or user.username,
            "username": username
        })
    finally:
        db_master.close()


@router.post("/{username}/submit")
async def submit_public_waitlist(
    request: Request,
    username: str,
    name: str = Form(...),
    phone: str = Form(...),
    parent_phone: str = Form(""),
    level: str = Form(""),
    mode: str = Form("in-person"),
    learning_goal: str = Form(""),
    notes: str = Form("")
):
    db_master = SessionMaster()
    try:
        user = db_master.query(User).filter(User.username == username).first()
        if not user or user.role not in ["teacher", "owner"]:
            raise HTTPException(status_code=404, detail="Waitlist not found")
        
        engine = get_tenant_engine(user.tenant.db_filename)
        SessionTenant = sessionmaker(bind=engine)
        tenant_db = SessionTenant()
        try:
            # Check for duplicates
            duplicate = tenant_db.query(WaitlistEntry).filter(
                WaitlistEntry.name == name,
                WaitlistEntry.phone == phone,
                WaitlistEntry.status != "enrolled",
                WaitlistEntry.enquiry_date == date.today()
            ).first()
            
            if not duplicate:
                entry = WaitlistEntry(
                    name=name,
                    phone=phone,
                    parent_phone=parent_phone,
                    level=level,
                    mode=mode,
                    learning_goal=learning_goal,
                    notes=notes,
                    status="new",
                    enquiry_date=date.today()
                )
                tenant_db.add(entry)
                tenant_db.commit()
                
        finally:
            tenant_db.close()
            
        return RedirectResponse(url=f"/join/{username}/success", status_code=303)
        
    finally:
        db_master.close()


@router.get("/{username}/success")
async def public_waitlist_success(request: Request, username: str):
    db_master = SessionMaster()
    try:
        user = db_master.query(User).filter(User.username == username).first()
        if not user or user.role not in ["teacher", "owner"]:
            raise HTTPException(status_code=404, detail="Waitlist not found")
        
        return templates.TemplateResponse("public_waitlist_success.html", {
            "request": request,
            "teacher_name": user.full_name or user.username
        })
    finally:
        db_master.close()
