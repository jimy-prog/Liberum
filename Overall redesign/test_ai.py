import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from master_database import SessionMaster, User
from database import get_tenant_engine, Student

master_db = SessionMaster()
user = master_db.query(User).first()
if not user:
    print("No user")
    sys.exit(1)
print(f"User: {user.email}, {user.full_name}, {user.phone}")

tenant_db_filename = user.tenant.db_filename
engine = get_tenant_engine(tenant_db_filename)
SessionLocal = sessionmaker(bind=engine)
tenant_db = SessionLocal()

student = tenant_db.query(Student).filter(
    (Student.email == user.email) | (Student.phone == user.phone) | (Student.name == user.full_name)
).first()
if not student:
    print("No student found for user")
else:
    print(f"Student found: {student.name}, id {student.id}")
