import os
from datetime import datetime, timedelta
import random

from master_database import SessionMaster, User, TeacherProfile, StudentProfile, PlatformTenant, MockAttempt, MockExam, ExamSection
from database import get_tenant_engine, Group, Student, Lesson, Attendance, Payment, TestResult, WeeklyPerformance
from auth import hash_pw
from sqlalchemy.orm import sessionmaker

def seed_data():
    master_db = SessionMaster()
    try:
        tenant = master_db.query(PlatformTenant).filter_by(slug="lexora_admin").first()
        if not tenant:
            print("Admin tenant not found!")
            return
            
        print("Creating users...")
        # Check if users already exist
        if not master_db.query(User).filter_by(username="teacher_demo1").first():
            t1 = User(tenant_id=tenant.id, username="teacher_demo1", email="teacher1@demo.com", full_name="Sarah Jenkins", role="teacher", password_hash=hash_pw("demo"), is_active=True)
            t2 = User(tenant_id=tenant.id, username="teacher_demo2", email="teacher2@demo.com", full_name="Michael Chang", role="teacher", password_hash=hash_pw("demo"), is_active=True)
            s1 = User(tenant_id=tenant.id, username="student_demo1", email="student1@demo.com", full_name="Emma Watson", role="student", password_hash=hash_pw("demo"), is_active=True)
            s2 = User(tenant_id=tenant.id, username="student_demo2", email="student2@demo.com", full_name="Liam Neeson", role="student", password_hash=hash_pw("demo"), is_active=True)
            master_db.add_all([t1, t2, s1, s2])
            master_db.commit()
            
            # Profiles
            master_db.add(TeacherProfile(user_id=t1.id, description="Experienced IELTS examiner with 10 years of teaching history.", is_public_for_reviews=True, rating_avg=4.9))
            master_db.add(TeacherProfile(user_id=t2.id, description="Native speaker focusing on conversational English and grammar.", is_public_for_reviews=True, rating_avg=4.8))
            master_db.add(StudentProfile(user_id=s1.id, phone="123456789", parent_phone="987654321"))
            master_db.add(StudentProfile(user_id=s2.id, phone="555555555", parent_phone="444444444"))
            master_db.commit()
            print("Users created.")
        else:
            print("Users already seeded.")
            
        t1 = master_db.query(User).filter_by(username="teacher_demo1").first()
        t2 = master_db.query(User).filter_by(username="teacher_demo2").first()
        s1 = master_db.query(User).filter_by(username="student_demo1").first()
        s2 = master_db.query(User).filter_by(username="student_demo2").first()

        # Seed mock exams if not exists
        if not master_db.query(MockExam).filter_by(title="IELTS Academic Full Test - Demo").first():
            exam = MockExam(title="IELTS Academic Full Test - Demo", exam_type="IELTS", test_scope="Full Test", test_mode="Exam Mode", is_published=True)
            master_db.add(exam)
            master_db.commit()
            
            # Sections
            sec1 = ExamSection(exam_id=exam.id, section_type="READING", time_limit_minutes=60, order=1)
            sec2 = ExamSection(exam_id=exam.id, section_type="LISTENING", time_limit_minutes=40, order=2)
            sec3 = ExamSection(exam_id=exam.id, section_type="WRITING", time_limit_minutes=60, order=3)
            sec4 = ExamSection(exam_id=exam.id, section_type="SPEAKING", time_limit_minutes=15, order=4)
            master_db.add_all([sec1, sec2, sec3, sec4])
            master_db.commit()
            
            # Add attempts
            att1 = MockAttempt(tenant_id=tenant.id, student_id=s1.id, exam_id=exam.id, status="COMPLETED", started_at=datetime.utcnow() - timedelta(days=2), completed_at=datetime.utcnow() - timedelta(days=2, hours=-2), total_score=35, band_score=7.0, reviewer_type="ai")
            master_db.add(att1)
            master_db.commit()

        # Tenant Database Seeding
        engine = get_tenant_engine(tenant.db_filename)
        tenant_db = sessionmaker(bind=engine)()
        
        try:
            # Check groups
            g1 = tenant_db.query(Group).filter_by(name="IELTS Intensive (Demo)").first()
            if not g1:
                g1 = Group(name="IELTS Intensive (Demo)", status="active")
                g2 = Group(name="General English B2 (Demo)", status="active")
                tenant_db.add_all([g1, g2])
                tenant_db.commit()
            else:
                g2 = tenant_db.query(Group).filter_by(name="General English B2 (Demo)").first()
                
            # Assign students
            if not tenant_db.query(Student).filter_by(email=s1.email).first():
                st1 = Student(name=s1.full_name, email=s1.email, group_id=g1.id, start_date=datetime.utcnow().date())
                st2 = Student(name=s2.full_name, email=s2.email, group_id=g2.id, start_date=datetime.utcnow().date())
                tenant_db.add_all([st1, st2])
                tenant_db.commit()
            else:
                st1 = tenant_db.query(Student).filter_by(email=s1.email).first()
                st2 = tenant_db.query(Student).filter_by(email=s2.email).first()
                
            # Lessons
            if not tenant_db.query(Lesson).filter_by(group_id=g1.id).first():
                today = datetime.utcnow().date()
                l1 = Lesson(group_id=g1.id, date=today, time="10:00 - 11:30", topic="Reading Comprehension & Matching Headings", status="Held")
                l2 = Lesson(group_id=g1.id, date=today + timedelta(days=2), time="10:00 - 11:30", topic="Writing Task 1 - Line Graphs", status="Scheduled")
                l3 = Lesson(group_id=g2.id, date=today, time="14:00 - 15:30", topic="Present Perfect vs Past Simple", status="Scheduled")
                tenant_db.add_all([l1, l2, l3])
                tenant_db.commit()
                
                # Attendance
                a1 = Attendance(lesson_id=l1.id, student_id=st1.id, status="present")
                tenant_db.add(a1)
                tenant_db.commit()
                
                # Payment
                p1 = Payment(student_id=st1.id, amount=150.0, month="2026-08", paid_date=today - timedelta(days=5), method="Card", notes="Monthly Tuition")
                tenant_db.add(p1)
                tenant_db.commit()
                print("Tenant dummy data created successfully.")
            else:
                print("Tenant dummy data already seeded.")
                
        finally:
            tenant_db.close()
            
    finally:
        master_db.close()

if __name__ == "__main__":
    seed_data()
