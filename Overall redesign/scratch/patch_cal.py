with open("templates/calendar.html", "r") as f:
    text = f.read()

segs = '''
<div class="segs">
  <button class="{% if view == 'monthly' %}on{% endif %}" onclick="window.location='/timetable/monthly'">Month</button>
  <button class="{% if view == 'weekly' %}on{% endif %}" onclick="window.location='/timetable/weekly'">Week</button>
  <button class="{% if view == 'daily' %}on{% endif %}" onclick="window.location='/timetable/'">Day</button>
  <button class="{% if view == 'online' %}on{% endif %}" onclick="window.location='/timetable/online'">Online</button>
  <button class="{% if view == 'classes' %}on{% endif %}" onclick="window.location='/classes'">Classes & invites</button>
</div>
'''

if 'class="segs"' not in text:
    text = text.replace('{% block content %}', '{% block content %}\n' + segs)
    with open("templates/calendar.html", "w") as f:
        f.write(text)
