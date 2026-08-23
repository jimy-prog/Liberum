with open('scratch/old_performance.html', 'r', encoding='utf-8') as f:
    text = f.read()

# I want everything from {% block content %} to the end.
import re
content_block = re.search(r'\{% block content %\}(.*?)\{% endblock %\}', text, flags=re.DOTALL).group(1)

# Now I'll create the new templates/performance.html
new_html = """{% extends "base.html" %}
{% block title %}Performance{% endblock %}
{% block page_title %}Students / Performance{% endblock %}
{% block topbar_actions %}{% endblock %}

{% block extra_styles %}
<style>
.charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
.chart-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px}
.chart-title{font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:12px}
.heatmap{display:grid;gap:3px}
.hm-row{display:flex;align-items:center;gap:3px}
.hm-label{font-size:.7rem;color:var(--text3);width:80px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:0}
.hm-cell{flex:1;height:28px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:600}
.lb-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)}
.lb-row:last-child{border-bottom:none}
.lb-rank{font-family:var(--font-d);font-size:1.2rem;width:30px;text-align:center;flex-shrink:0}
.lb-bar{flex:1;height:8px;background:var(--bg4);border-radius:4px;overflow:hidden}
.lb-fill{height:100%;border-radius:4px}
</style>
{% endblock %}

{% block content %}
<div class="segs">
  <button onclick="window.location='/students/'">Students</button>
  <button onclick="window.location='/groups/'">Groups</button>
  <button onclick="window.location='/waitlist/'">Waitlist</button>
  <button class="on" onclick="window.location='/performance/'">Performance</button>
  <button onclick="window.location='/placement/'">Placement tests</button>
</div>

<div class="card" style="background:var(--fill);box-shadow:none;margin-bottom:16px">
  <div style="display:flex;gap:12px;align-items:center">
    <div style="font-weight:600;font-size:14px;color:var(--text2)">Filters:</div>
    <select class="form-control" style="width:200px;padding:6px 12px;background:var(--bg2)" onchange="window.location.href='/performance/?group_id='+this.value+'&month={{ month_str }}'">
      {% for g in groups %}
      <option value="{{ g.id }}" {% if sel_group and g.id==sel_group.id %}selected{% endif %}>{{ g.name }}</option>
      {% endfor %}
    </select>
    <input type="month" class="form-control" style="width:160px;padding:6px 12px;background:var(--bg2)" value="{{ month_str }}" onchange="window.location.href='/performance/?group_id={{ sel_group.id if sel_group else '' }}&month='+this.value">
  </div>
</div>
""" + content_block + """
{% endblock %}
"""

with open('templates/performance.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
