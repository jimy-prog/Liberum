with open('templates/base.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re

# We need to replace the entire <aside class="side">...</aside>
new_sidebar = """<aside class="side">
    <div class="brand"><div class="dotl">L</div><div>Liber<span>um</span></div></div>
    
    {% set _u = request.state.current_user %}
    {% set _is_owner = _u and _u.role == 'owner' %}
    {% set _is_teacher = _u and _u.role == 'teacher' %}
    {% set _is_student = _u and _u.role == 'student' %}
    
    <nav id="nav" style="margin-top:20px;">
        {% if _is_owner %}
            <div class="navlbl">Owner Admin</div>
            <a href="/owner/" class="ni {% if main_section=='home' %}on{% endif %}"><i data-lucide="layout-dashboard"></i><span>Home</span></a>
            <a href="/owner/users" class="ni {% if main_section=='users' %}on{% endif %}"><i data-lucide="users"></i><span>Users & Platform</span></a>
        {% elif _is_teacher %}
            <div class="navlbl">Studio</div>
            <a href="/dashboard" class="ni {% if main_section=='home' %}on{% endif %}"><i data-lucide="layout-dashboard"></i><span>Home</span></a>
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
    </nav>
    <div class="sp"></div>
    <a href="/settings" class="ni {% if main_section=='settings' %}on{% endif %}"><i data-lucide="settings"></i><span>Settings</span></a>
    
    <div class="ucard" style="margin-top:10px; cursor:pointer;" onclick="window.location='/logout'">
      {% set parts = _u.full_name.split() if _u and _u.full_name else [_u.username] if _u else ['U'] %}
      {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper if parts else 'U' %}
      <div class="av" style="background:var(--accbg);color:var(--acc2)">{{ initials }}</div>
      <div class="uc-t"><div class="nm">{{ _u.full_name or _u.username if _u else 'Guest' }}</div><div class="rl" style="text-transform:capitalize">{{ _u.role if _u else 'Visitor' }} • Sign Out</div></div>
    </div>
  </aside>"""

html = re.sub(r'<aside class="side">.*?</aside>', new_sidebar, html, flags=re.DOTALL)

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(html)
