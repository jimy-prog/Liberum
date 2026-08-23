segs = '''<div class="segs">
  <button class="{% if active_page == 'payments' %}on{% endif %}" onclick="window.location='/payments/'">Payments</button>
  <button class="{% if active_page == 'finance' %}on{% endif %}" onclick="window.location='/finance/'">Finance</button>
  <button class="{% if active_page == 'payroll' %}on{% endif %}" onclick="window.location='/finance/payroll'">Payroll</button>
  <button class="{% if active_page == 'monthly_report' %}on{% endif %}" onclick="window.location='/monthly-report/'">Monthly Report</button>
</div>'''

import re

for tpl in ['templates/payments.html', 'templates/finance.html', 'templates/monthly_report.html']:
    with open(tpl, 'r') as f:
        text = f.read()
    text = re.sub(r'<div class="segs">.*?</div>', segs, text, flags=re.DOTALL)
    
    # Also fix active_page if needed
    if 'payments.html' in tpl:
        text = text.replace("{% if active_page == 'payments' %}", "{% if True %}")
    elif 'finance.html' in tpl:
        text = text.replace("{% if active_page == 'finance' %}", "{% if True %}")
    elif 'monthly_report.html' in tpl:
        text = text.replace("{% if active_page == 'monthly_report' %}", "{% if True %}")
        # And add Download PDF button at the end
        if 'Download PDF' not in text:
            text = text.replace('{% endblock %}', '<button class="btn block" style="margin-top:24px" onclick="window.print()"><i data-lucide="download"></i>Download PDF</button>\n{% endblock %}')
            
    with open(tpl, 'w') as f:
        f.write(text)

# Now create payroll.html
payroll_html = '''{% extends "base.html" %}
{% block title %}Payroll{% endblock %}
{% block page_title %}Payroll{% endblock %}
{% block topbar_actions %}
<div style="display:flex;gap:8px;align-items:center">
  <input class="form-control" type="month" value="{{ month_str }}" onchange="window.location='/finance/payroll?month='+this.value" style="width:150px;padding:5px 10px">
</div>
{% endblock %}

{% block content %}
''' + segs.replace("{% if active_page == 'payroll' %}", "{% if True %}") + '''

<div class="stats">
  <div class="stat"><div class="v money">{{ "{:,.0f}".format(total_teacher_share) }}</div><div class="l">Teacher Share</div></div>
</div>

<div class="card">
  <div class="ct">Group Revenue Split</div>
  {% for r in payroll_data %}
  <div class="row">
    <div class="av" style="background:{{ r.group.color or '#4f46e5' }}22;color:{{ r.group.color or '#4f46e5' }}">{{ r.group.name[0] }}</div>
    <div class="rmain">
      <div class="rt">{{ r.group.name }}</div>
      <div class="rs">{{ r.countable }} countable att. · {{ int(r.teacher_pct*100) }}% teacher split</div>
    </div>
    <div style="text-align:right">
      <div style="font-family:var(--fm);font-size:14px;font-weight:600;color:var(--money)">{{ "{:,.0f}".format(r.teacher_share) }}</div>
      <div style="font-size:12px;color:var(--txt3)">from {{ "{:,.0f}".format(r.revenue) }}</div>
    </div>
  </div>
  {% else %}
  <div style="padding:24px;text-align:center;color:var(--txt3)">No revenue to split for this month.</div>
  {% endfor %}
</div>
{% endblock %}
'''

with open("templates/payroll.html", 'w') as f:
    f.write(payroll_html)
