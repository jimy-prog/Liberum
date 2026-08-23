import re

with open('templates/groups.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace block content to end of file, except the modal at the bottom (let's check where the modal is)
new_content = """{% block content %}
<div class="segs">
  <button onclick="window.location='/students/'">Students</button>
  <button class="on" onclick="window.location='/groups/'">Groups</button>
  <button onclick="window.location='/waitlist/'">Waitlist</button>
  <button onclick="window.location='/students/performance'">Performance</button>
  <button onclick="window.location='/placement/'">Placement tests</button>
</div>

<div class="stats">
  <div class="stat"><div class="v">{{ groups|length }}</div><div class="l">Active groups</div></div>
  {% set ns = namespace(sc=0) %}
  {% for g in groups %}{% set ns.sc = ns.sc + g.students|length %}{% endfor %}
  <div class="stat"><div class="v">{{ ns.sc }}</div><div class="l">Students</div></div>
  <div class="stat"><div class="v money">...</div><div class="l">UZS / month potential</div></div>
</div>

<div class="card">
  <div class="ct" style="display:flex;justify-content:space-between">
    <span>Groups</span>
    <button class="btn sm" onclick="openModal('addGroup')"><i data-lucide="plus"></i>New group</button>
  </div>
  {% for g in groups %}
  <div class="row" onclick="window.location='/groups/{{ g.id }}'">
    <div class="av" style="background:var(--accbg);color:var(--acc2)"><i data-lucide="users"></i></div>
    <div class="rmain">
      <div class="rt">{{ g.name }} <span class="pill {% if g.mode == 'Online' %}p-green{% else %}p-acc{% endif %}" style="margin-left:6px">{{ g.mode or 'Offline' }}</span></div>
      <div class="rs">{{ g.schedule or 'No Schedule' }} · {% if g.mode == 'Online' %}Zoom{% else %}Room {{ g.room or '1' }}{% endif %}</div>
    </div>
    <span style="font-family:var(--fm);font-size:13px;color:var(--txt2)">{{ g.students|length }} students</span>
    <i data-lucide="chevron-right" style="color:var(--txt3)"></i>
  </div>
  {% else %}
  <div class="empty">No groups created yet</div>
  {% endfor %}
</div>

<!-- Add Group Modal -->
<div class="ovl" id="addGroup">
  <div class="modal">
    <div class="mt">New Group<button type="button" class="x" onclick="document.getElementById('addGroup').classList.remove('open')"><i data-lucide="x"></i></button></div>
    <form action="/groups/add" method="POST" style="margin-top:16px">
      <div class="fgroup"><label>Name</label><input name="name" required></div>
      <div class="frow">
        <div class="fgroup"><label>Level</label>
          <select name="level">
            <option value="Elementary">Elementary</option>
            <option value="Pre-Intermediate">Pre-Intermediate</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Upper-Intermediate">Upper-Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div class="fgroup"><label>Mode</label>
          <select name="mode">
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>
      <div class="frow">
        <div class="fgroup"><label>Schedule</label><input name="schedule" placeholder="e.g. Mon/Wed/Fri"></div>
        <div class="fgroup"><label>Room</label><input name="room" value="1"></div>
      </div>
      <div class="frow">
        <div class="fgroup"><label>Price (UZS)</label><input type="number" name="price" value="0"></div>
        <div class="fgroup"><label>Type</label><select name="price_type"><option value="monthly">Monthly</option><option value="per_lesson">Per Lesson</option></select></div>
      </div>
      <button class="btn block" style="margin-top:16px">Create Group</button>
    </form>
  </div>
</div>
{% endblock %}
"""

text = re.sub(r'\{% block content %\}.*?\{% endblock %\}', new_content, text, flags=re.DOTALL)

with open('templates/groups.html', 'w', encoding='utf-8') as f:
    f.write(text)
