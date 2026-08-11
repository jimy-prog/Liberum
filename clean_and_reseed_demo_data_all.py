import os
import shutil
import random
from datetime import datetime, timedelta, timezone

from master_database import (
    SessionMaster, User, PlatformTenant, MockExam, MockAttempt,
    PublicClass, ClassMember, ClassTask, ClassMessage, ClassTimelineEvent
)
from database import get_tenant_engine, Base, Group, Student, Lesson, Attendance, Payment
from sqlalchemy.orm import sessionmaker
from auth import hash_pw

def clean_and_reseed():
    master_db = SessionMaster()
    try:
        demo_tenant = master_db.query(PlatformTenant).filter_by(slug="demo_investor").first()
        if not demo_tenant:
            print("Demo tenant not found. Please run the old script or create it first.")
            return

        # Fetch users
        t1 = master_db.query(User).filter_by(username="teacher_demo1").first()
        t2 = master_db.query(User).filter_by(username="teacher_demo2").first()
        s1 = master_db.query(User).filter_by(username="student_demo1").first()
        s2 = master_db.query(User).filter_by(username="student_demo2").first()

        if not all([t1, t2, s1, s2]):
            print("Missing demo users!")
            return

        # Clean old public classes
        master_db.query(PublicClass).filter(PublicClass.teacher_id.in_([t1.id, t2.id])).delete(synchronize_session=False)
        master_db.commit()

        # 1. Create Public Classes (for teacher dashboards)
        pc1 = PublicClass(teacher_id=t1.id, name="IELTS Mastery 7.5+", description="Intensive IELTS preparation", invite_code="IELTS75")
        pc2 = PublicClass(teacher_id=t1.id, name="Speaking Practice Club", description="Weekly speaking mock tests", invite_code="SPEAK2026")
        master_db.add_all([pc1, pc2])
        master_db.commit()

        # 2. Add members to classes
        cm1 = ClassMember(class_id=pc1.id, student_id=s1.id)
        cm2 = ClassMember(class_id=pc1.id, student_id=s2.id)
        master_db.add_all([cm1, cm2])
        master_db.commit()

        # 3. Add Homework (ClassTasks)
        ct1 = ClassTask(class_id=pc1.id, title="Write Essay: Task 2 Environment", description="Write 250 words on global warming.", deadline_str="Tomorrow 23:59")
        ct2 = ClassTask(class_id=pc1.id, title="Complete Mock Listening Test 4", description="Use the Liberum Mock engine.", deadline_str="Next Monday")
        master_db.add_all([ct1, ct2])
        master_db.commit()

        # 4. Add Class Messages
        msg1 = ClassMessage(class_id=pc1.id, sender_id=t1.id, message="Welcome to the IELTS Mastery course! Please check the assignments.")
        msg2 = ClassMessage(class_id=pc1.id, sender_id=s1.id, message="Thank you teacher, I have completed the first essay.")
        master_db.add_all([msg1, msg2])
        master_db.commit()

        # 5. Add Timeline Events
        ev1 = ClassTimelineEvent(class_id=pc1.id, title="Course Started", event_date_str="2026-08-01")
        ev2 = ClassTimelineEvent(class_id=pc1.id, title="First Mock Exam Completed", event_date_str="2026-08-10")
        master_db.add_all([ev1, ev2])
        master_db.commit()

        # 6. Add Mock Attempts for students
        exam = master_db.query(MockExam).first()
        if exam:
            attempt = MockAttempt(
                tenant_id=demo_tenant.id,
                student_id=s1.id,
                exam_id=exam.id,
                teacher_id=t1.id,
                status="completed",
                started_at=datetime.now(timezone.utc) - timedelta(days=2),
                completed_at=datetime.now(timezone.utc) - timedelta(days=2) + timedelta(hours=2),
                band_score=7.5
            )
            master_db.add(attempt)
            master_db.commit()

        # 7. Add Lessons to Tenant DB (Timetable)
        engine = get_tenant_engine(demo_tenant.db_filename)
        tenant_db = sessionmaker(bind=engine)()
        try:
            g1 = tenant_db.query(Group).filter_by(name="IELTS Intensive (Demo)").first()
            if g1:
                today = datetime.now(timezone.utc).date()
                l1 = Lesson(group_id=g1.id, date=today, topic="Reading Strategies: True/False/Not Given", status="scheduled")
                l2 = Lesson(group_id=g1.id, date=today - timedelta(days=2), topic="Writing Task 1 Overview", status="completed")
                l3 = Lesson(group_id=g1.id, date=today + timedelta(days=2), topic="Speaking Mock Interviews", status="scheduled")
                tenant_db.add_all([l1, l2, l3])
                tenant_db.commit()
                
                # Add attendance for the completed lesson
                students = tenant_db.query(Student).filter_by(group_id=g1.id).all()
                for st in students:
                    tenant_db.add(Attendance(lesson_id=l2.id, student_id=st.id, status=random.choice(["present", "present", "late"])))
                tenant_db.commit()
                
            print("Successfully populated all features (Classes, Timetable, Homework, Mocks, Messages)!")
        finally:
            tenant_db.close()

    finally:
        master_db.close()

if __name__ == "__main__":
    clean_and_reseed()
