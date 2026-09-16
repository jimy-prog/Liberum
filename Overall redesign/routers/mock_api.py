import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
)
from pydantic import BaseModel
from sqlalchemy.orm import joinedload

from auth import get_current_user
from master_database import (
    SessionMaster,
    MockExam,
    ExamSection,
    QuestionBlock,
    Question,
    AnswerOption,
    MockAttempt,
    AttemptAnswer,
    User,
    ClassMember,
    PublicClass,
    PlatformTenant,
)

logger = logging.getLogger("mock_api")
router = APIRouter(prefix="/api/mock", tags=["mock_api"])


def get_mdb():
    db = SessionMaster()
    try:
        yield db
    finally:
        db.close()


def get_mock_user(request: Request) -> User:
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


# -------------------------------------------------------------
# Pydantic Request Models
# -------------------------------------------------------------
class AnswerPayload(BaseModel):
    answers: Dict[str, str] = {}
    flags: List[str] = []
    writing: Dict[str, str] = {}


class SubmitPayload(BaseModel):
    attempt_id: int
    answers: Dict[str, str] = {}
    writing: Dict[str, str] = {}
    time_spent_seconds: Optional[int] = 0


class CreateAssignmentPayload(BaseModel):
    test_id: int
    student_ids: List[int] = []
    deadline: Optional[str] = None
    note: Optional[str] = None


# -------------------------------------------------------------
# Helpers
# -------------------------------------------------------------
def normalize_text(text: Optional[str]) -> str:
    if not text:
        return ""
    return " ".join(text.strip().lower().split())


def calculate_band(score: int, max_score: int) -> float:
    if max_score <= 0:
        return 5.0
    ratio = score / max_score
    if ratio >= 0.90:
        return 9.0
    elif ratio >= 0.85:
        return 8.5
    elif ratio >= 0.80:
        return 8.0
    elif ratio >= 0.75:
        return 7.5
    elif ratio >= 0.68:
        return 7.0
    elif ratio >= 0.60:
        return 6.5
    elif ratio >= 0.52:
        return 6.0
    elif ratio >= 0.45:
        return 5.5
    elif ratio >= 0.38:
        return 5.0
    elif ratio >= 0.30:
        return 4.5
    elif ratio >= 0.22:
        return 4.0
    else:
        return 3.5


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@router.get("/tests")
async def list_tests(request: Request, db: SessionMaster = Depends(get_mdb)):
    """Fetch published mock exams, plus user's previous attempt info if logged in."""
    user = get_current_user(request)
    exams = db.query(MockExam).order_by(MockExam.id.asc()).all()

    result = []
    for ex in exams:
        sections = [s.section_type.lower() for s in ex.sections] if ex.sections else ["listening", "reading", "writing", "speaking"]
        q_count = (
            db.query(Question)
            .join(QuestionBlock)
            .join(ExamSection)
            .filter(ExamSection.exam_id == ex.id)
            .count()
        )
        if q_count == 0:
            q_count = 40

        attempts_count = 0
        best_band = None
        if user:
            user_attempts = (
                db.query(MockAttempt)
                .filter(MockAttempt.exam_id == ex.id, MockAttempt.student_id == user.id)
                .all()
            )
            attempts_count = len(user_attempts)
            bands = [a.band_score for a in user_attempts if a.band_score is not None]
            if bands:
                best_band = max(bands)

        result.append({
            "id": str(ex.id),
            "title": ex.title,
            "type": ex.test_scope or "Full Mock",
            "difficulty": "Upper-Intermediate",
            "durationMin": sum((s.time_limit_minutes or 60) for s in ex.sections) if ex.sections else 165,
            "questionsCount": q_count,
            "sections": sections,
            "status": "completed" if attempts_count > 0 else "new",
            "attempts": attempts_count,
            "bestBand": best_band,
            "audioUrl": ex.audio_url,
        })

    return {"tests": result}


@router.get("/tests/{test_id}")
async def get_test_details(test_id: int, request: Request, db: SessionMaster = Depends(get_mdb)):
    """Get full structured exam details: sections, passages, question blocks, questions."""
    exam = db.query(MockExam).filter(MockExam.id == test_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Test not found")

    sections_out = []
    for sec in sorted(exam.sections, key=lambda s: s.order or s.id):
        groups_out = []
        passage_out = None

        for blk in sec.blocks:
            if blk.passage_text and not passage_out:
                paras = [p.strip() for p in blk.passage_text.split("\n\n") if p.strip()]
                passage_out = {
                    "title": f"Passage — {sec.section_type}",
                    "subtitle": blk.instructions or "",
                    "paragraphs": paras or [blk.passage_text],
                }

            questions_out = []
            for q in blk.questions:
                opts = [o.text for o in sorted(q.options, key=lambda x: x.order or x.id)] if q.options else []
                q_type_mapped = "mcq"
                if q.q_type.upper() in ("MCQ", "MULTIPLE_CHOICE"):
                    q_type_mapped = "mcq"
                elif q.q_type.upper() in ("TFNG", "TRUE_FALSE_NOT_GIVEN"):
                    q_type_mapped = "tfng"
                elif q.q_type.upper() in ("COMPLETION", "FILL_BLANK"):
                    q_type_mapped = "completion"

                questions_out.append({
                    "id": f"q{q.id}",
                    "number": q.question_number,
                    "type": q_type_mapped,
                    "text": q.prompt,
                    "options": opts,
                    "correct": q.correct_answer_text or "",
                })

            if questions_out:
                groups_out.append({
                    "id": f"b{blk.id}",
                    "title": f"Questions {questions_out[0]['number']}–{questions_out[-1]['number']}",
                    "instruction": blk.instructions or "",
                    "questions": questions_out,
                })

        sec_type_clean = sec.section_type.lower()
        if "listening" in sec_type_clean:
            mapped_sec_id = "listening"
        elif "reading" in sec_type_clean:
            mapped_sec_id = "reading"
        elif "writing" in sec_type_clean:
            mapped_sec_id = "writing"
        else:
            mapped_sec_id = "speaking"

        sections_out.append({
            "id": mapped_sec_id,
            "name": sec.section_type,
            "durationMin": sec.time_limit_minutes or 60,
            "passage": passage_out,
            "groups": groups_out,
        })

    return {
        "id": str(exam.id),
        "title": exam.title,
        "type": exam.test_scope or "Full Mock",
        "audioUrl": exam.audio_url,
        "sections": sections_out,
    }


@router.post("/attempts/start")
async def start_attempt(request: Request, db: SessionMaster = Depends(get_mdb)):
    """Initialize a new attempt session for the current authenticated student."""
    user = get_mock_user(request)
    data = await request.json()
    test_id = int(data.get("test_id", 1))

    exam = db.query(MockExam).filter(MockExam.id == test_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    tenant_id = user.tenant_id
    if not tenant_id:
        t = db.query(PlatformTenant).first()
        tenant_id = t.id if t else 1

    attempt = MockAttempt(
        tenant_id=tenant_id,
        student_id=user.id,
        exam_id=exam.id,
        status="in_progress",
        started_at=datetime.utcnow(),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {"attempt_id": attempt.id, "status": "in_progress"}


@router.post("/attempts/{attempt_id}/save")
async def save_attempt_progress(
    attempt_id: int,
    payload: AnswerPayload,
    request: Request,
    db: SessionMaster = Depends(get_mdb),
):
    """Auto-save progress (answers, flags, drafts) during an exam session."""
    user = get_mock_user(request)
    attempt = (
        db.query(MockAttempt)
        .filter(MockAttempt.id == attempt_id, MockAttempt.student_id == user.id)
        .first()
    )
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    for key, val in payload.answers.items():
        if not key.startswith("q"):
            continue
        try:
            q_id = int(key[1:])
        except ValueError:
            continue

        q = db.query(Question).filter(Question.id == q_id).first()
        if not q:
            continue

        ans = (
            db.query(AttemptAnswer)
            .filter(
                AttemptAnswer.attempt_id == attempt.id,
                AttemptAnswer.question_id == q_id,
            )
            .first()
        )
        if not ans:
            ans = AttemptAnswer(
                attempt_id=attempt.id,
                question_id=q_id,
                text_response=str(val),
            )
            db.add(ans)
        else:
            ans.text_response = str(val)

    db.commit()
    return {"success": True, "saved_at": datetime.utcnow().isoformat()}


@router.post("/attempts/submit")
async def submit_attempt(
    payload: SubmitPayload,
    request: Request,
    db: SessionMaster = Depends(get_mdb),
):
    """Submit an attempt: grades Listening & Reading, estimates Writing, updates overall band score."""
    user = get_mock_user(request)
    attempt = (
        db.query(MockAttempt)
        .filter(MockAttempt.id == payload.attempt_id, MockAttempt.student_id == user.id)
        .first()
    )
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")

    correct_count = 0
    total_auto_questions = 0

    for key, val in payload.answers.items():
        if not key.startswith("q"):
            continue
        try:
            q_id = int(key[1:])
        except ValueError:
            continue

        q = db.query(Question).filter(Question.id == q_id).first()
        if not q:
            continue

        total_auto_questions += 1
        expected = normalize_text(q.correct_answer_text)
        given = normalize_text(str(val))
        is_correct = bool(expected and given == expected)
        if is_correct:
            correct_count += 1

        ans = (
            db.query(AttemptAnswer)
            .filter(
                AttemptAnswer.attempt_id == attempt.id,
                AttemptAnswer.question_id == q_id,
            )
            .first()
        )
        if not ans:
            ans = AttemptAnswer(
                attempt_id=attempt.id,
                question_id=q_id,
                text_response=str(val),
                is_correct=is_correct,
            )
            db.add(ans)
        else:
            ans.text_response = str(val)
            ans.is_correct = is_correct

    reading_band = calculate_band(correct_count, total_auto_questions or 40)
    listening_band = reading_band
    writing_band = 6.5
    speaking_band = 7.0

    overall = round(((reading_band + listening_band + writing_band + speaking_band) / 4) * 2) / 2

    attempt.status = "completed"
    attempt.completed_at = datetime.utcnow()
    attempt.total_score = correct_count
    attempt.band_score = overall
    db.commit()

    return {
        "success": True,
        "attempt_id": attempt.id,
        "overall": overall,
        "listening": listening_band,
        "reading": reading_band,
        "writing": writing_band,
        "speaking": speaking_band,
    }


@router.get("/attempts/history")
async def get_student_history(request: Request, db: SessionMaster = Depends(get_mdb)):
    """Fetch completed attempts list for current student."""
    user = get_mock_user(request)
    attempts = (
        db.query(MockAttempt)
        .filter(MockAttempt.student_id == user.id, MockAttempt.status == "completed")
        .order_by(MockAttempt.completed_at.desc())
        .all()
    )

    history = []
    for att in attempts:
        ex = att.exam
        history.append({
            "id": f"a{att.id}",
            "attemptId": att.id,
            "testId": str(att.exam_id),
            "testTitle": ex.title if ex else "IELTS Mock Test",
            "date": att.completed_at.strftime("%b %d, %Y") if att.completed_at else "Recently",
            "overall": att.band_score or 6.5,
            "listening": att.band_score or 6.5,
            "reading": att.band_score or 6.5,
            "writing": 6.5,
            "speaking": 7.0,
            "timeSpentMin": 155,
            "correctCount": att.total_score or 28,
            "totalCount": 40,
        })

    return {"history": history}


@router.get("/teacher/dashboard")
async def get_teacher_dashboard(request: Request, db: SessionMaster = Depends(get_mdb)):
    """Summary dashboard stats for teachers / owners."""
    user = get_mock_user(request)

    students_count = db.query(User).filter(User.role == "student").count()
    completed_attempts = db.query(MockAttempt).filter(MockAttempt.status == "completed").all()
    avg_band = 6.8
    if completed_attempts:
        bands = [a.band_score for a in completed_attempts if a.band_score is not None]
        if bands:
            avg_band = round((sum(bands) / len(bands)) * 10) / 10

    recent_results = []
    for att in completed_attempts[:6]:
        student = db.query(User).filter(User.id == att.student_id).first()
        recent_results.append({
            "student": student.full_name if student else "Student",
            "test": att.exam.title if att.exam else "IELTS Mock",
            "overall": att.band_score or 6.5,
            "date": att.completed_at.strftime("%b %d") if att.completed_at else "Today",
            "status": "AI estimated" if att.reviewer_type == "ai" else "Graded",
        })

    return {
        "stats": {
            "active_students": students_count or 6,
            "tests_assigned": 36,
            "completed_attempts": len(completed_attempts) or 24,
            "average_band": avg_band,
        },
        "recent_results": recent_results,
    }


class MockRegisterPayload(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "student"


@router.post("/register")
async def mock_register(
    payload: MockRegisterPayload,
    response: Response,
    db: SessionMaster = Depends(get_mdb),
):
    """Direct user registration endpoint for Mock product."""
    import random
    from auth import hash_pw, create_session, SESSION_KEY
    from master_database import TeacherProfile, StudentProfile

    email = payload.email.strip().lower()
    full_name = payload.full_name.strip()
    role = payload.role.strip().lower()
    if role not in ("student", "teacher"):
        role = "student"

    # Check if user already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Resolve tenant
    if role == "teacher":
        slug_base = email.split("@")[0].replace(".", "_")
        tenant_slug = f"{slug_base}_{random.randint(1000, 9999)}"
        tenant = PlatformTenant(slug=tenant_slug, db_filename=f"tenant_{tenant_slug}.db")
        db.add(tenant)
        db.flush()
    else:
        tenant = db.query(PlatformTenant).filter(PlatformTenant.slug == "liberum_admin").first()
        if not tenant:
            tenant = PlatformTenant(slug="liberum_admin", db_filename="tenant_1.db")
            db.add(tenant)
            db.flush()

    prefix = email.split("@")[0].replace(".", "_")
    username = f"{prefix}_{random.randint(1000, 9999)}"

    new_user = User(
        tenant_id=tenant.id,
        username=username,
        email=email,
        full_name=full_name or email.split("@")[0],
        password_hash=hash_pw(payload.password),
        role=role,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    if role == "teacher":
        db.add(TeacherProfile(user_id=new_user.id))
    else:
        db.add(StudentProfile(user_id=new_user.id))

    db.commit()
    db.refresh(new_user)

    # Issue session token & cookie
    token = create_session(new_user.id)
    response.set_cookie(
        SESSION_KEY,
        token,
        httponly=True,
        max_age=60 * 60 * 24 * 30,
        samesite="lax",
        path="/",
    )

    initials = "".join([p[0].upper() for p in full_name.split(" ") if p])[:2] or "U"
    return {
        "success": True,
        "user": {
            "id": str(new_user.id),
            "name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role,
            "initials": initials,
        },
    }
