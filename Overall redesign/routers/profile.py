from fastapi import APIRouter, Request, Depends, Form, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import Session
from datetime import datetime
from master_database import User, SessionMaster, StudentProfile
from database import get_db, Base, Settings, Group, Student
import os, shutil

router = APIRouter(prefix="/profile")
templates = Jinja2Templates(directory="templates")
os.makedirs("./uploads/profile", exist_ok=True)

class TeacherProfile(Base):
    __tablename__ = "teacher_profile"
    __table_args__ = {"extend_existing": True}
    id=Column(Integer,primary_key=True); name=Column(String,default="")
    title=Column(String,default=""); bio=Column(Text,default="")
    phone=Column(String,default=""); email=Column(String,default="")
    school_name=Column(String,default="")
    bank_details=Column(Text,default=""); photo_path=Column(String,default="")
    created_at=Column(DateTime,default=datetime.utcnow)


def get_profile(db, current_user=None):
    p = db.query(TeacherProfile).first()
    if not p:
        p = TeacherProfile(
            name=current_user.full_name if current_user else "",
            title="",
            school_name=""
        )
        db.add(p)
        db.commit()
        db.refresh(p)
    else:
        # Clean up legacy placeholders if they exist
        modified = False
        if p.name == "Jamshid" and current_user:
            p.name = current_user.full_name
            modified = True
        elif not p.name and current_user:
            p.name = current_user.full_name
            modified = True
            
        if p.title == "English Teacher":
            p.title = ""
            modified = True
        if p.school_name == "Language Vision":
            p.school_name = ""
            modified = True
            
        if modified:
            db.commit()
            db.refresh(p)
    return p

def get_student_profile(mdb, user_id: int):
    sp = mdb.query(StudentProfile).filter_by(user_id=user_id).first()
    if not sp:
        sp = StudentProfile(
            user_id=user_id,
            target_band=7.5,
            notif_results=True,
            notif_deadlines=True,
            notif_product=False
        )
        mdb.add(sp)
        mdb.commit()
        mdb.refresh(sp)
    return sp

@router.get("/")
def profile_page(request: Request, db: Session = Depends(get_db)):
    current_user = getattr(request.state, "current_user", None)
    profile = get_profile(db, current_user)
    settings = {s.key: s for s in db.query(Settings).all()}
    groups = db.query(Group).order_by(Group.name).all()
    
    users = []
    student_profile = None
    if current_user:
        mdb = SessionMaster()
        try:
            if current_user.role == "student":
                student_profile = get_student_profile(mdb, current_user.id)
            else:
                users_list = mdb.query(User).filter_by(tenant_id=current_user.tenant_id).order_by(User.created_at.asc()).all()
                for u in users_list:
                    mdb.expunge(u)
                users = users_list
        finally:
            mdb.close()

    tab = request.query_params.get("tab", "profile")
    if current_user:
        if tab == "finance" and current_user.role not in ["owner", "teacher"]:
            tab = "profile"
        elif tab == "system" and current_user.role != "owner":
            tab = "profile"
            
    return templates.TemplateResponse("settings_page.html", {
        "request": request,
        "profile": profile,
        "student_profile": student_profile,
        "settings": settings,
        "groups": groups,
        "users": users,
        "tab": tab,
        "active_page": "settings",
        "main_section": "settings",
        "current_user": current_user,
    })

@router.post("/update")
async def update_profile(request: Request, db: Session = Depends(get_db)):
    current_user = getattr(request.state, "current_user", None)
    form = await request.form()
    
    if current_user and current_user.role == "student":
        # Wire student profile updates in master_database
        full_name = form.get("full_name", "").strip()
        phone = form.get("phone", "").strip()
        parent_phone = form.get("parent_phone", "").strip()
        target_band_val = form.get("target_band", "")
        try:
            target_band = float(target_band_val) if target_band_val else 7.5
        except (ValueError, TypeError):
            target_band = 7.5
            
        notif_results = form.get("notif_results") in ["1", "true", "on", True]
        notif_deadlines = form.get("notif_deadlines") in ["1", "true", "on", True]
        notif_product = form.get("notif_product") in ["1", "true", "on", True]
        
        mdb = SessionMaster()
        try:
            u = mdb.query(User).filter_by(id=current_user.id).first()
            if u and full_name:
                u.full_name = full_name
            
            sp = get_student_profile(mdb, current_user.id)
            sp.phone = phone
            sp.parent_phone = parent_phone
            sp.target_band = target_band
            sp.notif_results = notif_results
            sp.notif_deadlines = notif_deadlines
            sp.notif_product = notif_product
            mdb.commit()
        finally:
            mdb.close()
            
        # Also sync to tenant Student table if found by name or email
        try:
            st = db.query(Student).filter((Student.email == current_user.email) | (Student.name == current_user.full_name)).first()
            if st:
                if full_name:
                    st.name = full_name
                if phone:
                    st.phone = phone
                if parent_phone:
                    st.parent_phone = parent_phone
                db.commit()
        except Exception:
            pass
            
        return RedirectResponse("/profile/?saved=1", status_code=303)

    # Teacher / Owner Profile Update
    p = get_profile(db, current_user)
    for f in ["name", "title", "bio", "phone", "email", "school_name", "bank_details"]:
        if f in form:
            setattr(p, f, form[f])
    db.commit()
    
    # Sync full_name back to Master User if provided
    new_full_name = form.get("name") or form.get("full_name")
    if current_user and new_full_name:
        mdb = SessionMaster()
        try:
            u = mdb.query(User).filter_by(id=current_user.id).first()
            if u:
                u.full_name = new_full_name.strip()
                mdb.commit()
        finally:
            mdb.close()

    return RedirectResponse("/profile/?tab=profile&saved=1", status_code=303)

@router.post("/upload-photo")
async def upload_photo(request: Request, photo: UploadFile = File(...), db: Session = Depends(get_db)):
    current_user = getattr(request.state, "current_user", None)
    p = get_profile(db, current_user)
    if photo.filename:
        ext = photo.filename.rsplit(".", 1)[-1]
        path = f"./uploads/profile/teacher_photo.{ext}"
        with open(path, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        p.photo_path = f"/uploads/profile/teacher_photo.{ext}"
        db.commit()
@router.post("/change-password")
async def change_password_route(
    request: Request,
    current_password: str = Form(""),
    new_password: str = Form(...),
):
    from auth import get_current_user, verify_pw, hash_pw
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/login", status_code=303)
    
    mdb = SessionMaster()
    try:
        db_user = mdb.query(User).filter_by(id=user.id).first()
        if not db_user:
            return RedirectResponse("/settings?error=user_not_found", status_code=303)
        
        # If user has an existing password, verify current password
        if db_user.password_hash:
            if not current_password or not verify_pw(current_password, db_user.password_hash):
                return RedirectResponse("/settings?error=wrong_current_password", status_code=303)
        
        db_user.password_hash = hash_pw(new_password)
        mdb.commit()
    finally:
        mdb.close()
        
    return RedirectResponse("/settings?success=password_updated", status_code=303)
