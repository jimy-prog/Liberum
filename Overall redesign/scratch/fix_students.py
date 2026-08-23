with open('templates/students.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# Remove duplicate page_subtitle
text = re.sub(r'\{% block page_subtitle %\}CRM · groups · waitlist · performance · placement\{% endblock %\}', '', text, count=1)

with open('templates/students.html', 'w', encoding='utf-8') as f:
    f.write(text)
