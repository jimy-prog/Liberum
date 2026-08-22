import os
from datetime import datetime, timedelta
import random

from master_database import SessionMaster, PlatformTenant
from database import get_tenant_engine, Group, Student, Lesson, Attendance, Payment
from sqlalchemy.orm import sessionmaker

def seed_more_students():
    master_db = SessionMaster()
    try:
        tenant = master_db.query(PlatformTenant).filter_by(slug="lexora_admin").first()
        if not tenant:
            print("Admin tenant not found!")
            return
            
        engine = get_tenant_engine(tenant.db_filename)
        tenant_db = sessionmaker(bind=engine)()
        
        try:
            g1 = tenant_db.query(Group).filter_by(name="IELTS Intensive (Demo)").first()
            g2 = tenant_db.query(Group).filter_by(name="General English B2 (Demo)").first()
            
            if not g1 or not g2:
                print("Demo groups not found.")
                return
                
            new_students_g1 = [
                "Alex Johnson", "Maria Garcia", "Wei Chen", "James Smith", "Sophie Martin"
            ]
            new_students_g2 = [
                "Ahmed Hassan", "Elena Petrova", "David Kim", "Sarah O'Connor", "Lucas Silva"
            ]
            
            today = datetime.utcnow().date()
            
            for name in new_students_g1:
                email = f"{name.split()[0].lower()}@demo.com"
                if not tenant_db.query(Student).filter_by(email=email).first():
                    st = Student(name=name, email=email, group_id=g1.id, start_date=today - timedelta(days=random.randint(10, 30)))
                    tenant_db.add(st)
                    tenant_db.commit()
                    
                    # Add Payment
                    p = Payment(student_id=st.id, amount=150.0, month="2026-08", paid_date=today - timedelta(days=random.randint(1, 15)), method="Cash", notes="Monthly Tuition")
                    tenant_db.add(p)
                    tenant_db.commit()

            for name in new_students_g2:
                email = f"{name.split()[0].lower()}@demo.com"
                if not tenant_db.query(Student).filter_by(email=email).first():
                    st = Student(name=name, email=email, group_id=g2.id, start_date=today - timedelta(days=random.randint(10, 30)))
                    tenant_db.add(st)
                    tenant_db.commit()
                    
                    # Add Payment
                    p = Payment(student_id=st.id, amount=100.0, month="2026-08", paid_date=today - timedelta(days=random.randint(1, 15)), method="Card", notes="Monthly Tuition")
                    tenant_db.add(p)
                    tenant_db.commit()
                    
            print("Added 10 more offline students and payments successfully.")
            
        finally:
            tenant_db.close()
            
    finally:
        master_db.close()

if __name__ == "__main__":
    seed_more_students()
