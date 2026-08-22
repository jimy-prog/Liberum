import os
import re

def rewrite_topbar(filepath, title, subtitle, tabs_html, split_regex):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(r'\{% block page_title %\}.*?\{% endblock %\}', f'{{% block page_title %}}{title}{{% endblock %}}\n{{% block page_subtitle %}}{subtitle}{{% endblock %}}', text, flags=re.DOTALL)
    text = re.sub(r'\{% block topbar_actions %\}.*?\{% endblock %\}', '{% block topbar_actions %}{% endblock %}', text, flags=re.DOTALL)

    match = re.search(f'\\{{% block content %\\}}.*?({split_regex})', text, re.DOTALL)
    
    new_content = f"{{% block content %}}\n{tabs_html}\n"
    if match:
        text = text[:match.start()] + new_content + match.group(1) + text[match.end():]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"Patched {filepath}")
    else:
        print(f"Could not match in {filepath}")

schedule_tabs = """<div class="segs">
  <button onclick="window.location='/timetable/weekly'">Week</button>
  <button onclick="window.location='/timetable/'">Day</button>
  <button onclick="window.location='/timetable/monthly'">Month</button>
  <button class="on" onclick="window.location='/classes/'">Classes</button>
  <button onclick="window.location='/online/'">Online</button>
</div>"""

rewrite_topbar('templates/teacher_classes.html', 'Schedule', 'Timetable · attendance · online · class invites', schedule_tabs, r'<div class="card')
rewrite_topbar('templates/online.html', 'Schedule', 'Timetable · attendance · online · class invites', schedule_tabs.replace('class="on" onclick="window.location=\'/classes/\'"', 'onclick="window.location=\'/classes/\'"').replace('onclick="window.location=\'/online/\'"', 'class="on" onclick="window.location=\'/online/\'"'), r'<div class="card')
