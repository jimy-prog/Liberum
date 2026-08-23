import sys, os
from sqlalchemy.orm import sessionmaker
from datetime import datetime, date

from master_database import SessionMaster, PlatformTenant
from database import get_tenant_engine, Base
from routers.waitlist import WaitlistEntry

master_db = SessionMaster()
tenant = master_db.query(PlatformTenant).filter_by(slug="demo_investor").first()
if not tenant:
    print("Demo tenant not found")
    sys.exit(1)

engine = get_tenant_engine(tenant.db_filename)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
tdb = Session()

entries = [
    WaitlistEntry(name="Eleanor Vance", phone="+998901234567", parent_name="Margaret Vance", mode="in-person", wants_group="IELTS Intensive", schedule_pref="Evening", goal="Study abroad", how_found="Instagram", trial_date="2026-09-01", status="new", enquiry_date=datetime.now()),
    WaitlistEntry(name="Jamshid Maxkamov", phone="+998905554433", parent_name="", mode="in-person", wants_group="", schedule_pref="", goal="Work", how_found="Friends", trial_date="2026-09-02", status="contacted", enquiry_date=datetime.now()),
    WaitlistEntry(name="Demo User", phone="+998909998877", parent_name="", mode="online", wants_group="Pre-Intermediate", schedule_pref="Morning", goal="Travel", how_found="Google Form", trial_date="", status="trial", enquiry_date=datetime.now()),
    WaitlistEntry(name="Timur A", phone="+998902223344", parent_name="Ali A", mode="in-person", wants_group="Kids English", schedule_pref="Weekends", goal="School", how_found="Flyer", trial_date="", status="new", enquiry_date=datetime.now()),
]

for e in entries:
    tdb.add(e)
tdb.commit()
print("Waitlist seeded!")
