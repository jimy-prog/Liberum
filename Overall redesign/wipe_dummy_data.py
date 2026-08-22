import sys
import os
from sqlalchemy.orm import Session
from master_database import SessionMaster, User, PlatformTenant, MockAttempt, AuthSession, EmailOTP, PhoneOTP, TeacherProfile, StudentProfile
from auth import hash_pw
import auth

def run_wipe():
    db = SessionMaster()
    try:
        # Keep Owner ID 1
        owner = db.query(User).filter(User.id == 1).first()
        if not owner:
            print("Owner not found!")
            return
            
        owner.password_hash = auth.hash_pw("Owner2026!")
        print("Updated owner password to Owner2026!")

        # Delete all other users
        users_to_delete = db.query(User).filter(User.id != 1).all()
        for u in users_to_delete:
            db.delete(u)
        
        # Also clean up OTPs and orphan mock attempts
        db.query(EmailOTP).delete()
        db.query(PhoneOTP).delete()
        
        db.commit()

        # Create 1 Teacher
        teacher = User(
            tenant_id=1,
            username="teacher_demo",
            email="teacher@liberum.uz",
            full_name="Demo Teacher",
            role="teacher",
            password_hash=auth.hash_pw("Teacher2026!"),
            is_active=True
        )
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
        
        tp = TeacherProfile(user_id=teacher.id, description="Senior IELTS Instructor")
        db.add(tp)

        # Create 1 Student
        student = User(
            tenant_id=1,
            username="student_demo",
            email="student@liberum.uz",
            full_name="Demo Student",
            role="student",
            password_hash=auth.hash_pw("Student2026!"),
            is_active=True
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        
        sp = StudentProfile(user_id=student.id)
        db.add(sp)
        
        db.commit()
        
        print("Data wiped! Created demo teacher and student.")
        print(f"Owner: {owner.email} / Owner2026!")
        print(f"Teacher: teacher@liberum.uz / Teacher2026!")
        print(f"Student: student@liberum.uz / Student2026!")

    finally:
        db.close()

if __name__ == "__main__":
    run_wipe()
