with open('templates/groups.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

text = text.replace("{% block page_title %}Groups{% endblock %}", "{% block page_title %}Students{% endblock %}\n{% block page_subtitle %}CRM · groups · waitlist · performance · placement{% endblock %}")
text = re.sub(r'\{% block topbar_actions %\}.*?\{% endblock %\}', '{% block topbar_actions %}{% endblock %}', text, flags=re.DOTALL)

match = re.search(r'\{% block content %\}.*?(<div class="modal-overlay" id="addGroup")', text, re.DOTALL)

new_content = """{% block content %}
<div class="segs">
  <button onclick="window.location='/students/'">Students</button>
  <button class="on" onclick="window.location='/groups/'">Groups</button>
  <button onclick="window.location='/waitlist/'">Waitlist</button>
  <button onclick="window.location='/performance/'">Performance</button>
  <button onclick="window.location='/placement/'">Placement tests</button>
</div>

<div class="stats">
  <div class="stat">
    <div class="v">{{ groups|length }}</div>
    <div class="l">Active groups</div>
  </div>
  <div class="stat">
    <div class="v">...</div>
    <div class="l">Students total</div>
  </div>
</div>

<div class="card">
  <div class="ct">Groups <button class="btn sm" onclick="document.getElementById('addGroup').classList.add('open')"><i data-lucide="plus"></i>New group</button></div>
  {% for g in groups %}
  {% set mode = g.mode if g.mode is defined else 'in-person' %}
  <div class="row" onclick="window.location='/groups/{{ g.id }}'">
    <div class="av" style="background:var(--accbg);color:var(--acc2)"><i data-lucide="users"></i></div>
    <div class="rmain">
      <div class="rt">{{ g.name }} 
        {% if mode == 'online' %}<span class="pill p-green" style="margin-left:6px">Online</span>{% else %}<span class="pill p-acc" style="margin-left:6px">In-person</span>{% endif %}
      </div>
      <div class="rs">{{ g.schedule or 'No schedule' }} · Room {{ g.room_id or '—' }}</div>
    </div>
    <span style="font-family:var(--fm);font-size:13px;color:var(--txt2)">{{ g.students|length }} students</span>
    <i data-lucide="chevron-right" style="color:var(--txt3)"></i>
  </div>
  {% else %}
  <div class="empty">
    <i data-lucide="users-2"></i>
    <b>No active groups.</b>
  </div>
  {% endfor %}
</div>
"""

if match:
    text = text[:match.start()] + new_content + match.group(1) + text[match.end():]
else:
    print("Could not find match!")

# Modal overlay fix
text = text.replace('<div class="modal-overlay" id="addGroup" onclick="if(event.target===this)closeModal(\'addGroup\')">', '<div class="ovl" id="addGroup" onclick="if(event.target===this)document.getElementById(\'addGroup\').classList.remove(\'open\')">')
text = text.replace('<div class="modal-dialog">', '<div class="modal">')
text = text.replace('<div class="modal-header">', '<div class="mt">Create Group<button type="button" class="x" onclick="document.getElementById(\'addGroup\').classList.remove(\'open\')"><i data-lucide="x"></i></button></div><div style="display:none">')
text = text.replace('</div>\n      <form', '</div><form')
text = text.replace('onclick="closeModal(\'addGroup\')"', 'onclick="document.getElementById(\'addGroup\').classList.remove(\'open\')"')

with open('templates/groups.html', 'w', encoding='utf-8') as f:
    f.write(text)
