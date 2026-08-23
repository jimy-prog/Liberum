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

print("Expense model added to database.py")
