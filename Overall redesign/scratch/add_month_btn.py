for filename in ["templates/timetable.html", "templates/online.html"]:
    with open(filename, "r") as f:
        text = f.read()
    
    if "window.location='/timetable/monthly'" not in text:
        text = text.replace(
            '''<button class="{% if view == 'weekly' %}on{% endif %}" onclick="window.location='/timetable/weekly'">Week</button>''',
            '''<button class="{% if view == 'monthly' %}on{% endif %}" onclick="window.location='/timetable/monthly'">Month</button>
  <button class="{% if view == 'weekly' %}on{% endif %}" onclick="window.location='/timetable/weekly'">Week</button>'''
        )
        with open(filename, "w") as f:
            f.write(text)
