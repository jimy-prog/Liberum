import sys
import os
sys.path.append(os.path.abspath('.'))

from database import get_tenant_engine, Group, Student, Lesson, Attendance, Payment
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random

engine = get_tenant_engine("tenant_demo_investor.db")
Session = sessionmaker(bind=engine)
db = Session()

# 1. Groups
new_groups = [
    "IELTS Foundation B", "Kids English (Beginner)", "Intensive IELTS", "General English B2"
]
created_groups = []
for name in new_groups:
    g = db.query(Group).filter_by(name=name).first()
    if not g:
        g = Group(
            name=name, status="active", 
            lessons_per_week=3, weeks_per_month=4, 
            teacher_pct=0.5, price_monthly=750000
        )
        db.add(g)
        created_groups.append(g)

db.commit()

all_groups = db.query(Group).all()

# 2. Students
names = [
    "Aziz Yusupov", "Malika Rustamova", "Rustam Qodirov", "Olimjon Turaev",
    "Dilnoza Karimova", "Sardor Muminov", "Shahnoza Aliyeva", "Nodirbek Sobirov",
    "Gavhar Ibragimova", "Zuhra Numanova", "Farhod Jumaev", "Kamila Shokirova",
    "Bobur Xoliqov", "Leyla Ibragimova", "Akmal Askarov", "Zarina Umarova"
]

for name in names:
    s = db.query(Student).filter_by(name=name).first()
    if not s:
        g = random.choice(all_groups)
        s = Student(
            name=name, group_id=g.id, active=True, archived=False, banned=False,
            phone="+998 90 123 45 67"
        )
        db.add(s)
db.commit()

all_students = db.query(Student).all()
students_by_group = {g.id: [s for s in all_students if s.group_id == g.id] for g in all_groups}

# 3. Historical Lessons and Attendance
# From March 2026 to August 2026
months = [
    (2026, 3), (2026, 4), (2026, 5), (2026, 6), (2026, 7), (2026, 8)
]

for year, month in months:
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year+1, 1, 1) - timedelta(days=1)
    else:
        end_date = datetime(year, month+1, 1) - timedelta(days=1)
    
    # We will just generate ~10 lessons per group per month
    for g in all_groups:
        # Check if already seeded lessons for this month
        existing = db.query(Lesson).filter(Lesson.group_id == g.id, Lesson.date >= start_date.date(), Lesson.date <= end_date.date()).count()
        if existing < 5:
            # Seed
            for i in range(10):
                day = random.randint(1, min(28, end_date.day))
                l_date = datetime(year, month, day).date()
                l_time = f"{random.randint(9,18):02d}:00"
                # Some online
                room = "Zoom" if random.random() < 0.2 else "Room A"
                status = "Held"
                
                l = Lesson(
                    group_id=g.id, date=l_date, time=l_time, 
                    topic=f"Topic {i+1}", status=status, room=room
                )
                db.add(l)
                db.flush()
                
                # Attendance
                for s in students_by_group[g.id]:
                    # 85% chance present
                    att_status = "Present" if random.random() < 0.85 else ("Absent" if random.random() < 0.5 else "Excused")
                    att = Attendance(lesson_id=l.id, student_id=s.id, status=att_status)
                    db.add(att)
                    
    # Payments
    month_str = f"{year}-{month:02d}"
    for s in all_students:
        existing_pay = db.query(Payment).filter(Payment.student_id == s.id, Payment.month == month_str).first()
        if not existing_pay:
            # 90% chance paid
            if random.random() < 0.9:
                g = next((x for x in all_groups if x.id == s.group_id), None)
                amount = g.price_monthly if g else 750000
                pay = Payment(
                    student_id=s.id, amount=amount, month=month_str,
                    method=random.choice(["Card", "Cash"]), date=start_date.date()
                )
                db.add(pay)

db.commit()
print("Historical seeding complete!")
