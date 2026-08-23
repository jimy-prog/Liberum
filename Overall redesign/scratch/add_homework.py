with open("database.py", "r") as f:
    text = f.read()

import re
if 'homework = Column(Integer, nullable=True)' not in text:
    text = text.replace('vocabulary = Column(Integer, nullable=True)', 'vocabulary = Column(Integer, nullable=True)\n    homework = Column(Integer, nullable=True)')
    with open("database.py", "w") as f:
        f.write(text)
print("Homework column added to database.py")
