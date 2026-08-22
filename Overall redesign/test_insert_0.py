from database import get_tenant_engine, AIChatSession
from sqlalchemy.orm import sessionmaker

engine = get_tenant_engine("tenant_1.db")
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

session = AIChatSession(student_id=0, title="Test")
db.add(session)
try:
    db.commit()
    print("Success inserting student_id=0")
except Exception as e:
    print("Error:", e)
