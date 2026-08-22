import os
import random
from datetime import datetime, timedelta, date, timezone

from master_database import SessionMaster, PlatformTenant
from database import get_tenant_engine, Group, Student, Payment, WeeklyPerformance
from routers.waitlist import WaitlistEntry
from sqlalchemy.orm import sessionmaker

def scale_data():
    master_db = SessionMaster()
    try:
        tenant = master_db.query(PlatformTenant).filter_by(slug="demo_investor").first()
        if not tenant:
            print("No demo_investor tenant found!")
            return

        engine = get_tenant_engine(tenant.db_filename)
        db = sessionmaker(bind=engine)()
        
        try:
            print("1. Adding 5 Active Groups...")
            groups = [
                Group(name="IELTS Intensive", status="active", price_monthly=200, lessons_per_week=3, weeks_per_month=4, teacher_pct=50),
                Group(name="TOEFL Prep", status="active", price_monthly=180, lessons_per_week=3, weeks_per_month=4, teacher_pct=50),
                Group(name="General English B2", status="active", price_monthly=150, lessons_per_week=2, weeks_per_month=4, teacher_pct=40),
                Group(name="Speaking Club", status="active", price_monthly=50, lessons_per_week=1, weeks_per_month=4, teacher_pct=60),
                Group(name="Beginner English A1", status="active", price_monthly=120, lessons_per_week=2, weeks_per_month=4, teacher_pct=40),
            ]
            # Ignore duplicate names if they already exist from previous seeds
            for g in groups:
                if not db.query(Group).filter_by(name=g.name).first():
                    db.add(g)
            db.commit()

            active_groups = db.query(Group).filter(Group.status == "active").all()
            if not active_groups:
                print("No groups!")
                return

            print("2. Generating 20+ Active Students...")
            uz_ru_names = [
                "Alisher Navoi", "Rustam Qodirov", "Oksana Popova", "Igor Sokolov", "Madina Umarova",
                "Dmitry Smirnov", "Malika Tursunova", "Ivan Petrov", "Guzal Karimov", "Nikolay Volkov",
                "Sevara Ahmedova", "Anton Zaytsev", "Dilshod Rakhimov", "Elena Morozova", "Sardor Yusupov",
                "Yulia Novikova", "Farrukh Saidov", "Tatiana Lebedeva", "Jamshid Makhmudov", "Natalia Kozlova"
            ]
            
            # Start date roughly 1-3 months ago
            base_date = date.today()
            
            for name in uz_ru_names:
                if not db.query(Student).filter_by(name=name).first():
                    g = random.choice(active_groups)
                    start = base_date - timedelta(days=random.randint(10, 90))
                    s = Student(name=name, email=f"{name.split()[0].lower()}@demo.com", phone=f"+99890{random.randint(1000000, 9999999)}", group_id=g.id, active=True, archived=False, start_date=start)
                    db.add(s)
            db.commit()

            print("3. Generating Archived Students...")
            archive_names = ["Jasur Bek", "Oleg Popov", "Lola Azizova", "Maxim Kim", "Shirina Oripova"]
            for name in archive_names:
                if not db.query(Student).filter_by(name=name).first():
                    g = random.choice(active_groups)
                    start = base_date - timedelta(days=120)
                    end = base_date - timedelta(days=random.randint(5, 30))
                    s = Student(name=name, email=f"{name.split()[0].lower()}@demo.com", phone=f"+99890{random.randint(1000000, 9999999)}", group_id=g.id, active=False, archived=True, start_date=start, end_date=end)
                    db.add(s)
            db.commit()

            print("4. Generating Waitlist Entries...")
            wl_data = [
                ("Nigina Yuldasheva", "trial"),
                ("Artyom Dzyuba", "contacted"),
                ("Zilola Qurbonova", "new"),
                ("Denis Cheryshev", "new"),
                ("Umidjon Toshmatov", "trial"),
                ("Svetlana Ivanova", "contacted"),
                ("Aliya Ibragimova", "new"),
            ]
            for name, status in wl_data:
                if not db.query(WaitlistEntry).filter_by(name=name).first():
                    g = random.choice(active_groups)
                    wl = WaitlistEntry(
                        name=name, phone=f"+99893{random.randint(1000000, 9999999)}",
                        desired_group_id=g.id, preferred_schedule="Evening",
                        how_found=random.choice(["Instagram", "Google", "Friend/Referral"]),
                        status=status, enquiry_date=base_date - timedelta(days=random.randint(1, 15))
                    )
                    db.add(wl)
            db.commit()

            print("5. Generating Financial Data (Payments)...")
            students = db.query(Student).all()
            months = [
                base_date.strftime("%Y-%m"),
                (base_date.replace(day=1) - timedelta(days=1)).strftime("%Y-%m"),
                (base_date.replace(day=1) - timedelta(days=32)).strftime("%Y-%m")
            ]
            
            for s in students:
                for month_str in months:
                    # check if already paid
                    if not db.query(Payment).filter_by(student_id=s.id, month=month_str).first():
                        if random.random() > 0.2: # 80% paid
                            amt = 200
                            if s.group: amt = s.group.price_monthly
                            p = Payment(student_id=s.id, amount=float(amt), month=month_str, paid_date=base_date - timedelta(days=random.randint(1, 60)), method=random.choice(["Card", "Cash"]), notes="Auto-seeded")
                            db.add(p)
            db.commit()

            print("6. Generating Weekly Performance...")
            for s in students:
                for w in range(1, 5):
                    if not db.query(WeeklyPerformance).filter_by(student_id=s.id, month=months[0], week_num=w).first():
                        perf = WeeklyPerformance(
                            student_id=s.id, month=months[0], week_num=w,
                            grammar=random.randint(60, 100), activity=random.randint(50, 100), vocabulary=random.randint(60, 100)
                        )
                        db.add(perf)
            db.commit()
            
            print("Data scaled up successfully!")

        finally:
            db.close()
    finally:
        master_db.close()

if __name__ == "__main__":
    scale_data()
