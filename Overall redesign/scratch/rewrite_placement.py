with open('templates/placement_dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

text = text.replace("{% block page_title %}Placement Tests{% endblock %}", "{% block page_title %}Students{% endblock %}\n{% block page_subtitle %}CRM · groups · waitlist · performance · placement{% endblock %}")
text = re.sub(r'\{% block topbar_actions %\}.*?\{% endblock %\}', '{% block topbar_actions %}{% endblock %}', text, flags=re.DOTALL)

match = re.search(r'\{% block content %\}.*?(<div class="modal-overlay" id="createSessionModal")', text, re.DOTALL)

new_content = """{% block content %}
<div class="segs">
  <button onclick="window.location='/students/'">Students</button>
  <button onclick="window.location='/groups/'">Groups</button>
  <button onclick="window.location='/waitlist/'">Waitlist</button>
  <button onclick="window.location='/students/performance'">Performance</button>
  <button class="on" onclick="window.location='/placement/'">Placement tests</button>
</div>

<div class="stats">
  <div class="stat">
    <div class="v">{{ questions|length }}</div>
    <div class="l">Question bank</div>
  </div>
  <div class="stat">
    <div class="v">{{ sessions|length }}</div>
    <div class="l">Tests this month</div>
  </div>
</div>

<div class="card">
  <div class="ct">New placement test
    <div>
      <button class="btn ghost sm" onclick="document.getElementById('addQuestionModal').classList.add('open')">Add Q</button>
    </div>
  </div>
  <div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Generates a 4-digit PIN. The student takes the test on the tablet at reception — no account needed.</div>
  <button class="btn block" onclick="document.getElementById('createSessionModal').classList.add('open')"><i data-lucide="key-round"></i>Generate PIN</button>
</div>

<div class="card">
  <div class="ct">Recent results</div>
  {% for s in sessions %}
  <div class="row">
    {% set parts = s.name.split() %}
    {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper %}
    <div class="av" style="background:var(--fill);color:var(--txt2)">{{ initials }}</div>
    <div class="rmain">
      <div class="rt">{{ s.name }}</div>
      <div class="rs">{{ s.created_at.strftime('%b %d') }} · Target: {{ s.target_level.capitalize() if s.target_level else 'N/A' }}</div>
    </div>
    {% if s.completed %}
      <span class="pill p-green">{{ s.recommended_level }}</span>
    {% else %}
      {% if not s.started %}
      <span class="pill p-acc" style="font-family:var(--fm)">PIN: {{ s.pin_code }}</span>
      {% else %}
      <span class="pill p-grey">In Progress</span>
      {% endif %}
    {% endif %}
    {% if s.completed and s.student_id == None %}
      <button class="btn soft sm" onclick="window.location='/students/?add_from_placement={{s.id}}'">Enroll</button>
    {% endif %}
  </div>
  {% else %}
  <div class="empty">
    <i data-lucide="clipboard-list"></i>
    <b>No tests yet</b>
  </div>
  {% endfor %}
</div>

"""

if match:
    text = text[:match.start()] + new_content + match.group(1) + text[match.end():]
else:
    print("Could not find match!")

# Modal overlay fix
def fix_modal(text, modal_id, title):
    text = text.replace(f'<div class="modal-overlay" id="{modal_id}" onclick="if(event.target===this)closeModal(\'{modal_id}\')">', f'<div class="ovl" id="{modal_id}" onclick="if(event.target===this)document.getElementById(\'{modal_id}\').classList.remove(\'open\')">')
    text = text.replace(f'<div class="modal-overlay" id="{modal_id}">', f'<div class="ovl" id="{modal_id}">')
    text = re.sub(r'<div class="modal-header">.*?</div>', f'<div class="mt">{title}<button type="button" class="x" onclick="document.getElementById(\'{modal_id}\').classList.remove(\'open\')"><i data-lucide="x"></i></button></div>', text, count=1, flags=re.DOTALL)
    text = text.replace(f'onclick="closeModal(\'{modal_id}\')"', f'onclick="document.getElementById(\'{modal_id}\').classList.remove(\'open\')"')
    return text

text = text.replace('<div class="modal-dialog">', '<div class="modal">')
text = text.replace('<div class="modal-body">', '')
text = fix_modal(text, 'createSessionModal', 'Placement PIN')
text = fix_modal(text, 'addQuestionModal', 'Add Placement Question')

with open('templates/placement_dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
