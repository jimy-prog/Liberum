with open('templates/owner_dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Insert segs top bar
new_content = """{% block content %}
<div class="segs">
    <button class="on" onclick="window.location='/owner/'">Overview</button>
    <button onclick="window.location='/owner/users'">Platform Users</button>
</div>
"""

text = re.sub(r'\{% block content %\}', new_content, text, count=1)

with open('templates/owner_dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
