import sqlite3
from datetime import date, timedelta
import random

db_path = 'database_tenants/tenant_demo_investor.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.executescript("""
DELETE FROM payments;
DELETE FROM attendance;
DELETE FROM lessons;
DELETE FROM waitlist;
DELETE FROM students;
DELETE FROM groups;
""")

groups = [
    ('IELTS Foundation A', '#7B61FF', 'Mon, Wed, Fri 14:00', 'In-person'),
    ('Pre-IELTS Evening', '#FFD60A', 'Tue, Thu 16:00', 'In-person'),
    ('Speaking Club', '#30D158', 'Sat 17:00', 'Online')
]
for i, (n, c, s, m) in enumerate(groups):
    cur.execute("INSERT INTO groups (id, name, color, schedule, mode, price_monthly) VALUES (?, ?, ?, ?, ?, 400000)", (i+1, n, c, s, m))

waitlist = [
    ('Bekzod Rahimov', 'Instagram', 'IELTS 6.5', 'new', 'Wants evening group'),
    ('Gulnoza Saidova', 'Referral', 'General English', 'new', 'Online preferred'),
    ('Temur Ismoilov', 'Telegram', 'IELTS 7.0', 'contacted', 'Call back Monday'),
    ('Madina Kamilova', 'Instagram', 'IELTS 6.0', 'trial', 'Trial Sat 14:00 - IELTS A'),
    ('Ivan Ivanov', 'Google', 'IELTS', 'new', 'Needs speaking practice'),
    ('Anastasia Smirnova', 'Facebook', 'Pre-IELTS', 'new', 'Just started')
]
for i, (n, src, g, st, note) in enumerate(waitlist):
    cur.execute("INSERT INTO waitlist (id, name, how_found, learning_goal, status, notes, enquiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (i+1, n, src, g, st, note, date.today().strftime('%Y-%m-%d')))

students = [
    ('Malika Azimova', 1, 'B1+', '+998 90 555 12 34'),
    ('Sardor Karimov', 1, 'B1+', '+998 91 230 44 18'),
    ('Jasur Toshpo''latov', 1, 'B1', '+998 93 811 02 76'),
    ('Nilufar Yusupova', 2, 'A2', '+998 97 402 88 20'),
    ('Aziz Olimov', 3, 'B1', '+998 90 177 63 55'),
    ('Kamola Nazarova', 1, 'B1+', '+998 94 620 31 89'),
    ('Rustam Qodirov', 2, 'A2', '+998 99 123 45 67'),
    ('Dmitry Volkov', 3, 'B2', '+998 90 987 65 43'),
    ('Oksana Petrova', 2, 'A2', '+998 93 456 78 90')
]
for i, (n, gid, lvl, ph) in enumerate(students):
    cur.execute("INSERT INTO students (id, name, group_id, level, phone, active, archived, start_date) VALUES (?, ?, ?, ?, ?, 1, 0, ?)",
                (i+1, n, gid, lvl, ph, (date.today() - timedelta(days=60)).strftime('%Y-%m-%d')))

today = date.today()
month_str = today.strftime('%Y-%m')
paid_students = [1, 2, 4, 6, 8]
for sid in paid_students:
    cur.execute("INSERT INTO payments (student_id, month, amount, method, paid_date) VALUES (?, ?, 400000, 'Card', ?)",
                (sid, month_str, today.strftime('%Y-%m-%d')))

# Also add some attendance
lessons = [
    (1, 1, '2026-08-10', '14:00', 'completed'),
    (2, 1, '2026-08-12', '14:00', 'completed'),
    (3, 1, '2026-08-14', '14:00', 'completed'),
    (4, 2, '2026-08-11', '16:00', 'completed'),
    (5, 2, '2026-08-13', '16:00', 'completed'),
]
for l in lessons:
    cur.execute("INSERT INTO lessons (id, group_id, date, time, status) VALUES (?, ?, ?, ?, ?)", l)

conn.commit()
conn.close()
print("Dummy data seeded perfectly!")
