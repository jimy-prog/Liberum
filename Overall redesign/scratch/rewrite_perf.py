with open("scratch/pre_redesign_perf.html", "r") as f:
    old = f.read()

styles = old.split("{% block extra_styles %}")[1].split("{% endblock %}")[0]
scripts = old.split("{% block scripts %}")[1].split("{% endblock %}")[0]

# Now, we need the charts and tables.
charts_and_tables = old.split("{% block content %}")[1].split("{% block scripts %}")[0].replace("{% endblock %}", "").strip()

# We need to remove the topbar_actions from old.
# And construct a new templates/performance.html

new_html = f"""{{% extends "base.html" %}}
{{% block title %}}Performance{{% endblock %}}
{{% block page_title %}}Students{{% endblock %}}
{{% block page_subtitle %}}CRM · groups · waitlist · performance · placement{{% endblock %}}
{{% block topbar_actions %}}{{% endblock %}}

{{% block extra_styles %}}
{styles.replace('var(--text3)', 'var(--txt3)').replace('var(--text)', 'var(--txt)').replace('var(--bg2)', 'var(--card)').replace('var(--bg3)', 'var(--fill)').replace('var(--bg4)', 'var(--line)').replace('var(--radius)', '20px').replace('.card-header', '.ct')}
{{% endblock %}}

{{% block content %}}
<div class="segs">
  <button onclick="window.location='/students/'">Students</button>
  <button onclick="window.location='/groups/'">Groups</button>
  <button onclick="window.location='/waitlist/'">Waitlist</button>
  <button class="on" onclick="window.location='/performance/'">Performance</button>
  <button onclick="window.location='/placement/'">Placement tests</button>
</div>

<div class="card" style="background:var(--fill);box-shadow:none;margin-bottom:16px;padding:12px 16px;">
  <div style="display:flex;gap:12px;align-items:center">
    <div style="font-weight:600;font-size:14px;color:var(--txt2)">Filters:</div>
    <select class="form-control" style="width:200px;padding:6px 12px;background:var(--card);border-radius:8px;border:1px solid var(--line);color:var(--txt);" onchange="window.location.href='/performance/?group_id='+this.value+'&month={{ month_str }}'">
      {{% for g in groups %}}
      <option value="{{{{ g.id }}}}" {{{{ 'selected' if sel_group and g.id==sel_group.id else '' }}}}>{{{{ g.name }}}}</option>
      {{% endfor %}}
    </select>
    <input type="month" class="form-control" style="width:160px;padding:6px 12px;background:var(--card);border-radius:8px;border:1px solid var(--line);color:var(--txt);" value="{{{{ month_str }}}}" onchange="window.location.href='/performance/?group_id={{{{ sel_group.id if sel_group else '' }}}}&month='+this.value">
  </div>
</div>

{charts_and_tables.replace('class="card mb-4"', 'class="card"').replace('class="card mt-4"', 'class="card"').replace('card-body', 'card-body').replace('.chart-card', '.card').replace('class="chart-card"', 'class="card"').replace('var(--text3)', 'var(--txt3)').replace('var(--text)', 'var(--txt)')}
{{% endblock %}}

{{% block scripts %}}
{scripts}
{{% endblock %}}
"""

with open("templates/performance.html", "w") as f:
    f.write(new_html)
