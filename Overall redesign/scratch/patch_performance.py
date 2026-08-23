import re

with open('templates/performance.html', 'r', encoding='utf-8') as f:
    text = f.read()

new_segs = """{% block content %}
<div class="segs">
  <button onclick="window.location='/students/'">Students</button>
  <button onclick="window.location='/groups/'">Groups</button>
  <button onclick="window.location='/waitlist/'">Waitlist</button>
  <button class="on" onclick="window.location='/performance/'">Performance</button>
  <button onclick="window.location='/placement/'">Placement tests</button>
</div>
"""

text = text.replace('{% block page_subtitle %}Student Performance{% endblock %}', '{% block page_subtitle %}CRM · groups · waitlist · performance · placement{% endblock %}')
text = text.replace('{% block page_title %}Student Performance{% endblock %}', '{% block page_title %}Students{% endblock %}')

if '<div class="segs">' not in text:
    text = text.replace('{% block content %}', new_segs)

with open('templates/performance.html', 'w', encoding='utf-8') as f:
    f.write(text)
