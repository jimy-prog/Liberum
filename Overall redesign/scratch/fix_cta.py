with open('templates/base.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Add the Quick add button back into base.html tacts
new_tacts = """        <div class="tacts">
          <button class="aic" onclick="toggleTheme()" title="Dark mode"><i data-lucide="moon" id="themeIc"></i></button>
          <button class="aic" onclick="toast('No new notifications','bell')" title="Notifications"><i data-lucide="bell"></i><span class="bdg"></span></button>
          <button class="btn" style="background:var(--acc);color:#fff;font-weight:600;padding:8px 14px" onclick="toast('Quick add action', 'plus')">
            <i data-lucide="plus"></i>Quick add
          </button>
          {% block topbar_actions %}{% endblock %}
        </div>"""

text = re.sub(r'<div class="tacts">.*?</div>', new_tacts, text, flags=re.DOTALL)

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(text)

with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    dash = f.read()
# Remove topbar_actions from dashboard since it's now in base.html
dash = re.sub(r'\{% block topbar_actions %\}.*?\{% endblock %\}', '{% block topbar_actions %}{% endblock %}', dash, flags=re.DOTALL)
with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(dash)
