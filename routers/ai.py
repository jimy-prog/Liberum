from fastapi import APIRouter, Request, Depends, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
import google.generativeai as genai

from master_database import SessionMaster, User, GrammarQuizAttempt, GrammarTopic
from database import get_tenant_engine, Student, Group, Lesson, Attendance, TestResult, AIChatSession, AIChatMessage
from auth import get_current_user
from config import GEMINI_API_KEY
from sqlalchemy.orm import sessionmaker

router = APIRouter(prefix="/library/ai")
templates = Jinja2Templates(directory="templates")

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

class ChatRequest(BaseModel):
    message: str
    include_profile: bool = True
    include_lessons: bool = False
    include_tests: bool = False
    include_grammar: bool = False
    chat_history: list = [] # list of {"role": "user"|"model", "parts": "..."}
    session_id: int | None = None

@router.get("/ai")
def ai_chat_page(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/login", status_code=303)
        
    master_db = SessionMaster()
    try:
        user_record = master_db.query(User).filter_by(id=user.id).first()
        if not user_record:
            return RedirectResponse("/login", status_code=303)
        tenant_db_filename = user_record.tenant.db_filename
        user_email = user_record.email
        user_phone = user_record.phone
        user_full_name = user_record.full_name
    finally:
        master_db.close()
        
    engine = get_tenant_engine(tenant_db_filename)
    SessionLocal = sessionmaker(bind=engine)
    tenant_db = SessionLocal()
    try:
        student = tenant_db.query(Student).filter(
            (Student.email == user_email) | (Student.phone == user_phone) | (Student.name == user_full_name)
        ).first()
        student_id = student.id if student else 0
        sessions = tenant_db.query(AIChatSession).filter_by(student_id=student_id).order_by(AIChatSession.updated_at.desc()).all() if student_id else []
    finally:
        tenant_db.close()
        
    return templates.TemplateResponse("library/student_ai_chat.html", {
        "request": request, "user": user, "active_page": "library", "sessions": sessions
    })

@router.post("/chat")
def ai_chat_endpoint(request: Request, payload: ChatRequest):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    master_db = SessionMaster()
    try:
        user_record = master_db.query(User).filter_by(id=user.id).first()
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")
        
        tenant_db_filename = user_record.tenant.db_filename
        user_email = user_record.email
        user_phone = user_record.phone
        user_full_name = user_record.full_name
    finally:
        master_db.close()

    # Query Tenant DB first to get student_id
    engine = get_tenant_engine(tenant_db_filename)
    SessionLocal = sessionmaker(bind=engine)
    tenant_db = SessionLocal()
    
    student_info = ""
    lesson_info = ""
    test_info = ""
    
    try:
        student = tenant_db.query(Student).filter(
            (Student.email == user_email) | (Student.phone == user_phone) | (Student.name == user_full_name)
        ).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student record not found")
        student_id = student.id
        
        # Now get grammar attempts from master_db since we have student_id
        grammar_data = []
        if payload.include_grammar:
            master_db = SessionMaster()
            try:
                attempts = master_db.query(GrammarQuizAttempt).filter_by(student_id=student_id).all()
                for a in attempts:
                    topic = master_db.query(GrammarTopic).filter_by(id=a.topic_id).first()
                    if topic:
                        grammar_data.append(f"- {topic.title}: {a.score}/{a.total_questions}")
            finally:
                master_db.close()
            
        if payload.include_profile:
            student_info = f"Student Name: {student.name}\n"
            student_info += f"English Level: {student.level}\n"
            student_info += f"Strengths: {student.strengths}\n"
            student_info += f"Weaknesses: {student.weaknesses}\n"
            
        if payload.include_lessons and student.group_id:
            attendances = tenant_db.query(Attendance).filter_by(student_id=student.id).order_by(Attendance.id.desc()).limit(10).all()
            lesson_ids = [a.lesson_id for a in attendances]
            if lesson_ids:
                lessons = tenant_db.query(Lesson).filter(Lesson.id.in_(lesson_ids)).order_by(Lesson.date.desc()).all()
                lesson_info = "Recent Lessons:\n"
                for l in lessons:
                    att = next((a for a in attendances if a.lesson_id == l.id), None)
                    att_status = att.status if att else "Unknown"
                    lesson_info += f"- Date: {l.date}, Topic: {l.topic}, Homework: {l.homework}, Attendance: {att_status}\n"
                    
        if payload.include_tests:
            tests = tenant_db.query(TestResult).filter_by(student_id=student.id).order_by(TestResult.date.desc()).all()
            test_info = "Mock Test Results:\n"
            for t in tests:
                test_info += f"- Date: {t.date}, Score: {t.score_listening + t.score_reading + t.score_writing + t.score_speaking}, Details: L:{t.score_listening}, R:{t.score_reading}, W:{t.score_writing}, S:{t.score_speaking}\n"
                
    finally:
        tenant_db.close()
        
    # Construct System Prompt
    system_prompt = f"""You are Lexi, a strict but highly intelligent AI tutor for the Liberum English Learning Platform.
Your goal is to help the student learn, but NEVER just give them the direct answers to homework or tests. Instead, ask leading questions, explain the concepts, and guide them to figure it out themselves. Be encouraging but firm in your role as a tutor. Use markdown formatting to make your responses look premium and organized.

--- STUDENT CONTEXT ---
{student_info}
{lesson_info}
{test_info}
Grammar Quiz Results:
{chr(10).join(grammar_data) if grammar_data else "No grammar data provided."}
-----------------------
Use this context to personalize your responses. If they ask about their recent lessons or scores, refer to the data above.
"""

    # We use Gemini Chat Session to maintain history
    try:
        # Convert history format to Gemini format
        formatted_history = []
        for msg in payload.chat_history:
            formatted_history.append({
                "role": "user" if msg["role"] == "user" else "model",
                "parts": [msg["parts"]]
            })
            
        chat = model.start_chat(history=formatted_history)
        
        # We inject the system prompt along with the user's latest message if the history is empty,
        # or we just prepend it. Since Gemini 1.5 doesn't have a direct "system_instruction" parameter in start_chat in older SDK versions, 
        # we can just pass it as the first message if needed, or better, we can inject it into the current prompt.
        
        full_message = f"SYSTEM INSTRUCTION (DO NOT SHOW THIS TO THE USER):\n{system_prompt}\n\nUSER MESSAGE:\n{payload.message}"
        
        response = chat.send_message(full_message)
        reply_text = response.text
        
        # Save to DB
        engine = get_tenant_engine(tenant_db_filename)
        SessionLocal = sessionmaker(bind=engine)
        tenant_db2 = SessionLocal()
        try:
            if not payload.session_id:
                # Create new session
                title_preview = payload.message[:30] + ("..." if len(payload.message) > 30 else "")
                new_session = AIChatSession(student_id=student_id, title=title_preview)
                tenant_db2.add(new_session)
                tenant_db2.commit()
                tenant_db2.refresh(new_session)
                session_id = new_session.id
            else:
                session_id = payload.session_id
                # Update timestamp
                existing_session = tenant_db2.query(AIChatSession).filter_by(id=session_id).first()
                if existing_session:
                    # updated_at will trigger auto update if configured, or we can just touch it
                    pass 
                
            # Add user message
            user_msg = AIChatMessage(session_id=session_id, role="user", content=payload.message)
            tenant_db2.add(user_msg)
            # Add lexi message
            lexi_msg = AIChatMessage(session_id=session_id, role="lexi", content=reply_text)
            tenant_db2.add(lexi_msg)
            tenant_db2.commit()
            
        finally:
            tenant_db2.close()
            
        return JSONResponse({"reply": reply_text, "session_id": session_id})
    except Exception as e:
        print("Gemini API Error:", str(e))
        return JSONResponse({"reply": "I'm sorry, my AI servers are currently experiencing issues. Please try again later.", "error": str(e)}, status_code=500)

@router.get("/session/{session_id}")
def load_session(request: Request, session_id: int):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    master_db = SessionMaster()
    try:
        user_record = master_db.query(User).filter_by(id=user.id).first()
        tenant_db_filename = user_record.tenant.db_filename
        user_email = user_record.email
        user_phone = user_record.phone
        user_full_name = user_record.full_name
    finally:
        master_db.close()
        
    engine = get_tenant_engine(tenant_db_filename)
    SessionLocal = sessionmaker(bind=engine)
    tenant_db = SessionLocal()
    try:
        student = tenant_db.query(Student).filter(
            (Student.email == user_email) | (Student.phone == user_phone) | (Student.name == user_full_name)
        ).first()
        student_id = student.id if student else 0
        
        session = tenant_db.query(AIChatSession).filter_by(id=session_id, student_id=student_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        messages = tenant_db.query(AIChatMessage).filter_by(session_id=session_id).order_by(AIChatMessage.id.asc()).all()
        msg_list = [{"role": m.role, "content": m.content} for m in messages]
        return JSONResponse({"messages": msg_list})
    finally:
        tenant_db.close()
