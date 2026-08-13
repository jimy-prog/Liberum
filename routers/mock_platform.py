from fastapi import APIRouter, Request, Depends, HTTPException, Form, UploadFile, File
import shutil
import os
import sys
import threading
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from services.ai_extractor import extract_ielts_exam_from_pdf
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from master_database import SessionMaster, MockExam, ExamSection, QuestionBlock, Question, AnswerOption, MockAttempt, AttemptAnswer, User, ClassMember, ReviewRequest, PlatformErrorLog
from auth import get_current_user

# --- Rate Limiting ---
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/mock", tags=["mock"])
limiter = Limiter(key_func=get_remote_address)
templates = Jinja2Templates(directory="templates")

def get_mdb():
    db = SessionMaster()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_class=HTMLResponse)
async def mock_dashboard(request: Request, db: SessionMaster = Depends(get_mdb)):
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/login?next=/mock", status_code=302)
        
    if user.role == "owner":
        exams = db.query(MockExam).all()
    else:
        exams = db.query(MockExam).filter(MockExam.is_published == True).all()
    
    return templates.TemplateResponse("mock_dashboard.html", {
        "request": request,
        "active_page": "mock",
        "user": user,
        "exams": exams
    })
