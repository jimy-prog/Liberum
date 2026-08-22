import os
import re

def rewrite_topbar_fallback(filepath, title, subtitle, tabs_html):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    text = re.sub(r'\{% block page_title %\}.*?\{% endblock %\}', f'{{% block page_title %}}{title}{{% endblock %}}\n{{% block page_subtitle %}}{subtitle}{{% endblock %}}', text, flags=re.DOTALL)
    text = re.sub(r'\{% block topbar_actions %\}.*?\{% endblock %\}', '{% block topbar_actions %}{% endblock %}', text, flags=re.DOTALL)

    text = re.sub(r'\{% block content %\}', f'{{% block content %}}\n{tabs_html}\n', text, count=1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Fallback Patched {filepath}")

# Money
money_tabs = """<div class="segs">
  <button {t1} onclick="window.location='/payments/'">Payments</button>
  <button {t2} onclick="window.location='/finance/'">Finance</button>
  <button {t3} onclick="window.location='/monthly-report/'">Monthly report</button>
</div>"""
rewrite_topbar_fallback('templates/monthly_report.html', 'Money', 'Payments · finance · payroll · reports', money_tabs.format(t1='', t2='', t3='class="on"'))

# Learning
learning_tabs = """<div class="segs">
  <button {t1} onclick="window.location='/homework/'">Homework</button>
  <button {t2} onclick="window.location='/courses/'">Courses</button>
  <button {t3} onclick="window.location='/library/'">Library</button>
</div>"""
rewrite_topbar_fallback('templates/library/teacher_dashboard.html', 'Learning', 'Homework · courses · library · Lexi AI', learning_tabs.format(t1='', t2='', t3='class="on"'))
rewrite_topbar_fallback('templates/courses.html', 'Learning', 'Homework · courses · library · Lexi AI', learning_tabs.format(t1='', t2='class="on"', t3=''))

