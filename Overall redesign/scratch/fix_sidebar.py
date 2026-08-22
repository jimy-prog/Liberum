with open('templates/base.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re

new_nav = """    <nav id="nav" style="margin-top:20px;">
        {% if _is_owner %}
            <div class="navlbl">Owner Admin</div>
            <a href="/owner/" class="ni {% if main_section=='home' %}on{% endif %}"><i data-lucide="shield"></i><span>Overview</span></a>
            <a href="/owner/users" class="ni {% if main_section=='users' %}on{% endif %}"><i data-lucide="users"></i><span>Platform Users</span></a>
        {% endif %}

        {% if _is_teacher or _is_owner %}
            <div class="navlbl">Studio</div>
            <a href="/dashboard" class="ni {% if main_section=='studio_home' %}on{% endif %}"><i data-lucide="layout-dashboard"></i><span>Dashboard</span></a>
            <a href="/timetable/" class="ni {% if main_section=='schedule' %}on{% endif %}"><i data-lucide="calendar-days"></i><span>Schedule</span></a>
            <a href="/students/" class="ni {% if main_section=='students' %}on{% endif %}"><i data-lucide="users"></i><span>Students</span></a>
            <a href="/library/" class="ni {% if main_section=='learning' %}on{% endif %}"><i data-lucide="book-open"></i><span>Learning</span></a>
            <a href="/reviews/inbox" class="ni {% if main_section=='mock' %}on{% endif %}"><i data-lucide="target"></i><span>Mock Tests</span></a>
            <a href="/payments/" class="ni {% if main_section=='money' %}on{% endif %}"><i data-lucide="wallet"></i><span>Money</span></a>
        {% elif _is_student %}
            <div class="navlbl">Learning</div>
            <a href="/dashboard" class="ni {% if main_section=='home' %}on{% endif %}"><i data-lucide="layout-dashboard"></i><span>Home</span></a>
            <a href="/library/" class="ni {% if main_section=='learn' %}on{% endif %}"><i data-lucide="book-open"></i><span>Learn</span></a>
            <a href="/mock/history" class="ni {% if main_section=='mock' %}on{% endif %}"><i data-lucide="target"></i><span>Mock Tests</span></a>
            <a href="/payments/" class="ni {% if main_section=='money' %}on{% endif %}"><i data-lucide="credit-card"></i><span>Payments</span></a>
        {% endif %}
    </nav>"""

html = re.sub(r'<nav id="nav".*?</nav>', new_nav, html, flags=re.DOTALL)

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(html)
