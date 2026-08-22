with open('templates/waitlist.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

text = text.replace("{% block page_title %}Waitlist{% endblock %}", "{% block page_title %}Students{% endblock %}\n{% block page_subtitle %}CRM · groups · waitlist · performance · placement{% endblock %}")
text = re.sub(r'\{% block topbar_actions %\}.*?\{% endblock %\}', '{% block topbar_actions %}{% endblock %}', text, flags=re.DOTALL)

match = re.search(r'\{% block content %\}.*?(<div class="modal-overlay" id="addEntry")', text, re.DOTALL)

new_content = """{% block content %}
<div class="segs">
  <button onclick="window.location='/students/'">Students</button>
  <button onclick="window.location='/groups/'">Groups</button>
  <button class="on" onclick="window.location='/waitlist/'">Waitlist</button>
  <button onclick="window.location='/performance/'">Performance</button>
  <button onclick="window.location='/placement/'">Placement tests</button>
</div>

<div class="card" style="background:var(--accbg);box-shadow:none;margin-bottom:14px">
  <div style="display:flex;gap:14px;align-items:center">
    <i data-lucide="link" style="color:var(--acc)"></i>
    <div class="rmain">
      <div class="rt" style="color:var(--acc2)">Join link is live</div>
      <div class="rs">{{ request.url.scheme }}://{{ request.url.netloc }}/join/{{ user.username }}</div>
    </div>
    <button class="btn sm" onclick="navigator.clipboard.writeText('{{ request.url.scheme }}://{{ request.url.netloc }}/join/{{ user.username }}'); toast('Link copied','copy')"><i data-lucide="copy"></i>Copy</button>
  </div>
</div>

<div class="card">
  <div class="ct">Waitlist <span class="pill p-acc">{{ entries|length }}</span>
    <button class="btn sm" onclick="document.getElementById('addEntry').classList.add('open')"><i data-lucide="plus"></i>Add Enquiry</button>
  </div>
  {% for w in entries %}
  <div class="row">
    {% set parts = w.name.split() %}
    {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper %}
    <div class="av" style="background:var(--fill);color:var(--txt2)">{{ initials }}</div>
    <div class="rmain">
      <div class="rt">{{ w.name }} 
        {% if w.status == 'new' %}
          <span class="pill p-acc" style="margin-left:6px">New</span>
        {% elif w.status == 'enrolled' %}
          <span class="pill p-green" style="margin-left:6px">Enrolled</span>
        {% else %}
          <span class="pill p-grey" style="margin-left:6px;text-transform:capitalize">{{ w.status }}</span>
        {% endif %}
      </div>
      <div class="rs">{{ w.goal_level }} · via {{ w.source }} {% if w.notes %}· {{ w.notes }}{% endif %}</div>
    </div>
    {% if w.status != 'enrolled' %}
      <button class="btn ghost sm" onclick="window.location='/students/?add_from_placement={{w.id}}'">Enroll</button>
    {% endif %}
  </div>
  {% else %}
  <div class="empty">
    <i data-lucide="inbox"></i>
    <b>Waitlist is empty</b>
  </div>
  {% endfor %}
</div>

"""

if match:
    text = text[:match.start()] + new_content + match.group(1) + text[match.end():]
else:
    print("Could not find match!")

def fix_modal(text, modal_id, title):
    text = text.replace(f'<div class="modal-overlay" id="{modal_id}" onclick="if(event.target===this)closeModal(\'{modal_id}\')">', f'<div class="ovl" id="{modal_id}" onclick="if(event.target===this)document.getElementById(\'{modal_id}\').classList.remove(\'open\')">')
    text = text.replace(f'<div class="modal-overlay" id="{modal_id}">', f'<div class="ovl" id="{modal_id}">')
    text = re.sub(r'<div class="modal-header">.*?</div>', f'<div class="mt">{title}<button type="button" class="x" onclick="document.getElementById(\'{modal_id}\').classList.remove(\'open\')"><i data-lucide="x"></i></button></div>', text, count=1, flags=re.DOTALL)
    text = text.replace(f'onclick="closeModal(\'{modal_id}\')"', f'onclick="document.getElementById(\'{modal_id}\').classList.remove(\'open\')"')
    return text

text = text.replace('<div class="modal-dialog">', '<div class="modal">')
text = text.replace('<div class="modal-body">', '')
text = fix_modal(text, 'addEntry', 'Add Enquiry')

with open('templates/waitlist.html', 'w', encoding='utf-8') as f:
    f.write(text)
