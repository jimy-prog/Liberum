import sqlite3
from datetime import date

db_path = 'database_tenants/tenant_demo_investor.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get students in group 1
cur.execute("SELECT id FROM students WHERE group_id=1")
g1_students = [r[0] for r in cur.fetchall()]

# Get students in group 2
cur.execute("SELECT id FROM students WHERE group_id=2")
g2_students = [r[0] for r in cur.fetchall()]

# Get lessons
cur.execute("SELECT id, group_id FROM lessons")
lessons = cur.fetchall()

for l_id, g_id in lessons:
    st_list = g1_students if g_id == 1 else g2_students
    for s_id in st_list:
        cur.execute("INSERT INTO attendance (lesson_id, student_id, status) VALUES (?, ?, 'Present')", (l_id, s_id))

# Create a lesson for today
today = date.today().strftime('%Y-%m-%d')
cur.execute("INSERT INTO lessons (group_id, date, time, status) VALUES (1, ?, '14:00', 'Scheduled')", (today,))
cur.execute("INSERT INTO lessons (group_id, date, time, status) VALUES (2, ?, '16:00', 'Scheduled')", (today,))

conn.commit()
conn.close()
print("Attendance added!")
