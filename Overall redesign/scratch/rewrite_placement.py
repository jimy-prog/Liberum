import re

with open('templates/placement_dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

new_content = """{% block content %}
<div class="segs">
  <button onclick="window.location='/students/'">Students</button>
  <button onclick="window.location='/groups/'">Groups</button>
  <button onclick="window.location='/waitlist/'">Waitlist</button>
  <button onclick="window.location='/performance/'">Performance</button>
  <button class="on" onclick="window.location='/placement/'">Placement tests</button>
</div>

<div class="stats">
  <div class="stat"><div class="v">{{ questions|length }}</div><div class="l">Question bank</div></div>
  <div class="stat"><div class="v">{{ sessions|length if sessions else 0 }}</div><div class="l">Tests this month</div></div>
  <div class="stat"><div class="v">B1</div><div class="l">Median level</div></div>
</div>

<div class="card">
  <div class="ct" style="display:flex;justify-content:space-between">
    <span>New placement test</span>
    <button class="btn ghost sm" onclick="document.getElementById('addQuestionModal').classList.add('open')">Add Q</button>
  </div>
  <div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Generates a 4-digit PIN. The student takes the test on the tablet at reception — no account needed.</div>
  <button class="btn" onclick="document.getElementById('startTestModal').classList.add('open')"><i data-lucide="key-round"></i>Generate PIN</button>
</div>

<div class="card">
  <div class="ct">Recent results</div>
  {% for s in completed_sessions %}
  <div class="row">
    {% set parts = s.student_name.split() %}
    {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper %}
    <div class="av" style="background:var(--accbg);color:var(--acc2)">{{ initials }}</div>
    <div class="rmain">
      <div class="rt">{{ s.student_name }}</div>
      <div class="rs">{{ s.completed_at.strftime('%b %d') if s.completed_at else '' }} · target {{ s.target_level }}</div>
    </div>
    <span class="pill p-green">{{ s.result_level or 'Passed' }}</span>
  </div>
  {% else %}
  <div class="empty">No recent test results</div>
  {% endfor %}
</div>

<!-- Add Question Modal -->
<div class="ovl" id="addQuestionModal">
  <div class="modal">
    <div class="mt">Add Question<button type="button" class="x" onclick="document.getElementById('addQuestionModal').classList.remove('open')"><i data-lucide="x"></i></button></div>
    <form action="/placement/add-question" method="POST" style="margin-top:16px">
      <div class="fgroup"><label>Level</label>
        <select name="level">
          <option value="beginner">Beginner</option>
          <option value="elementary">Elementary</option>
          <option value="pre-intermediate">Pre-Intermediate</option>
          <option value="intermediate">Intermediate</option>
          <option value="upper-intermediate">Upper-Intermediate</option>
        </select>
      </div>
      <div class="fgroup"><label>Question Text</label><textarea name="text" rows="2" required></textarea></div>
      <div class="fgroup"><label>Option A (Correct)</label><input name="opt_a" required></div>
      <div class="fgroup"><label>Option B</label><input name="opt_b" required></div>
      <div class="fgroup"><label>Option C</label><input name="opt_c" required></div>
      <button class="btn block" style="margin-top:16px">Save Question</button>
    </form>
  </div>
</div>

<!-- Start Test Modal -->
<div class="ovl" id="startTestModal">
  <div class="modal">
    <div class="mt">Generate Test PIN<button type="button" class="x" onclick="document.getElementById('startTestModal').classList.remove('open')"><i data-lucide="x"></i></button></div>
    <form action="/placement/session/initiate" method="POST" style="margin-top:16px">
      <div class="fgroup"><label>Student Name</label><input name="name" required></div>
      <div class="fgroup"><label>Phone (Optional)</label><input name="phone"></div>
      <div class="fgroup"><label>Target Level</label>
        <select name="level">
          <option value="elementary">Elementary</option>
          <option value="pre-intermediate">Pre-Intermediate</option>
          <option value="intermediate">Intermediate</option>
          <option value="upper-intermediate">Upper-Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <button class="btn block" style="margin-top:16px">Generate PIN</button>
    </form>
  </div>
</div>
{% endblock %}
"""
text = re.sub(r'\{% block content %\}.*?\{% endblock %\}', new_content, text, flags=re.DOTALL)
with open('templates/placement_dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
