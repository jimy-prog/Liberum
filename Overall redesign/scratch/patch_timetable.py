with open('templates/timetable.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Fix "Today" title in the card
new_ct = """{% set total_today_classes = 0 %}
  {% for time, lessons in today_day.lessons_by_time.items() %}
    {% set total_today_classes = total_today_classes + lessons|length %}
  {% endfor %}
  <div class="ct">{{ today_day.name }} {{ today_day.date.day }} · {{ total_today_classes }} class{% if total_today_classes != 1 %}es{% endif %}</div>"""

text = re.sub(r'<div class="ct">Today.*?</div>', new_ct, text, flags=re.DOTALL)

with open('templates/timetable.html', 'w', encoding='utf-8') as f:
    f.write(text)
