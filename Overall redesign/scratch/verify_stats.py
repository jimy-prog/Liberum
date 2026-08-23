from database import get_tenant_engine
from master_database import SessionMaster
from sqlalchemy.orm import sessionmaker

engine = get_tenant_engine("tenant_demo_investor.db")
Session = sessionmaker(bind=engine)
db = Session()

from routers.dashboard import dashboard
# It's a FastAPI route so I can't call it easily. I'll just run queries.

from database import Group, Lesson, Attendance, Student, Payment
today = "2026-08-01"
ms = "2026-08-01"
groups = db.query(Group).filter(Group.status == 'active').all()
print("Groups:", len(groups))
expected = sum(g.lessons_per_week * g.weeks_per_month for g in groups)
print("Expected:", expected)
held = db.query(Lesson).filter(Lesson.status=="Held").count()
print("Held:", held)
cnt_att = db.query(Attendance).count()
print("Attendance:", cnt_att)
print("Students active:", db.query(Student).filter(Student.active==True, Student.archived==False, Student.banned==False).count())

