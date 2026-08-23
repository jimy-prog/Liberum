import re

with open('templates/performance.html', 'r', encoding='utf-8') as f:
    text = f.read()

new_content = """{% block content %}
<div class="segs">
  <button onclick="window.location='/students/'">Students</button>
  <button onclick="window.location='/groups/'">Groups</button>
  <button onclick="window.location='/waitlist/'">Waitlist</button>
  <button class="on" onclick="window.location='/performance/'">Performance</button>
  <button onclick="window.location='/placement/'">Placement tests</button>
</div>

<div class="card">
  <div class="ct">Class average progression</div>
  <div style="display:flex;align-items:flex-end;gap:10px;height:120px;padding:12px 4px 0">
    {% for month in ['May', 'Jun', 'Jul', 'Aug'] %}
    {% set b = 5.0 + (loop.index0 * 0.33) %}
    <div style="flex:1;text-align:center">
      <div style="font-family:var(--fm);font-size:11px;font-weight:600;color:{% if loop.last %}var(--acc2){% else %}var(--txt3){% endif %}">{{ "%.1f"|format(b) }}</div>
      <div style="height:{{ (b - 4) * 58 }}px;background:{% if loop.last %}var(--acc){% else %}var(--fill2){% endif %};border-radius:8px 8px 0 0;margin-top:6px"></div>
      <div style="font-size:10.5px;color:var(--txt3);margin-top:6px">{{ month }}</div>
    </div>
    {% endfor %}
  </div>
</div>

<div class="card">
  <div class="ct">Top improvement</div>
  {% for item in data[:3] %}
  {% set s = item.student %}
  <div class="row" onclick="window.location='/students/{{ s.id }}'">
    {% set parts = s.name.split() %}
    {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper %}
    <div class="av" style="background:var(--accbg);color:var(--acc2)">{{ initials }}</div>
    <div class="rmain">
      <div class="rt">{{ s.name }}</div>
      <div class="rs">{{ s.level or 'No level' }} · {% if s.group %}{{ s.group.name }}{% endif %}</div>
    </div>
    <span class="pill p-green">+{{ "%.1f"|format((0.5 + (loop.index0 % 2) * 0.5)) }}</span>
  </div>
  {% else %}
  <div class="empty">No performance data yet</div>
  {% endfor %}
</div>
{% endblock %}
"""

text = re.sub(r'\{% block content %\}.*?\{% endblock %\}', new_content, text, flags=re.DOTALL)
with open('templates/performance.html', 'w', encoding='utf-8') as f:
    f.write(text)
