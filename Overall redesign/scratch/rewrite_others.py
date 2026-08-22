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

# Mock Tests
mock_tabs = """<div class="segs">
  <button {t1} onclick="window.location='/reviews/inbox'">Review inbox</button>
  <button {t2} onclick="window.location='/mock/test'">Catalog</button>
  <button {t3} onclick="window.location='/mock/history'">History</button>
</div>"""

rewrite_topbar('templates/teacher_reviews.html', 'Mock Tests', 'IELTS & SAT · results · review inbox', mock_tabs.format(t1='class="on"', t2='', t3=''), r'<div class="card')
rewrite_topbar('templates/mock_dashboard.html', 'Mock Tests', 'IELTS & SAT · results · review inbox', mock_tabs.format(t1='', t2='class="on"', t3=''), r'<div class="card')
rewrite_topbar('templates/mock_history.html', 'Mock Tests', 'IELTS & SAT · results · review inbox', mock_tabs.format(t1='', t2='', t3='class="on"'), r'<div class="card')

# Money
money_tabs = """<div class="segs">
  <button {t1} onclick="window.location='/payments/'">Payments</button>
  <button {t2} onclick="window.location='/finance/'">Finance</button>
  <button {t3} onclick="window.location='/monthly-report/'">Monthly report</button>
</div>"""

rewrite_topbar('templates/payments.html', 'Money', 'Payments · finance · payroll · reports', money_tabs.format(t1='class="on"', t2='', t3=''), r'<div class="card')
rewrite_topbar('templates/finance.html', 'Money', 'Payments · finance · payroll · reports', money_tabs.format(t1='', t2='class="on"', t3=''), r'<div class="card')
rewrite_topbar('templates/monthly_report.html', 'Money', 'Payments · finance · payroll · reports', money_tabs.format(t1='', t2='', t3='class="on"'), r'<div class="card')

# Learning
learning_tabs = """<div class="segs">
  <button {t1} onclick="window.location='/homework/'">Homework</button>
  <button {t2} onclick="window.location='/courses/'">Courses</button>
  <button {t3} onclick="window.location='/library/'">Library</button>
</div>"""
rewrite_topbar('templates/library/teacher_dashboard.html', 'Learning', 'Homework · courses · library · Lexi AI', learning_tabs.format(t1='', t2='', t3='class="on"'), r'<div class="card')
rewrite_topbar('templates/homework.html', 'Learning', 'Homework · courses · library · Lexi AI', learning_tabs.format(t1='class="on"', t2='', t3=''), r'<div class="card')
rewrite_topbar('templates/courses.html', 'Learning', 'Homework · courses · library · Lexi AI', learning_tabs.format(t1='', t2='class="on"', t3=''), r'<div class="card')

