with open("templates/timetable.html", "r") as f:
    text = f.read()

# I want to replace the whole {% else %} block which is the monthly view.
import re

old_monthly = '''{% else %}
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
  <div style="font-family:var(--fd);font-weight:600;font-size:18px">{{ month_start.strftime('%B %Y') }}</div>
  <div style="display:flex; align-items:center; gap:8px;">
    <button class="btn ghost sm" onclick="window.location='/timetable/monthly?month={{ prev_month }}'"><i data-lucide="chevron-left"></i>Prev</button>
    <button class="btn ghost sm" onclick="window.location='/timetable/monthly?month={{ next_month }}'">Next<i data-lucide="chevron-right"></i></button>
  </div>
</div>
<div class="card">
  <div class="empty">Monthly view uses grid (skipped for brevity, stick to Week/Day tabs!)</div>
</div>
{% endif %}'''

new_monthly = '''{% else %}
<style>
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.cal-day-header {
  background: var(--bg3);
  padding: 8px 4px;
  text-align: center;
  font-size: .68rem;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--text3);
}
.cal-day {
  background: var(--bg2);
  min-height: 110px;
  padding: 8px;
  position: relative;
  transition: background .15s;
}
.cal-day.other-month { background: var(--bg3); opacity: 0.5; }
.cal-day.today { background: var(--accbg); }
.day-num {
  font-size: .8rem;
  font-weight: 600;
  color: var(--text2);
  margin-bottom: 6px;
  display: block;
}
.cal-day.today .day-num {
  color: var(--acc);
}
.cal-lesson {
  display: block;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: .7rem;
  font-weight: 500;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  transition: opacity .15s;
  cursor: pointer;
}
.cal-lesson:hover { opacity: .85; }
</style>

<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
  <div style="font-family:var(--fd);font-weight:600;font-size:18px">{{ month_start.strftime('%B %Y') }}</div>
  <div style="display:flex; align-items:center; gap:8px;">
    <button class="btn ghost sm" onclick="window.location='/timetable/monthly?month={{ prev_month }}'"><i data-lucide="chevron-left"></i>Prev</button>
    <button class="btn ghost sm" onclick="window.location='/timetable/monthly?month={{ next_month }}'">Next<i data-lucide="chevron-right"></i></button>
  </div>
</div>

<div class="cal-grid mb-6">
  {% for day_name in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] %}
  <div class="cal-day-header">{{ day_name }}</div>
  {% endfor %}

  {% for week in weeks %}
  {% for day in week %}
  <div class="cal-day {% if not day.in_month %}other-month{% endif %} {% if day.is_today %}today{% endif %}">
    <div class="day-num">{{ day.date.day }}</div>
    {% for lesson in day.lessons %}
    <a href="/groups/{{ lesson.group_id }}" class="cal-lesson"
       style="background:{{ lesson.group.color or '#4f46e5' }}22;color:{{ lesson.group.color or '#4f46e5' }};border:1px solid {{ lesson.group.color or '#4f46e5' }}44">
      {% if lesson.time %}{{ lesson.time }} · {% endif %}{{ lesson.group.name }}
    </a>
    {% endfor %}
  </div>
  {% endfor %}
  {% endfor %}
</div>
{% endif %}'''

if "cal-grid" not in text:
    text = text.replace(old_monthly, new_monthly)
    with open("templates/timetable.html", "w") as f:
        f.write(text)

# Also I need to remove the override from `routers/timetable_router.py` that I added in `scratch/add_monthly_route2.py`
# Wait, I injected it at the end of the file. Let me check routers/timetable_router.py
with open("routers/timetable_router.py", "r") as f:
    rtext = f.read()
    
# I will just remove the second `def monthly_view` that I injected at the bottom.
import re
rtext = re.sub(r'@router.get\("/monthly"\)\ndef monthly_view.*?\]\]\*4 # simple mock\n    \}\)', '', rtext, flags=re.DOTALL)
with open("routers/timetable_router.py", "w") as f:
    f.write(rtext)
