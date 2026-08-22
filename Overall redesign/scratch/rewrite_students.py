with open('templates/students.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# We will replace everything between {% block content %} and <div class="modal" id="addStudent">
# But first, let's update page_title and page_subtitle
text = text.replace("{% block page_title %}Students{% endblock %}", "{% block page_title %}Students{% endblock %}\n{% block page_subtitle %}CRM · groups · waitlist · performance · placement{% endblock %}")

# Also, empty out topbar_actions because the "Add Student" is now inside the content area
text = re.sub(r'\{% block topbar_actions %\}.*?\{% endblock %\}', '{% block topbar_actions %}{% endblock %}', text, flags=re.DOTALL)

new_content = """{% block content %}
<div class="segs">
  <button class="on" onclick="window.location='/students/'">Students</button>
  <button onclick="window.location='/groups/'">Groups</button>
  <button onclick="window.location='/waitlist/'">Waitlist</button>
  <button onclick="window.location='/students/performance'">Performance</button>
  <button onclick="window.location='/placement/'">Placement tests</button>
</div>

{% if error_code == 'banned_phone' %}
<div class="card" style="background:var(--red-bg);border:1px solid rgba(248,113,113,.35);color:var(--red);padding:14px;margin-bottom:14px">
  Cannot add this student. This phone number matches banned student: <strong>{{ message_name or 'Unknown' }}</strong>.
</div>
{% endif %}
{% if warn_code == 'known_phone' %}
<div class="card" style="background:var(--yellow-bg);border:1px solid rgba(251,191,36,.35);color:var(--yellow);padding:14px;margin-bottom:14px">
  Warning: this phone number was used before by <strong>{{ message_name or 'another student' }}</strong>. Student was added.
</div>
{% endif %}

<div style="display:flex;gap:10px;margin-bottom:14px;align-items:center">
  <div class="search">
    <i data-lucide="search"></i>
    <input id="searchBox" placeholder="Search students..." oninput="liveSearch(this.value)">
  </div>
  <button class="btn" onclick="openModal('addStudent')"><i data-lucide="user-plus"></i>Add student</button>
</div>

<div id="searchResults" style="display:none;position:absolute;background:var(--card);border:1px solid var(--border);border-radius:14px;z-index:300;overflow:hidden;box-shadow:var(--shadow);width:100%;max-width:400px"></div>

<div class="card" style="padding:4px 20px">
  {% for s in students %}
  <div class="row" onclick="window.location='/students/{{ s.id }}'">
    {% set parts = s.name.split() %}
    {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper %}
    <div class="av" style="background:var(--accbg);color:var(--acc2)">{{ initials }}</div>
    <div class="rmain">
      <div class="rt">{{ s.name }}</div>
      <div class="rs">{{ s.level }} · {{ s.group_name or 'No Group' }}</div>
    </div>
    {% if s.debt and s.debt > 0 %}
    <span class="pill p-red">Owes {{ s.debt }}</span>
    {% else %}
    <span class="pill p-green">Paid</span>
    {% endif %}
    <i data-lucide="chevron-right" style="color:var(--txt3)"></i>
  </div>
  {% else %}
  <div class="empty">
    <i data-lucide="users"></i>
    <b>No active students</b>
  </div>
  {% endfor %}
</div>

<!-- Add Student Modal -->
<div class="modal-backdrop" id="addStudent" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.32);backdrop-filter:blur(6px);z-index:90;align-items:center;justify-content:center;padding:20px;">
"""

text = re.sub(r'\{% block content %\}.*?<div class="modal" id="addStudent">', new_content, text, flags=re.DOTALL)

# Convert old modal structure to the new spa_app structure
text = text.replace('<div class="modal" id="addStudent">', '<div class="modal-backdrop" id="addStudent" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.32);backdrop-filter:blur(6px);z-index:90;align-items:center;justify-content:center;padding:20px;">')
text = text.replace('<div class="modal-dialog">', '<div class="modal">')
text = text.replace('<div class="modal-header">', '<div class="mt">Add student<button type="button" class="x" onclick="closeModal(\'addStudent\')"><i data-lucide="x"></i></button></div><div style="display:none">')
text = text.replace('</div>\n      <form', '</div><form')
text = text.replace('class="modal-backdrop"', 'class="ovl"')
# Make modal overlay open correctly
text = text.replace("document.getElementById(id).style.display = 'flex';", "document.getElementById(id).classList.add('open');")
text = text.replace("document.getElementById(id).style.display = 'none';", "document.getElementById(id).classList.remove('open');")

with open('templates/students.html', 'w', encoding='utf-8') as f:
    f.write(text)
