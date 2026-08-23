import sqlite3
from datetime import date, timedelta
import random

conn = sqlite3.connect('database_tenants/tenant_demo_investor.db')
c = conn.cursor()

expenses = [
    (1500000, 'Rent for August', 'Rent', '2026-08-01'),
    (250000, 'Zoom Pro Subscription', 'Software', '2026-08-03'),
    (100000, 'Printing paper', 'Supplies', '2026-08-10'),
    (150000, 'Water & Coffee', 'Supplies', '2026-08-15'),
    (300000, 'Social Media Ads', 'Marketing', '2026-08-18'),
    
    (1500000, 'Rent for July', 'Rent', '2026-07-01'),
    (250000, 'Zoom Pro Subscription', 'Software', '2026-07-03'),
    
    (1500000, 'Rent for June', 'Rent', '2026-06-01'),
    (250000, 'Zoom Pro Subscription', 'Software', '2026-06-03'),
]

for amt, desc, cat, dt in expenses:
    c.execute("INSERT INTO expenses (amount, description, category, date) VALUES (?, ?, ?, ?)", (amt, desc, cat, dt))

conn.commit()
conn.close()
print("Expenses seeded")
