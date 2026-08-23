html_content = """{% extends "base.html" %}
{% block title %}Monthly Report{% endblock %}
{% block page_title %}Monthly Report{% endblock %}
{% block topbar_actions %}
<div style="display:flex;gap:8px;align-items:center">
  <input class="form-control" type="month" value="{{ month_str }}" onchange="window.location='/monthly-report/?month='+this.value" style="width:150px;padding:5px 10px">
</div>
{% endblock %}

{% block content %}
<div class="segs">
  <button class="" onclick="window.location='/payments/'">Payments</button>
  <button class="" onclick="window.location='/finance/'">Finance</button>
</div>

<div class="card">
  <div style="display:flex;gap:14px;align-items:center;margin-bottom:6px">
    <div class="av" style="width:52px;height:52px;background:var(--accbg);color:var(--acc)">
      <i data-lucide="file-text"></i>
    </div>
    <div class="rmain">
      <div class="rt" style="font-size:16px">Monthly Report · {{ month_str }}</div>
      <div class="rs">One page your accountant will love</div>
    </div>
  </div>
  
  <div class="row" style="padding-left:0;padding-right:0">
    <div class="rs" style="font-size:13.5px">Revenue</div>
    <span style="font-family:var(--fm);font-weight:600;font-size:13.5px">{{ "{:,.0f}".format(total_collected) }} UZS</span>
  </div>
  <div class="row" style="padding-left:0;padding-right:0">
    <div class="rs" style="font-size:13.5px">Expenses</div>
    <span style="font-family:var(--fm);font-weight:600;font-size:13.5px">{{ "{:,.0f}".format(total_expenses) }} UZS</span>
  </div>
  <div class="row" style="padding-left:0;padding-right:0">
    <div class="rs" style="font-size:13.5px">Net income</div>
    <span style="font-family:var(--fm);font-weight:600;font-size:13.5px;color:{% if net_income >= 0 %}var(--greenD){% else %}var(--red){% endif %}">{{ "{:,.0f}".format(net_income) }} UZS</span>
  </div>
  <div class="row" style="padding-left:0;padding-right:0">
    <div class="rs" style="font-size:13.5px">Lessons held</div>
    <span style="font-family:var(--fm);font-weight:600;font-size:13.5px">{{ total_lessons }}</span>
  </div>
  <div class="row" style="padding-left:0;padding-right:0">
    <div class="rs" style="font-size:13.5px">Avg. attendance</div>
    <span style="font-family:var(--fm);font-weight:600;font-size:13.5px">{{ "{:.1f}".format(avg_attendance) }}%</span>
  </div>
  
  <button class="btn block" style="margin-top:12px" onclick="window.print()"><i data-lucide="download"></i>Download PDF / Print</button>
</div>
{% endblock %}
"""

with open("templates/monthly_report.html", "w") as f:
    f.write(html_content)
