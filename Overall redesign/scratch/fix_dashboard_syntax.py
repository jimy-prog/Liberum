with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

# I'll just find the entire card and replace it.
import re
text = re.sub(r'<div class="card">\s*<div class="ct">{{ today.strftime\(' + r"'%B'" + r'\) }} income.*?{% endblock %}', 
"""<div class="card">
  <div class="ct">{{ today.strftime('%B') }} income <span class="link" onclick="window.location='/finance/'">Money →</span></div>
  <div class="hbar-wrap">
    {% for h in history %}
      {% set pct = (h.income / max_history_income * 100)|int if max_history_income > 0 else 0 %}
      <div class="hbar2" title="{{ '{:,.0f}'.format(h.income) }} UZS">
        <i class="{% if not loop.last %}dim{% endif %}" style="height:{{ pct }}%"></i>
        <span>{{ h.month_name }}</span>
      </div>
    {% endfor %}
  </div>
</div>
{% endblock %}""", text, flags=re.DOTALL)

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
