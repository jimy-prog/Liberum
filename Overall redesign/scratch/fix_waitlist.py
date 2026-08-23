with open('templates/waitlist.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# Remove duplicate topbar_actions
text = re.sub(r'\{% block topbar_actions %\}.*?\{% endblock %\}', '', text, count=1, flags=re.DOTALL)

with open('templates/waitlist.html', 'w', encoding='utf-8') as f:
    f.write(text)
