with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Find the hbar-wrap block
new_chart = """  <div class="hbar-wrap">
    {% for h in history %}
      {% set pct = (h.income / max_history_income * 100)|int if max_history_income > 0 else 0 %}
      <div class="hbar2" title="{{ '{:,.0f}'.format(h.income) }} UZS">
        <i class="{% if not loop.last %}dim{% endif %}" style="height:{{ pct }}%"></i>
        <span>{{ h.month_name }}</span>
      </div>
    {% endfor %}
  </div>"""

text = re.sub(r'<div class="hbar-wrap">.*?</div>', new_chart, text, flags=re.DOTALL)

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
