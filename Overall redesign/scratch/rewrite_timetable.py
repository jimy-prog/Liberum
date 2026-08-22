with open('templates/timetable.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

text = text.replace("{% block page_title %}Timetable{% endblock %}", "{% block page_title %}Schedule{% endblock %}\n{% block page_subtitle %}Timetable · attendance · online · class invites{% endblock %}")
text = re.sub(r'\{% block topbar_actions %\}.*?\{% endblock %\}', '{% block topbar_actions %}{% endblock %}', text, flags=re.DOTALL)

match = re.search(r'\{% block content %\}.*?({\# ══ DAILY)', text, re.DOTALL)

new_content = """{% block content %}
<div class="segs">
  <button class="{% if view == 'weekly' %}on{% endif %}" onclick="window.location='/timetable/weekly'">Week</button>
  <button class="{% if view == 'daily' %}on{% endif %}" onclick="window.location='/timetable/'">Day</button>
  <button class="{% if view == 'monthly' %}on{% endif %}" onclick="window.location='/timetable/monthly'">Month</button>
  <button onclick="window.location='/classes/'">Classes</button>
  <button onclick="window.location='/online/'">Online</button>
</div>

<div style="display:flex; justify-content:space-between; margin-bottom:14px; align-items:center;">
  <div style="display:flex;gap:6px">
    <a href="{{ export_url }}" target="_blank" class="btn soft sm"><i data-lucide="printer"></i>Export</a>
  </div>
  
  <div style="display:flex;gap:12px;align-items:center">
    {% if view == 'daily' %}
    <a href="/timetable/?d={{ prev_date }}&show={{ show }}" class="btn ghost sm"><i data-lucide="chevron-left"></i></a>
    <span style="font-size:14px; font-weight:600">{{ view_date.strftime('%B %d, %Y') }}</span>
    <a href="/timetable/?d={{ next_date }}&show={{ show }}" class="btn ghost sm"><i data-lucide="chevron-right"></i></a>
    {% elif view == 'weekly' %}
    <a href="/timetable/weekly?week={{ prev_week }}&show={{ show }}" class="btn ghost sm"><i data-lucide="chevron-left"></i></a>
    <span style="font-size:14px; font-weight:600">{{ week_start.strftime('%d %b') }} – {{ week_end.strftime('%d %b %Y') }}</span>
    <a href="/timetable/weekly?week={{ next_week }}&show={{ show }}" class="btn ghost sm"><i data-lucide="chevron-right"></i></a>
    {% elif view == 'monthly' %}
    <a href="/timetable/monthly?month={{ prev_month }}&show={{ show }}" class="btn ghost sm"><i data-lucide="chevron-left"></i></a>
    <span style="font-size:14px; font-weight:600">{{ view_date.strftime('%B %Y') }}</span>
    <a href="/timetable/monthly?month={{ next_month }}&show={{ show }}" class="btn ghost sm"><i data-lucide="chevron-right"></i></a>
    {% endif %}
  </div>
</div>

"""

if match:
    text = text[:match.start()] + new_content + match.group(1) + text[match.end():]
else:
    print("Could not find match!")

with open('templates/timetable.html', 'w', encoding='utf-8') as f:
    f.write(text)
