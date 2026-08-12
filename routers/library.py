from fastapi import APIRouter, Request, Depends, Form, HTTPException, UploadFile, File
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from database import get_db, Student, Group
from master_database import SessionMaster, User, LibraryBook, GrammarTopic, GrammarQuestion, GrammarQuizAttempt
from auth import get_current_user
import os
import shutil

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
def list_books(request: Request, level: str = None):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    master_db = SessionMaster()
    try:
        query = master_db.query(LibraryBook)
        if level and level != "all":
            query = query.filter(LibraryBook.level == level)
            
        books = query.order_by(LibraryBook.created_at.desc()).all()
    finally:
        master_db.close()

    return templates.TemplateResponse("library/student_books.html", {
        "request": request, "user": user, "books": books, "active_page": "library"
    })

@router.get("/grammar/manage")
def manage_grammar(request: Request):
    user = get_current_user(request)
    if not user or user.role not in ["owner", "teacher"]:
        return RedirectResponse("/login", status_code=303)
        
    master_db = SessionMaster()
    try:
        topics = master_db.query(GrammarTopic).order_by(GrammarTopic.level, GrammarTopic.id).all()
        for t in topics:
            t.q_count = master_db.query(GrammarQuestion).filter_by(topic_id=t.id).count()
    finally:
        master_db.close()
        
    return templates.TemplateResponse("library/owner_grammar_manage.html", {
        "request": request, "user": user, "topics": topics, "active_page": "library"
    })

@router.get("/grammar/{topic_id}/edit")
def edit_grammar(request: Request, topic_id: int):
    user = get_current_user(request)
    if not user or user.role not in ["owner", "teacher"]:
        return RedirectResponse("/login", status_code=303)
        
    master_db = SessionMaster()
    try:
        topic = master_db.query(GrammarTopic).filter_by(id=topic_id).first()
        if not topic:
            return RedirectResponse("/library/grammar/manage", status_code=303)
            
        questions = master_db.query(GrammarQuestion).filter_by(topic_id=topic_id).all()
    finally:
        master_db.close()
        
    return templates.TemplateResponse("library/owner_grammar_edit.html", {
        "request": request, "user": user, "topic": topic, "questions": questions, "active_page": "library"
    })

@router.post("/grammar/{topic_id}/edit")
async def save_grammar(request: Request, topic_id: int, title: str = Form(...), explanation: str = Form(...), is_published: str = Form("off")):
    user = get_current_user(request)
    if not user or user.role not in ["owner", "teacher"]:
        return RedirectResponse("/login", status_code=303)
        
    master_db = SessionMaster()
    try:
        topic = master_db.query(GrammarTopic).filter_by(id=topic_id).first()
        if topic:
            topic.title = title
            topic.explanation = explanation
            topic.is_published = (is_published == "on")
            master_db.commit()
    finally:
        master_db.close()
        
    return RedirectResponse(f"/library/grammar/{topic_id}/edit", status_code=303)

@router.post("/grammar/{topic_id}/questions/update")
async def update_grammar_questions(request: Request, topic_id: int):
    user = get_current_user(request)
    if not user or user.role not in ["owner", "teacher"]:
        return RedirectResponse("/login", status_code=303)
        
    form = await request.form()
    
    master_db = SessionMaster()
    try:
        questions = master_db.query(GrammarQuestion).filter_by(topic_id=topic_id).all()
        for q in questions:
            q_id = str(q.id)
            if f"q_{q_id}_text" in form:
                q.question_text = form.get(f"q_{q_id}_text")
                q.option_a = form.get(f"q_{q_id}_opt_a")
                q.option_b = form.get(f"q_{q_id}_opt_b")
                q.option_c = form.get(f"q_{q_id}_opt_c")
                q.option_d = form.get(f"q_{q_id}_opt_d")
                q.correct_option = form.get(f"q_{q_id}_correct")
                q.explanation = form.get(f"q_{q_id}_exp", "")
        master_db.commit()
    finally:
        master_db.close()
        
    return RedirectResponse(f"/library/grammar/{topic_id}/edit", status_code=303)
@router.post("/grammar/{topic_id}/toggle_publish")
def toggle_grammar_publish(request: Request, topic_id: int):
    user = get_current_user(request)
    if not user or user.role not in ["owner", "teacher"]:
        return RedirectResponse("/login", status_code=303)
        
    master_db = SessionMaster()
    try:
        topic = master_db.query(GrammarTopic).filter_by(id=topic_id).first()
        if topic:
            topic.is_published = not topic.is_published
            master_db.commit()
    finally:
        master_db.close()
        
    return RedirectResponse("/library/grammar/manage", status_code=303)


@router.get("/grammar")
def list_grammar(request: Request, level: str = None):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    master_db = SessionMaster()
    try:
        query = master_db.query(GrammarTopic).filter(GrammarTopic.is_published == True)
        if level and level != "all":
            query = query.filter(GrammarTopic.level == level)
            
        topics = query.order_by(GrammarTopic.level, GrammarTopic.id).all()
        
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
        topic = master_db.query(GrammarTopic).filter_by(id=topic_id).first()
        if not topic or not topic.is_published:
            return RedirectResponse("/library/grammar", status_code=303)
            
        questions = master_db.query(GrammarQuestion).filter_by(topic_id=topic_id).all()
        has_questions = len(questions) > 0
        
        # Get previous best attempt if any
        best_attempt = master_db.query(GrammarQuizAttempt).filter_by(
            tenant_id=user.tenant_id, student_id=user.id, topic_id=topic.id
        ).order_by(GrammarQuizAttempt.score.desc()).first()
        
    finally:
        master_db.close()
        
    return templates.TemplateResponse("library/grammar_detail.html", {
        "request": request, "user": user, "topic": topic, "has_questions": has_questions, 
        "best_attempt": best_attempt, "active_page": "library"
    })

@router.get("/grammar/{topic_id}/test")
def grammar_test(request: Request, topic_id: int):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    master_db = SessionMaster()
    try:
        topic = master_db.query(GrammarTopic).filter_by(id=topic_id).first()
        if not topic or not topic.is_published:
            return RedirectResponse("/library/grammar", status_code=303)
            
        questions = master_db.query(GrammarQuestion).filter_by(topic_id=topic_id).all()
        
    finally:
        master_db.close()
        
    return templates.TemplateResponse("library/grammar_test.html", {
        "request": request, "user": user, "topic": topic, "questions": questions, 
        "active_page": "library"
    })

@router.post("/grammar/{topic_id}/submit")
async def submit_grammar_quiz(request: Request, topic_id: int):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    form = await request.form()
    
    master_db = SessionMaster()
    try:
        topic = master_db.query(GrammarTopic).filter_by(id=topic_id).first()
        questions = master_db.query(GrammarQuestion).filter_by(topic_id=topic_id).all()
        
        score = 0
        total = len(questions)
        
        for q in questions:
            user_ans = form.get(f"q_{q.id}")
            if user_ans and user_ans.upper() == q.correct_option.upper():
                score += 1
                
        attempt = GrammarQuizAttempt(
            tenant_id=user.tenant_id,
            student_id=user.id,
            topic_id=topic_id,
            score=score,
            total_questions=total
        )
        master_db.add(attempt)
        master_db.commit()
    finally:
        master_db.close()
        
    return RedirectResponse(f"/library/grammar/{topic_id}?result=success", status_code=303)


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

# =======================
# OWNER / MANAGE ROUTES
# =======================

@router.get("/books/manage")
def manage_books(request: Request):
    user = get_current_user(request)
    if not user or user.role != "owner":
        return RedirectResponse("/library/books", status_code=303)
        
    master_db = SessionMaster()
    try:
        books = master_db.query(LibraryBook).order_by(LibraryBook.created_at.desc()).all()
    finally:
        master_db.close()
        
    return templates.TemplateResponse("library/owner_books_manage.html", {
        "request": request, "user": user, "books": books, "active_page": "library"
    })

@router.post("/books/add")
async def add_book(
    request: Request,
    title: str = Form(...),
    author: str = Form(None),
    level: str = Form(...),
    description: str = Form(None),
    cover_file: UploadFile = File(None),
    book_file: UploadFile = File(...)
):
    user = get_current_user(request)
    if not user or user.role != "owner":
        return RedirectResponse("/library/books", status_code=303)
        
    upload_dir = "uploads/books"
    os.makedirs(upload_dir, exist_ok=True)
    
    cover_url = None
    if cover_file and cover_file.filename:
        cover_path = os.path.join(upload_dir, f"cover_{cover_file.filename}")
        with open(cover_path, "wb") as buffer:
            shutil.copyfileobj(cover_file.file, buffer)
        cover_url = f"/{cover_path}"
        
    book_url = None
    if book_file and book_file.filename:
        book_path = os.path.join(upload_dir, f"book_{book_file.filename}")
        with open(book_path, "wb") as buffer:
            shutil.copyfileobj(book_file.file, buffer)
        book_url = f"/{book_path}"
        
    master_db = SessionMaster()
    try:
        new_book = LibraryBook(
            tenant_id=user.tenant_id,
            title=title,
            author=author,
            description=description,
            level=level,
            cover_url=cover_url,
            file_url=book_url,
            book_type="ebook"
        )
        master_db.add(new_book)
        master_db.commit()
    finally:
        master_db.close()
        
    return RedirectResponse("/library/books/manage", status_code=303)

@router.post("/books/{book_id}/delete")
def delete_book(request: Request, book_id: int):
    user = get_current_user(request)
    if not user or user.role != "owner":
        return RedirectResponse("/library/books", status_code=303)
        
    master_db = SessionMaster()
    try:
        book = master_db.query(LibraryBook).filter_by(id=book_id).first()
        if book:
            if book.cover_url:
                try: os.remove(book.cover_url.lstrip('/'))
                except: pass
            if book.file_url:
                try: os.remove(book.file_url.lstrip('/'))
                except: pass
            master_db.delete(book)
            master_db.commit()
    finally:
        master_db.close()
        
    return RedirectResponse("/library/books/manage", status_code=303)

@router.get("/books/{book_id}/read")
def read_book(request: Request, book_id: int):
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/login", status_code=303)
        
    master_db = SessionMaster()
    try:
        book = master_db.query(LibraryBook).filter_by(id=book_id).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
    finally:
        master_db.close()
        
    return templates.TemplateResponse("library/reader.html", {
        "request": request, "user": user, "book": book, "active_page": "library"
    })

# =======================
# AUDIOBOOKS & PODCASTS ROUTES
# =======================

@router.get("/audio")
def list_audio(request: Request, filter: str = "all", level: str = "all"):
    user = get_current_user(request)
    if not user: return RedirectResponse("/login", status_code=303)
    
    master_db = SessionMaster()
    try:
        query = master_db.query(LibraryBook).filter(LibraryBook.book_type.in_(["audiobook", "podcast"]))
        if filter != "all":
            query = query.filter(LibraryBook.book_type == filter)
        if level != "all":
            query = query.filter(LibraryBook.level == level)
            
        audio_items = query.order_by(LibraryBook.created_at.desc()).all()
    finally:
        master_db.close()

    return templates.TemplateResponse("library/student_audio.html", {
        "request": request, "user": user, "audio_items": audio_items, "active_page": "library", "current_filter": filter, "current_level": level
    })

@router.get("/audio/manage")
def manage_audio(request: Request):
    user = get_current_user(request)
    if not user or user.role != "owner":
        return RedirectResponse("/library/audio", status_code=303)
        
    master_db = SessionMaster()
    try:
        audio_items = master_db.query(LibraryBook).filter(LibraryBook.book_type.in_(["audiobook", "podcast"])).order_by(LibraryBook.created_at.desc()).all()
    finally:
        master_db.close()
        
    return templates.TemplateResponse("library/owner_audio_manage.html", {
        "request": request, "user": user, "audio_items": audio_items, "active_page": "library"
    })

@router.post("/audio/add")
async def add_audio(
    request: Request,
    title: str = Form(...),
    author: str = Form(None),
    description: str = Form(None),
    level: str = Form("All"),
    book_type: str = Form("audiobook"),
    cover_file: UploadFile = File(None),
    audio_file: UploadFile = File(...),
    subtitles_file: UploadFile = File(None)
):
    user = get_current_user(request)
    if not user or user.role != "owner":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    os.makedirs(os.path.join(DATA_DIR, "uploads/audio"), exist_ok=True)
    os.makedirs(os.path.join(DATA_DIR, "uploads/books"), exist_ok=True)
    os.makedirs(os.path.join(DATA_DIR, "uploads/subtitles"), exist_ok=True)
    
    cover_url = None
    if cover_file and cover_file.filename:
        cover_path = f"/uploads/books/cover_{cover_file.filename}"
        with open(os.path.join(DATA_DIR, cover_path.lstrip('/')), "wb") as buffer:
            shutil.copyfileobj(cover_file.file, buffer)
        cover_url = cover_path
        
    audio_url = None
    if audio_file and audio_file.filename:
        audio_path = f"/uploads/audio/{audio_file.filename}"
        with open(os.path.join(DATA_DIR, audio_path.lstrip('/')), "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        audio_url = audio_path
        
    subtitles_url = None
    if subtitles_file and subtitles_file.filename:
        sub_path = f"/uploads/subtitles/{subtitles_file.filename}"
        with open(os.path.join(DATA_DIR, sub_path.lstrip('/')), "wb") as buffer:
            shutil.copyfileobj(subtitles_file.file, buffer)
        subtitles_url = sub_path

    master_db = SessionMaster()
    try:
        new_item = LibraryBook(
            title=title,
            author=author,
            description=description,
            cover_url=cover_url,
            file_url=audio_url,
            subtitles_url=subtitles_url,
            book_type=book_type,
            level=level
        )
        master_db.add(new_item)
        master_db.commit()
    finally:
        master_db.close()
        
    return RedirectResponse("/library/audio/manage", status_code=303)

@router.post("/audio/{item_id}/delete")
def delete_audio(request: Request, item_id: int):
    user = get_current_user(request)
    if not user or user.role != "owner":
        return RedirectResponse("/library/audio", status_code=303)
        
    master_db = SessionMaster()
    try:
        item = master_db.query(LibraryBook).filter_by(id=item_id).first()
        if item:
            for url in [item.cover_url, item.file_url, item.subtitles_url]:
                if url:
                    try: os.remove(os.path.join(DATA_DIR, url.lstrip('/')))
                    except: pass
            master_db.delete(item)
            master_db.commit()
    finally:
        master_db.close()
        
    return RedirectResponse("/library/audio/manage", status_code=303)

@router.get("/audio/{item_id}/play")
def play_audio(request: Request, item_id: int):
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/login", status_code=303)
        
    master_db = SessionMaster()
    try:
        item = master_db.query(LibraryBook).filter_by(id=item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Audio not found")
    finally:
        master_db.close()
        
    return templates.TemplateResponse("library/audio_player.html", {
        "request": request, "user": user, "item": item, "active_page": "library"
    })
