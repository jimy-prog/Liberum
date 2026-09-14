import json
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlalchemy.orm import joinedload

from auth import (
    SESSION_KEY,
    authenticate_user,
    create_session,
    get_current_user,
    hash_pw,
)
from master_database import (
    MeetAvailability,
    MeetBooking,
    MeetClassMessage,
    MeetLessonOption,
    MeetNotification,
    MeetTeacherProfile,
    PlatformTenant,
    SessionMaster,
    User,
)

router = APIRouter(prefix="/api/meet", tags=["meet"])


# -------------------------------------------------------------
# Dependency: Require Authenticated User
# -------------------------------------------------------------
def get_meet_user(request: Request) -> User:
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


# -------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------
class RegisterMeetRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"  # "student" or "teacher"


class LoginMeetRequest(BaseModel):
    email: Optional[str] = None
    identifier: Optional[str] = None
    password: str


class LessonOptionSchema(BaseModel):
    id: Optional[str] = None
    title: str
    durationMin: int
    priceUzs: int
    description: str = ""


class AvailabilityWindowSchema(BaseModel):
    start: str
    end: str


class DayAvailabilitySchema(BaseModel):
    day: str
    enabled: bool
    ranges: List[AvailabilityWindowSchema]


class TeacherProfileUpdateSchema(BaseModel):
    headline: str
    bio: str
    subjects: List[str]
    specializations: List[str]
    languages: List[str]
    experienceYears: int
    lessons: List[LessonOptionSchema]


class BookingCreateSchema(BaseModel):
    teacherId: str
    lessonOptionId: str
    date: str
    time: str


class ChatMessageCreateSchema(BaseModel):
    text: str


# -------------------------------------------------------------
# Helpers
# -------------------------------------------------------------
def format_teacher_dict(t: MeetTeacherProfile, user: User):
    try:
        subjects = json.loads(t.subjects_json or "[]")
    except Exception:
        subjects = []
    try:
        specializations = json.loads(t.specializations_json or "[]")
    except Exception:
        specializations = []
    try:
        languages = json.loads(t.languages_json or "[]")
    except Exception:
        languages = []

    lessons = [
        {
            "id": f"l{opt.id}",
            "title": opt.title,
            "durationMin": opt.duration_min,
            "priceUzs": opt.price_uzs,
            "description": opt.description,
        }
        for opt in t.lesson_options
    ]

    availability = []
    days_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    avail_by_day = {a.day: a for a in t.availabilities}
    for d in days_order:
        if d in avail_by_day:
            a = avail_by_day[d]
            try:
                ranges = json.loads(a.ranges_json or "[]")
            except Exception:
                ranges = []
            availability.append({"day": d, "enabled": a.enabled, "ranges": ranges})
        else:
            availability.append({"day": d, "enabled": False, "ranges": []})

    parts = (user.full_name or "Teacher").strip().split(" ")
    initials = "".join([p[0].upper() for p in parts if p])[:2] or "T"

    return {
        "id": f"t{t.id}",
        "userId": user.id,
        "name": user.full_name,
        "initials": initials,
        "title": t.headline or "Teacher",
        "subjects": subjects,
        "specializations": specializations,
        "experienceYears": t.experience_years,
        "languages": languages,
        "bio": t.bio or "",
        "rating": round(t.rating, 1),
        "reviewsCount": t.reviews_count,
        "studentsTaught": t.students_taught,
        "lessonsTaught": t.lessons_taught,
        "verified": t.verified,
        "online": t.online,
        "color": t.avatar_color or "#7B61FF",
        "nextAvailable": "Today · 17:30",
        "lessons": lessons,
        "availability": availability,
    }


# -------------------------------------------------------------
# Seed Default Seed Data if DB is Empty
# -------------------------------------------------------------
def seed_meet_demo_teachers_if_empty(db):
    if db.query(MeetTeacherProfile).count() > 0:
        return

    tenant = db.query(PlatformTenant).first()
    if not tenant:
        tenant = PlatformTenant(slug="meet_default", db_filename="tenant_meet.db")
        db.add(tenant)
        db.flush()

    seed_data = [
        {
            "email": "aziza@liberum.uz",
            "name": "Aziza Karimova",
            "headline": "IELTS & Academic English",
            "subjects": ["English", "IELTS"],
            "specializations": ["IELTS 8.0", "Academic Writing", "Speaking"],
            "experience": 6,
            "languages": ["English", "Русский", "O‘zbek"],
            "bio": "Certified IELTS instructor helping students reach band 7.0+. Structured, honest lessons built around your weaknesses.",
            "rating": 4.9,
            "reviews": 132,
            "students": 120,
            "lessons_taught": 2400,
            "color": "#7B61FF",
            "lessons": [
                ("IELTS Speaking Practice", 60, 120000, "Full mock speaking section with detailed band feedback."),
                ("Academic Writing Clinic", 60, 120000, "Task 1 & Task 2 essay strategy, structure, and live correction."),
                ("Trial Lesson", 30, 50000, "Meet, set your goal, and build a personal plan."),
            ],
            "availability": [
                ("Mon", True, [{"start": "09:00", "end": "12:00"}, {"start": "15:00", "end": "19:00"}]),
                ("Tue", True, [{"start": "09:00", "end": "13:00"}]),
                ("Wed", True, [{"start": "14:00", "end": "19:00"}]),
                ("Thu", True, [{"start": "09:00", "end": "12:00"}, {"start": "15:00", "end": "18:00"}]),
                ("Fri", True, [{"start": "10:00", "end": "14:00"}]),
                ("Sat", True, [{"start": "10:00", "end": "16:00"}]),
                ("Sun", False, []),
            ]
        },
        {
            "email": "jamshid@liberum.uz",
            "name": "Jamshid Mahkamov",
            "headline": "IELTS & English Teacher",
            "subjects": ["English", "IELTS"],
            "specializations": ["IELTS 8.0", "General English", "Teens"],
            "experience": 3,
            "languages": ["English", "O‘zbek"],
            "bio": "IELTS 8.0 holder. Practical speaking confidence and exam technique for busy students.",
            "rating": 4.8,
            "reviews": 86,
            "students": 74,
            "lessons_taught": 1300,
            "color": "#0E0F13",
            "lessons": [
                ("General English", 60, 90000, "Communication-first lessons tailored to your level."),
                ("IELTS Preparation", 60, 100000, "Section-by-section preparation with weekly mock check-ins."),
                ("Trial Lesson", 30, 40000, "A short intro session to see if we are a fit."),
            ],
            "availability": [
                ("Mon", True, [{"start": "10:00", "end": "13:00"}, {"start": "16:00", "end": "20:00"}]),
                ("Tue", True, [{"start": "10:00", "end": "13:00"}, {"start": "16:00", "end": "20:00"}]),
                ("Wed", False, []),
                ("Thu", True, [{"start": "10:00", "end": "13:00"}, {"start": "16:00", "end": "20:00"}]),
                ("Fri", True, [{"start": "14:00", "end": "18:00"}]),
                ("Sat", True, [{"start": "09:00", "end": "13:00"}]),
                ("Sun", True, [{"start": "10:00", "end": "12:00"}]),
            ]
        },
        {
            "email": "madina@liberum.uz",
            "name": "Madina Rahimova",
            "headline": "Mathematics · SAT Math",
            "subjects": ["Math", "SAT"],
            "specializations": ["SAT 780 Math", "Algebra", "Calculus"],
            "experience": 5,
            "languages": ["English", "Русский"],
            "bio": "Math should feel intuitive, not magical. From school algebra to digital SAT 700+ scores.",
            "rating": 5.0,
            "reviews": 64,
            "students": 58,
            "lessons_taught": 980,
            "color": "#1FAD55",
            "lessons": [
                ("SAT Math", 60, 110000, "Strategy, pacing, and problem patterns for the digital SAT."),
                ("School Math Support", 60, 90000, "Algebra, geometry, and calculus."),
                ("Trial Lesson", 30, 45000, "Diagnostic session and study plan."),
            ],
            "availability": [
                ("Mon", True, [{"start": "14:00", "end": "18:00"}]),
                ("Tue", False, []),
                ("Wed", True, [{"start": "14:00", "end": "18:00"}]),
                ("Thu", True, [{"start": "09:00", "end": "12:00"}]),
                ("Fri", True, [{"start": "14:00", "end": "18:00"}]),
                ("Sat", False, []),
                ("Sun", True, [{"start": "10:00", "end": "14:00"}]),
            ]
        }
    ]

    for item in seed_data:
        user = db.query(User).filter_by(email=item["email"]).first()
        if not user:
            user = User(
                tenant_id=tenant.id,
                username=item["email"],
                email=item["email"],
                full_name=item["name"],
                role="teacher",
                password_hash=hash_pw("password123"),
                is_active=True,
            )
            db.add(user)
            db.flush()

        tp = MeetTeacherProfile(
            user_id=user.id,
            headline=item["headline"],
            bio=item["bio"],
            subjects_json=json.dumps(item["subjects"]),
            specializations_json=json.dumps(item["specializations"]),
            languages_json=json.dumps(item["languages"]),
            experience_years=item["experience"],
            rating=item["rating"],
            reviews_count=item["reviews"],
            students_taught=item["students"],
            lessons_taught=item["lessons_taught"],
            avatar_color=item["color"],
        )
        db.add(tp)
        db.flush()

        for l_title, l_dur, l_price, l_desc in item["lessons"]:
            db.add(MeetLessonOption(
                teacher_id=tp.id,
                title=l_title,
                duration_min=l_dur,
                price_uzs=l_price,
                description=l_desc,
            ))

        for day_name, enabled, ranges in item["availability"]:
            db.add(MeetAvailability(
                teacher_id=tp.id,
                day=day_name,
                enabled=enabled,
                ranges_json=json.dumps(ranges),
            ))

    db.commit()


# -------------------------------------------------------------
# AUTH ENDPOINTS
# -------------------------------------------------------------
@router.post("/auth/register")
async def meet_register(req: RegisterMeetRequest, response: Response):
    email = req.email.strip().lower()
    name = req.name.strip()
    if not email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    db = SessionMaster()
    try:
        existing = db.query(User).filter_by(email=email).first()
        if existing:
            raise HTTPException(status_code=400, detail="An account with this email already exists")

        tenant = db.query(PlatformTenant).first()
        if not tenant:
            tenant = PlatformTenant(slug="meet_default", db_filename="tenant_meet.db")
            db.add(tenant)
            db.flush()

        role = req.role if req.role in ["student", "teacher"] else "student"
        user = User(
            tenant_id=tenant.id,
            username=email,
            email=email,
            full_name=name or email.split("@")[0].capitalize(),
            role=role,
            password_hash=hash_pw(req.password),
            is_active=True,
        )
        db.add(user)
        db.flush()

        # If teacher, create initial teacher profile & availability defaults
        if role == "teacher":
            tp = MeetTeacherProfile(
                user_id=user.id,
                headline="Independent Teacher",
                bio="Welcome to my teaching profile on Liberum Meet.",
                subjects_json=json.dumps(["English"]),
                specializations_json=json.dumps(["General English"]),
                languages_json=json.dumps(["English", "O‘zbek"]),
                experience_years=2,
                rating=5.0,
                avatar_color="#7B61FF",
            )
            db.add(tp)
            db.flush()

            # Default trial lesson
            db.add(MeetLessonOption(
                teacher_id=tp.id,
                title="Trial Lesson",
                duration_min=30,
                price_uzs=50000,
                description="Introduction session to evaluate level and establish goals.",
            ))

            # Default Mon-Fri availability
            for day_name in ["Mon", "Tue", "Wed", "Thu", "Fri"]:
                db.add(MeetAvailability(
                    teacher_id=tp.id,
                    day=day_name,
                    enabled=True,
                    ranges_json=json.dumps([{"start": "10:00", "end": "18:00"}]),
                ))
            for day_name in ["Sat", "Sun"]:
                db.add(MeetAvailability(
                    teacher_id=tp.id,
                    day=day_name,
                    enabled=False,
                    ranges_json=json.dumps([]),
                ))

        # Welcome notification
        db.add(MeetNotification(
            user_id=user.id,
            kind="system",
            title="Welcome to Liberum Meet",
            body="Your account is active. Book verified teachers or set your availability to start teaching.",
            time_label="Just now",
        ))

        db.commit()
        db.refresh(user)

        token = create_session(user.id)
        response.set_cookie(SESSION_KEY, token, httponly=True, max_age=60*60*24*30, samesite="lax", path="/")

        parts = (user.full_name or "").split(" ")
        initials = "".join([p[0].upper() for p in parts if p])[:2] or "U"

        return {
            "success": True,
            "user": {
                "id": str(user.id),
                "name": user.full_name,
                "email": user.email,
                "role": user.role,
                "initials": initials,
            }
        }
    finally:
        db.close()


@router.post("/auth/login")
async def meet_login(req: LoginMeetRequest, response: Response):
    ident = (req.identifier or req.email or "").strip()
    if not ident:
        raise HTTPException(status_code=400, detail="Username or email is required")
    user = authenticate_user(ident, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    token = create_session(user.id)
    response.set_cookie(SESSION_KEY, token, httponly=True, max_age=60*60*24*30, samesite="lax", path="/")

    parts = (user.full_name or "").split(" ")
    initials = "".join([p[0].upper() for p in parts if p])[:2] or "U"

    return {
        "success": True,
        "user": {
            "id": str(user.id),
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "initials": initials,
        }
    }


@router.get("/auth/me")
async def meet_me(request: Request):
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")

    parts = (user.full_name or "").split(" ")
    initials = "".join([p[0].upper() for p in parts if p])[:2] or "U"

    return {
        "id": str(user.id),
        "name": user.full_name,
        "email": user.email,
        "role": user.role,
        "initials": initials,
    }


@router.post("/auth/logout")
async def meet_logout(response: Response):
    response.delete_cookie(SESSION_KEY, path="/")
    return {"success": True}


# -------------------------------------------------------------
# TEACHER DISCOVERY & PROFILES
# -------------------------------------------------------------
@router.get("/teachers")
async def list_teachers():
    db = SessionMaster()
    try:
        seed_meet_demo_teachers_if_empty(db)

        teachers = (
            db.query(MeetTeacherProfile)
            .options(
                joinedload(MeetTeacherProfile.user),
                joinedload(MeetTeacherProfile.lesson_options),
                joinedload(MeetTeacherProfile.availabilities),
            )
            .all()
        )

        return [format_teacher_dict(t, t.user) for t in teachers if t.user]
    finally:
        db.close()


@router.get("/teachers/{teacher_id}")
async def get_teacher(teacher_id: str):
    clean_id = teacher_id.replace("t", "")
    if not clean_id.isdigit():
        raise HTTPException(status_code=404, detail="Teacher not found")

    db = SessionMaster()
    try:
        t = (
            db.query(MeetTeacherProfile)
            .filter(MeetTeacherProfile.id == int(clean_id))
            .options(
                joinedload(MeetTeacherProfile.user),
                joinedload(MeetTeacherProfile.lesson_options),
                joinedload(MeetTeacherProfile.availabilities),
            )
            .first()
        )
        if not t or not t.user:
            raise HTTPException(status_code=404, detail="Teacher not found")

        return format_teacher_dict(t, t.user)
    finally:
        db.close()


@router.get("/teacher/my-profile")
async def get_my_teacher_profile(user: User = Depends(get_meet_user)):
    db = SessionMaster()
    try:
        t = (
            db.query(MeetTeacherProfile)
            .filter(MeetTeacherProfile.user_id == user.id)
            .options(
                joinedload(MeetTeacherProfile.lesson_options),
                joinedload(MeetTeacherProfile.availabilities),
            )
            .first()
        )
        if not t:
            # Auto-create if user is teacher
            t = MeetTeacherProfile(
                user_id=user.id,
                headline="Teacher",
                avatar_color="#7B61FF",
            )
            db.add(t)
            db.commit()
            db.refresh(t)

        return format_teacher_dict(t, user)
    finally:
        db.close()


@router.put("/teacher/my-profile")
async def update_my_teacher_profile(data: TeacherProfileUpdateSchema, user: User = Depends(get_meet_user)):
    db = SessionMaster()
    try:
        t = db.query(MeetTeacherProfile).filter(MeetTeacherProfile.user_id == user.id).first()
        if not t:
            t = MeetTeacherProfile(user_id=user.id)
            db.add(t)
            db.flush()

        t.headline = data.headline
        t.bio = data.bio
        t.subjects_json = json.dumps(data.subjects)
        t.specializations_json = json.dumps(data.specializations)
        t.languages_json = json.dumps(data.languages)
        t.experience_years = data.experienceYears

        # Update lesson options
        db.query(MeetLessonOption).filter(MeetLessonOption.teacher_id == t.id).delete()
        for opt in data.lessons:
            db.add(MeetLessonOption(
                teacher_id=t.id,
                title=opt.title,
                duration_min=opt.durationMin,
                price_uzs=opt.priceUzs,
                description=opt.description,
            ))

        db.commit()
        return {"success": True}
    finally:
        db.close()


# -------------------------------------------------------------
# AVAILABILITY
# -------------------------------------------------------------
@router.get("/teacher/availability")
async def get_my_availability(user: User = Depends(get_meet_user)):
    db = SessionMaster()
    try:
        t = db.query(MeetTeacherProfile).filter(MeetTeacherProfile.user_id == user.id).first()
        if not t:
            return []

        avail = db.query(MeetAvailability).filter(MeetAvailability.teacher_id == t.id).all()
        result = []
        days_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        by_day = {a.day: a for a in avail}
        for d in days_order:
            if d in by_day:
                a = by_day[d]
                try:
                    ranges = json.loads(a.ranges_json or "[]")
                except Exception:
                    ranges = []
                result.append({"day": d, "enabled": a.enabled, "ranges": ranges})
            else:
                result.append({"day": d, "enabled": False, "ranges": []})
        return result
    finally:
        db.close()


@router.put("/teacher/availability")
async def update_my_availability(days: List[DayAvailabilitySchema], user: User = Depends(get_meet_user)):
    db = SessionMaster()
    try:
        t = db.query(MeetTeacherProfile).filter(MeetTeacherProfile.user_id == user.id).first()
        if not t:
            t = MeetTeacherProfile(user_id=user.id)
            db.add(t)
            db.flush()

        db.query(MeetAvailability).filter(MeetAvailability.teacher_id == t.id).delete()
        for d in days:
            db.add(MeetAvailability(
                teacher_id=t.id,
                day=d.day,
                enabled=d.enabled,
                ranges_json=json.dumps([r.dict() for r in d.ranges]),
            ))

        db.commit()
        return {"success": True}
    finally:
        db.close()


# -------------------------------------------------------------
# BOOKINGS & LESSONS
# -------------------------------------------------------------
@router.post("/bookings")
async def create_booking(data: BookingCreateSchema, user: User = Depends(get_meet_user)):
    clean_t_id = data.teacherId.replace("t", "")
    clean_l_id = data.lessonOptionId.replace("l", "")

    db = SessionMaster()
    try:
        t = db.query(MeetTeacherProfile).filter(MeetTeacherProfile.id == int(clean_t_id)).first()
        if not t:
            raise HTTPException(status_code=404, detail="Teacher profile not found")

        l_opt = db.query(MeetLessonOption).filter(MeetLessonOption.id == int(clean_l_id)).first()
        title = l_opt.title if l_opt else "1-on-1 Lesson"
        duration = l_opt.duration_min if l_opt else 60
        price = l_opt.price_uzs if l_opt else 0

        room_id = f"room-{uuid.uuid4().hex[:12]}"
        booking = MeetBooking(
            lesson_option_id=l_opt.id if l_opt else None,
            teacher_id=t.id,
            student_id=user.id,
            title=title,
            date_str=data.date,
            time_str=data.time,
            duration_min=duration,
            price_uzs=price,
            status="scheduled",
            room_id=room_id,
        )
        db.add(booking)
        db.flush()

        # Send notifications to both parties
        teacher_user = db.query(User).filter(User.id == t.user_id).first()
        teacher_name = teacher_user.full_name if teacher_user else "Teacher"

        # Notification for student
        db.add(MeetNotification(
            user_id=user.id,
            kind="booking",
            title="Lesson confirmed",
            body=f"{title} with {teacher_name} on {data.date} at {data.time}",
            time_label="Just now",
        ))

        # Notification for teacher
        if teacher_user:
            db.add(MeetNotification(
                user_id=teacher_user.id,
                kind="booking",
                title="New lesson booked",
                body=f"{user.full_name} booked {title} for {data.date} at {data.time}",
                time_label="Just now",
            ))

        db.commit()
        db.refresh(booking)

        return {
            "id": f"les-{booking.id}",
            "teacherId": f"t{t.id}",
            "studentId": str(user.id),
            "teacherName": teacher_name,
            "studentName": user.full_name,
            "title": booking.title,
            "date": booking.date_str,
            "time": booking.time_str,
            "durationMin": booking.duration_min,
            "priceUzs": booking.price_uzs,
            "status": booking.status,
            "roomId": booking.room_id,
        }
    finally:
        db.close()


@router.get("/lessons")
async def list_lessons(user: User = Depends(get_meet_user)):
    db = SessionMaster()
    try:
        if user.role == "teacher":
            t = db.query(MeetTeacherProfile).filter(MeetTeacherProfile.user_id == user.id).first()
            if not t:
                return []
            bookings = (
                db.query(MeetBooking)
                .filter(MeetBooking.teacher_id == t.id)
                .options(joinedload(MeetBooking.student))
                .order_by(MeetBooking.id.desc())
                .all()
            )
        else:
            bookings = (
                db.query(MeetBooking)
                .filter(MeetBooking.student_id == user.id)
                .options(joinedload(MeetBooking.teacher).joinedload(MeetTeacherProfile.user))
                .order_by(MeetBooking.id.desc())
                .all()
            )

        results = []
        for b in bookings:
            teacher_user = b.teacher.user if b.teacher and b.teacher.user else None
            teacher_name = teacher_user.full_name if teacher_user else "Teacher"
            student_name = b.student.full_name if b.student else "Student"

            results.append({
                "id": f"les-{b.id}",
                "teacherId": f"t{b.teacher_id}",
                "studentId": str(b.student_id),
                "teacherName": teacher_name,
                "studentName": student_name,
                "title": b.title,
                "date": b.date_str,
                "time": b.time_str,
                "durationMin": b.duration_min,
                "priceUzs": b.price_uzs,
                "status": b.status,
                "roomId": b.room_id,
            })
        return results
    finally:
        db.close()


@router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(lesson_id: str, user: User = Depends(get_meet_user)):
    clean_id = lesson_id.replace("les-", "")
    if not clean_id.isdigit():
        return {"success": True}

    db = SessionMaster()
    try:
        booking = db.query(MeetBooking).filter(MeetBooking.id == int(clean_id)).first()
        if booking:
            booking.status = "completed"
            # Update teacher stats
            t = db.query(MeetTeacherProfile).filter(MeetTeacherProfile.id == booking.teacher_id).first()
            if t:
                t.lessons_taught = (t.lessons_taught or 0) + 1
            db.commit()
        return {"success": True}
    finally:
        db.close()


# -------------------------------------------------------------
# CLASSROOM CHAT
# -------------------------------------------------------------
@router.get("/classroom/{lesson_id}/messages")
async def get_classroom_messages(lesson_id: str, user: User = Depends(get_meet_user)):
    clean_id = lesson_id.replace("les-", "")
    if not clean_id.isdigit():
        return []

    db = SessionMaster()
    try:
        messages = (
            db.query(MeetClassMessage)
            .filter(MeetClassMessage.booking_id == int(clean_id))
            .order_by(MeetClassMessage.id.asc())
            .all()
        )
        return [
            {
                "id": m.id,
                "from": "me" if m.sender_id == user.id else "them",
                "name": m.sender_name,
                "text": m.text,
                "time": m.time_str,
            }
            for m in messages
        ]
    finally:
        db.close()


@router.post("/classroom/{lesson_id}/messages")
async def send_classroom_message(
    lesson_id: str, data: ChatMessageCreateSchema, user: User = Depends(get_meet_user)
):
    clean_id = lesson_id.replace("les-", "")
    if not clean_id.isdigit():
        raise HTTPException(status_code=400, detail="Invalid lesson id")

    db = SessionMaster()
    try:
        now = datetime.now()
        time_str = now.strftime("%H:%M")
        msg = MeetClassMessage(
            booking_id=int(clean_id),
            sender_id=user.id,
            sender_name=user.full_name or "User",
            text=data.text.strip(),
            time_str=time_str,
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)

        return {
            "id": msg.id,
            "from": "me",
            "name": msg.sender_name,
            "text": msg.text,
            "time": msg.time_str,
        }
    finally:
        db.close()


# -------------------------------------------------------------
# NOTIFICATIONS
# -------------------------------------------------------------
@router.get("/notifications")
async def get_notifications(user: User = Depends(get_meet_user)):
    db = SessionMaster()
    try:
        notifs = (
            db.query(MeetNotification)
            .filter(MeetNotification.user_id == user.id)
            .order_by(MeetNotification.id.desc())
            .limit(20)
            .all()
        )
        return [
            {
                "id": f"n{n.id}",
                "kind": n.kind,
                "title": n.title,
                "body": n.body,
                "time": n.time_label,
                "read": n.read,
            }
            for n in notifs
        ]
    finally:
        db.close()


@router.post("/notifications/mark-read")
async def mark_notifications_read(user: User = Depends(get_meet_user)):
    db = SessionMaster()
    try:
        db.query(MeetNotification).filter(
            MeetNotification.user_id == user.id, MeetNotification.read == False
        ).update({"read": True})
        db.commit()
        return {"success": True}
    finally:
        db.close()
