from master_database import SessionMaster, User
from database import get_tenant_engine, Student
from sqlalchemy.orm import sessionmaker

master_db = SessionMaster()
user = master_db.query(User).filter(User.role == 'student').first()
print(f"User: email={user.email}, phone={user.phone}, full_name={user.full_name}, tenant={user.tenant.db_filename}")

engine = get_tenant_engine(user.tenant.db_filename)
tenant_db = sessionmaker(bind=engine)()
student = tenant_db.query(Student).filter(
    (Student.email == user.email) | (Student.phone == user.phone) | (Student.name == user.full_name)
).first()

if student:
    print(f"Found student: id={student.id}")
else:
    print("Student not found!")
