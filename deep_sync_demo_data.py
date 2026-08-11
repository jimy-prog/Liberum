import random
from datetime import datetime, timedelta, date

from master_database import SessionMaster, PlatformTenant
from database import get_tenant_engine, Group, Student, Payment, WeeklyPerformance, Lesson, Attendance
from routers.homework_router import Homework, HomeworkSubmission
from routers.profile import TeacherProfile
from sqlalchemy.orm import sessionmaker

def deep_sync():
    master_db = SessionMaster()
    try:
        tenant = master_db.query(PlatformTenant).filter_by(slug="demo_investor").first()
        if not tenant:
            return

        engine = get_tenant_engine(tenant.db_filename)
        db = sessionmaker(bind=engine)()
        
        try:
            print("1. Updating Teacher Profile...")
            profile = db.query(TeacherProfile).first()
            if not profile:
                profile = TeacherProfile(name="Timur Abdullaev", title="Senior Instructor")
                db.add(profile)
            profile.phone = "+998 90 123 45 67"
            profile.photo_path = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            db.commit()

            print("2. Generating Lessons and Attendance...")
            groups = db.query(Group).filter(Group.status == "active").all()
            base_date = date.today()
            start_date = base_date - timedelta(days=60) # 2 months ago
            
            day_map = {"Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6}

            for g in groups:
                days_str = g.schedule.split("/")
                days_int = [day_map.get(d) for d in days_str if day_map.get(d) is not None]
                if not days_int:
                    days_int = [0, 2, 4] # default MWF
                    
                students = db.query(Student).filter(Student.group_id == g.id).all()
                if not students: continue

                curr_date = start_date
                time_str = f"{random.randint(14,19)}:00"
                
                while curr_date <= base_date + timedelta(days=14): # up to 2 weeks in future
                    if curr_date.weekday() in days_int:
                        # Check if lesson exists
                        lesson = db.query(Lesson).filter_by(group_id=g.id, date=curr_date).first()
                        if not lesson:
                            status = "Held" if curr_date <= base_date else "Scheduled"
                            lesson = Lesson(group_id=g.id, date=curr_date, time=time_str, status=status)
                            db.add(lesson)
                            db.flush()
                            
                            # Mark attendance
                            if status == "Held":
                                for s in students:
                                    att_status = "Present" if random.random() > 0.1 else "Absent" # 90% attendance
                                    db.add(Attendance(lesson_id=lesson.id, student_id=s.id, status=att_status))
                            
                            # Homework (1 per week)
                            if status == "Held" and random.random() > 0.6:
                                hw = Homework(lesson_id=lesson.id, title=f"{g.name} Weekly Task", due_date=curr_date + timedelta(days=7), completed=False)
                                db.add(hw)
                                db.flush()
                                for s in students:
                                    if random.random() > 0.2: # 80% submitted
                                        db.add(HomeworkSubmission(homework_id=hw.id, student_id=s.id, submitted=True))
                                        
                    curr_date += timedelta(days=1)
                
                # Generate WeeklyPerformance for the current and previous month
                for month_offset in [0, 1]:
                    perf_date = base_date - timedelta(days=30*month_offset)
                    month_str = perf_date.strftime("%Y-%m")
                    for s in students:
                        for week in range(1, 5):
                            perf = db.query(WeeklyPerformance).filter_by(student_id=s.id, month=month_str, week_num=week).first()
                            if not perf:
                                db.add(WeeklyPerformance(
                                    student_id=s.id,
                                    month=month_str,
                                    week_num=week,
                                    grammar=random.randint(60, 100),
                                    activity=random.randint(60, 100),
                                    vocabulary=random.randint(60, 100)
                                ))
            
            db.commit()
            print("Data synced successfully! Finance and Performance dashboards should now be active.")
            
        finally:
            db.close()
    finally:
        master_db.close()

if __name__ == "__main__":
    deep_sync()
