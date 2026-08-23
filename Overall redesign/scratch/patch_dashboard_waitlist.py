import sqlite3

# First, modify dashboard.py to fetch waitlist
with open("routers/dashboard.py", "r") as f:
    text = f.read()

text = text.replace("from database import get_db, Group", "from database import get_db, Group, Waitlist")
text = text.replace('notifications = db.query(Notification).filter(Notification.read==False).order_by(Notification.date.desc()).all()', '''notifications = db.query(Notification).filter(Notification.read==False).order_by(Notification.date.desc()).all()
    recent_waitlist = db.query(Waitlist).filter(Waitlist.status.in_(['trial', 'new'])).limit(3).all()''')
text = text.replace('"upcoming": upcoming, "groups_data": groups_data,', '"upcoming": upcoming, "groups_data": groups_data, "recent_waitlist": recent_waitlist,')

with open("routers/dashboard.py", "w") as f:
    f.write(text)

# Now, modify dashboard.html to render recent_waitlist
html_patch = """
  <div class="card">
    <div class="ct">Needs attention <span class="pill p-red">{{ (recent_reviews|length) + (recent_waitlist|length) }}</span></div>
    
    {% for r in recent_reviews %}
      <div class="row" onclick="window.location='/reviews/inbox'">
        {% set parts = r.student.full_name.split() if r.student.full_name else [r.student.name] %}
        {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper %}
        <div class="av" style="background:var(--accbg);color:var(--acc)">{{ initials }}</div>
        <div class="rmain">
          <div class="rt">Low rating: {{ r.rating }}★</div>
          <div class="rs">{{ r.student.name }} · {{ r.lesson.group.name }}</div>
        </div>
        <i data-lucide="chevron-right" style="color:var(--txt3)"></i>
      </div>
    {% endfor %}

    {% for w in recent_waitlist %}
      <div class="row" onclick="window.location='/waitlist/'">
        {% set parts = w.name.split() %}
        {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper %}
        <div class="av" style="background:var(--fill);color:var(--txt2)">{{ initials }}</div>
        <div class="rmain">
          <div class="rt">{{ 'Trial lesson' if w.status == 'trial' else 'New Lead' }}</div>
          <div class="rs">Waitlist · {{ w.name }}</div>
        </div>
        <i data-lucide="chevron-right" style="color:var(--txt3)"></i>
      </div>
    {% endfor %}

    {% if not recent_reviews and not recent_waitlist %}
      <div class="row" style="text-align:center;padding:24px;color:var(--txt3);justify-content:center;font-size:13px;">Nothing needs attention</div>
    {% endif %}
  </div>
"""

with open("templates/dashboard.html", "r") as f:
    html_text = f.read()

import re
html_text = re.sub(r'<div class="card">\s*<div class="ct">Needs attention.*?</div>\s*</div>', html_patch.strip(), html_text, flags=re.DOTALL)

with open("templates/dashboard.html", "w") as f:
    f.write(html_text)

