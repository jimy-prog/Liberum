with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("stats.income_earned", "income")
text = text.replace("stats.max_income", "income_max")
text = text.replace("stats.lessons_done", "held_count")
text = text.replace("stats.lessons_total", "lessons_expected")
text = text.replace("stats.attendance_rate", "att_rate")
text = text.replace("stats.payments_done", "paid_count")
text = text.replace("stats.payments_total", "total_students")
text = text.replace("today_classes", "todays_data")
text = text.replace("c.group.name", "c.lesson.group.name")
text = text.replace("c.start_time.strftime('%H:%M')", "c.lesson.time")
text = text.replace("c.room_id", "c.lesson.room")
text = text.replace("c.id", "c.lesson.id")

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
