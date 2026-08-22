import os
import shutil
from datetime import datetime, timedelta
import random

from master_database import SessionMaster, User, PlatformTenant
from database import get_tenant_engine, Base, Group, Student, Lesson, Attendance, Payment
from sqlalchemy.orm import sessionmaker
from auth import hash_pw

def clean_and_reseed():
    master_db = SessionMaster()
    
    try:
        # 1. Remove old demo users from master
        old_users = ['teacher_demo1', 'teacher_demo2', 'student_demo1', 'student_demo2']
        for username in old_users:
            u = master_db.query(User).filter_by(username=username).first()
            if u:
                master_db.delete(u)
        master_db.commit()

        # 2. Create new demo tenant
        demo_tenant = master_db.query(PlatformTenant).filter_by(slug="demo_investor").first()
        if not demo_tenant:
            demo_tenant = PlatformTenant(
                slug="demo_investor",
                db_filename="tenant_demo_investor.db"
            )
            master_db.add(demo_tenant)
            master_db.commit()

        # 3. Create Demo Users in master, assigned to the new tenant
        # Teachers
        t1 = User(
            username="teacher_demo1",
            password_hash=hash_pw("demo"),
            email="timur@demo.com",
            full_name="Timur Abdullaev",
            role="teacher",
            tenant_id=demo_tenant.id
        )
        t2 = User(
            username="teacher_demo2",
            password_hash=hash_pw("demo"),
            email="sergey@demo.com",
            full_name="Sergey Ivanov",
            role="teacher",
            tenant_id=demo_tenant.id
        )
        
        # Students
        s1 = User(
            username="student_demo1",
            password_hash=hash_pw("demo"),
            email="aziza@demo.com",
            full_name="Aziza Karimova",
            role="student",
            tenant_id=demo_tenant.id
        )
        s2 = User(
            username="student_demo2",
            password_hash=hash_pw("demo"),
            email="anastasia@demo.com",
            full_name="Anastasia Volkova",
            role="student",
            tenant_id=demo_tenant.id
        )
        
        master_db.add_all([t1, t2, s1, s2])
        master_db.commit()

        # 4. Initialize the new tenant database
        tenant_db_path = f"tenant_demo_investor.db"
        engine = get_tenant_engine(tenant_db_path)
        Base.metadata.create_all(engine)
        tenant_db = sessionmaker(bind=engine)()

        try:
            # Create Groups
            g1 = Group(name="IELTS Intensive (Demo)")
            g2 = Group(name="General English B2 (Demo)")
            tenant_db.add_all([g1, g2])
            tenant_db.commit()

            # Create internal student records mapping to the users
            st1 = Student(name="Aziza Karimova", email="aziza@demo.com", group_id=g1.id)
            st2 = Student(name="Anastasia Volkova", email="anastasia@demo.com", group_id=g2.id)
            
            # Add some offline students with Uzbek/Russian names
            offline_names_g1 = ["Rustam Qodirov", "Alisher Navoi", "Dmitry Smirnov"]
            offline_names_g2 = ["Oksana Popova", "Igor Sokolov", "Madina Umarova"]
            
            for name in offline_names_g1:
                tenant_db.add(Student(name=name, email=f"{name.split()[0].lower()}@demo.com", group_id=g1.id))
            for name in offline_names_g2:
                tenant_db.add(Student(name=name, email=f"{name.split()[0].lower()}@demo.com", group_id=g2.id))
                
            tenant_db.add_all([st1, st2])
            tenant_db.commit()

            # Create some payments
            today = datetime.utcnow().date()
            for student in tenant_db.query(Student).all():
                tenant_db.add(Payment(
                    student_id=student.id,
                    amount=float(random.randint(100, 200)),
                    month=today.strftime("%Y-%m"),
                    paid_date=today - timedelta(days=random.randint(1, 20)),
                    method="Card" if random.choice([True, False]) else "Cash",
                    notes="Tuition"
                ))
            tenant_db.commit()
            
            print("Successfully created demo_investor tenant with Uzbek/Russian demo data!")
        finally:
            tenant_db.close()

    finally:
        master_db.close()

if __name__ == "__main__":
    clean_and_reseed()
