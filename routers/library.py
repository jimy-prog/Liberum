from fastapi import APIRouter, Request, Depends, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from database import get_db, Student, Group
from master_database import SessionMaster, User, LibraryBook, GrammarTopic, GrammarQuestion, GrammarQuizAttempt
from auth import get_current_user

router = APIRouter(prefix="/library")
templates = Jinja2Templates(directory="templates")

# =======================
# STUDENT ROUTES
# =======================

@router.get("/")
def library_home(request: Request):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    return templates.TemplateResponse("library/student_home.html", {
        "request": request, "user": user, "active_page": "library"
    })

@router.get("/books")
def list_books(request: Request):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    master_db = SessionMaster()
    try:
        # Get books for the tenant, or global books (tenant_id == None)
        books = master_db.query(LibraryBook).filter(
            (LibraryBook.tenant_id == user.tenant_id) | (LibraryBook.tenant_id == None)
        ).order_by(LibraryBook.created_at.desc()).all()
    finally:
        master_db.close()

    return templates.TemplateResponse("library/student_books.html", {
        "request": request, "user": user, "books": books, "active_page": "library"
    })

@router.get("/grammar")
def list_grammar(request: Request):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    master_db = SessionMaster()
    try:
        topics = master_db.query(GrammarTopic).order_by(GrammarTopic.level, GrammarTopic.title).all()
        
        # Get user's attempts
        attempts = master_db.query(GrammarQuizAttempt).filter_by(
            tenant_id=user.tenant_id, student_id=user.id
        ).all()
        
        # Create a map of topic_id -> best score
        progress = {}
        for a in attempts:
            pct = (a.score / a.total_questions) * 100 if a.total_questions > 0 else 0
            if a.topic_id not in progress or pct > progress[a.topic_id]:
                progress[a.topic_id] = pct
                
    finally:
        master_db.close()

    return templates.TemplateResponse("library/student_grammar.html", {
        "request": request, "user": user, "topics": topics, 
        "progress": progress, "active_page": "library"
    })

@router.get("/grammar/{topic_id}")
def grammar_detail(request: Request, topic_id: int):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    master_db = SessionMaster()
    try:
        topic = master_db.query(GrammarTopic).get(topic_id)
        if not topic: raise HTTPException(status_code=404)
        has_questions = len(topic.questions) > 0
    finally:
        master_db.close()

    return templates.TemplateResponse("library/student_grammar_detail.html", {
        "request": request, "user": user, "topic": topic,
        "has_questions": has_questions, "active_page": "library"
    })

@router.get("/grammar/{topic_id}/test")
def grammar_test(request: Request, topic_id: int):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    master_db = SessionMaster()
    try:
        topic = master_db.query(GrammarTopic).get(topic_id)
        if not topic: raise HTTPException(status_code=404)
        questions = topic.questions
    finally:
        master_db.close()

    return templates.TemplateResponse("library/student_grammar_test.html", {
        "request": request, "user": user, "topic": topic,
        "questions": questions, "active_page": "library"
    })

@router.post("/grammar/{topic_id}/submit")
async def submit_grammar_test(request: Request, topic_id: int):
    user = get_current_user(request)
    if not user: return JSONResponse({"error": "Unauthorized"}, status_code=401)
    
    form_data = await request.form()
    
    master_db = SessionMaster()
    try:
        topic = master_db.query(GrammarTopic).get(topic_id)
        if not topic: raise HTTPException(status_code=404)
        
        score = 0
        total = len(topic.questions)
        
        for q in topic.questions:
            ans = form_data.get(f"q_{q.id}")
            if ans == q.correct_option:
                score += 1
                
        attempt = GrammarQuizAttempt(
            tenant_id=user.tenant_id,
            student_id=user.id,
            topic_id=topic.id,
            score=score,
            total_questions=total
        )
        master_db.add(attempt)
        master_db.commit()
        
    finally:
        master_db.close()
        
    return RedirectResponse(f"/library/grammar/{topic_id}?score={score}&total={total}", status_code=303)


# =======================
# TEACHER ROUTES
# =======================

@router.get("/teacher")
def library_teacher_dashboard(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request)
    if not user or user.role not in ["teacher", "owner"]: 
        return RedirectResponse("/login", status_code=303)
        
    master_db = SessionMaster()
    try:
        # Get all students the teacher teaches
        # For simplicity in demo, just get all students in tenant
        students = db.query(Student).all()
        student_ids = [s.id for s in students]
        
        attempts = master_db.query(GrammarQuizAttempt).filter(
            GrammarQuizAttempt.tenant_id == user.tenant_id
        ).order_by(GrammarQuizAttempt.created_at.desc()).limit(50).all()
        
        topics = master_db.query(GrammarTopic).all()
        topic_map = {t.id: t.title for t in topics}
        
    finally:
        master_db.close()
        
    # Map internal student_id (User.id) to Student (from DB) - wait, GrammarQuizAttempt.student_id is User.id or Student.id?
    # Actually, in our ecosystem, student login uses User.id. The tenant DB uses Student.id.
    # I will just pass attempts down and we can look up the user in master_db.
    
    master_db = SessionMaster()
    try:
        attempt_data = []
        for a in attempts:
            u = master_db.query(User).get(a.student_id)
            if u:
                attempt_data.append({
                    "student_name": u.full_name,
                    "topic": topic_map.get(a.topic_id, "Unknown"),
                    "score": a.score,
                    "total": a.total_questions,
                    "date": a.created_at.strftime("%Y-%m-%d %H:%M")
                })
    finally:
        master_db.close()

    return templates.TemplateResponse("library/teacher_dashboard.html", {
        "request": request, "user": user, "attempts": attempt_data, "active_page": "library"
    })
