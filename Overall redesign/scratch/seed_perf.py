import sys
import os
sys.path.append(os.path.abspath('.'))
from database import get_tenant_engine, Student, WeeklyPerformance
from sqlalchemy.orm import sessionmaker
import random
import datetime

engine = get_tenant_engine("tenant_demo_investor.db")
db = sessionmaker(bind=engine)()

students = db.query(Student).all()
month = datetime.date.today().strftime("%Y-%m")

for s in students:
    for w in range(1, 5):
        wp = db.query(WeeklyPerformance).filter_by(student_id=s.id, month=month, week_num=w).first()
        if not wp:
            wp = WeeklyPerformance(student_id=s.id, month=month, week_num=w)
            db.add(wp)
        
        # Give random 0-10 scores
        wp.grammar = random.randint(4, 10)
        wp.activity = random.randint(4, 10)
        wp.vocabulary = random.randint(4, 10)

db.commit()
print("Performance seeded!")
