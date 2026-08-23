with open("database.py", "r") as f:
    text = f.read()

expense_model = '''
class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True)
    amount = Column(Float, default=0)
    description = Column(String, nullable=True)
    category = Column(String, default="General")
    date = Column(Date, default=datetime.utcnow)
'''

if "class Expense" not in text:
    text = text.replace('class Payment(Base):', expense_model + '\nclass Payment(Base):')
    with open("database.py", "w") as f:
        f.write(text)

# And ensure tables are created
import sys, os
sys.path.append(os.path.abspath('.'))
from database import engine_admin, Base
Base.metadata.create_all(bind=engine_admin)
print("Expense model added.")
