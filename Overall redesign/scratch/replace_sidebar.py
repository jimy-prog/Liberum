import re

with open('templates/base.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace body to display:flex
html = html.replace('<body>', '<body style="display:flex;">')

old_sidebar = re.search(r'<div class="sidebar" id="sidebar">.*?</div>\s*</div>', html, re.DOTALL)
if not old_sidebar:
    print("Could not find sidebar")
else:
    new_sidebar = """
  <aside class="side">
    <div class="brand"><div class="dotl">L</div>Liber<span>um</span></div>
    
    {% set _u = request.state.current_user %}
    {% set _is_owner = _u and _u.role == 'owner' %}
    {% set _is_teacher = _u and _u.role == 'teacher' %}
    {% set _is_staff = _is_owner or _is_teacher %}

    <div class="navlbl">Overview</div>
    <a href="/dashboard" class="ni {% if active_page=='dashboard' %}on{% endif %}"><i data-lucide="layout-dashboard"></i><span>Dashboard</span></a>
    
    {% if _is_owner %}
    <div class="navlbl">Administration</div>
    <a href="/owner/" class="ni {% if active_page=='owner_dashboard' %}on{% endif %}"><i data-lucide="shield"></i><span>Owner Admin</span></a>
    <a href="/owner/updates" class="ni {% if active_page=='owner_updates' %}on{% endif %}"><i data-lucide="refresh-cw"></i><span>Platform Updates</span></a>
    <a href="/owner/users" class="ni {% if active_page=='owner_users' %}on{% endif %}"><i data-lucide="users"></i><span>All Users</span></a>
    <a href="/mock/manage" class="ni {% if active_page=='manage_mocks' %}on{% endif %}"><i data-lucide="settings"></i><span>Manage Mocks</span></a>
    {% endif %}

    {% if _is_staff %}
    <div class="navlbl">Teaching</div>
    <a href="/timetable/" class="ni {% if active_page=='timetable' %}on{% endif %}"><i data-lucide="calendar"></i><span>Timetable</span></a>
    <a href="/classes/" class="ni {% if active_page=='classes' %}on{% endif %}"><i data-lucide="school"></i><span>My Classes</span></a>
    {% if _is_teacher %}
    <a href="/reviews/inbox" class="ni {% if active_page=='reviews' %}on{% endif %}"><i data-lucide="inbox"></i><span>Review Inbox</span></a>
    {% endif %}
    <a href="/groups/" class="ni {% if active_page=='groups' %}on{% endif %}"><i data-lucide="users-2"></i><span>Groups</span></a>
    <a href="/students/" class="ni {% if active_page=='students' %}on{% endif %}"><i data-lucide="users"></i><span>Students</span></a>
    <a href="/students/banned" class="ni {% if active_page=='banned' %}on{% endif %}"><i data-lucide="user-x"></i><span>Banned</span></a>
    <a href="/monthly-report/" class="ni {% if active_page=='monthly_report' %}on{% endif %}"><i data-lucide="file-text"></i><span>Monthly Report</span></a>
    {% endif %}
    
    <div class="navlbl">Tools</div>
    <a href="/mock/test" class="ni {% if active_page=='mock_dashboard' %}on{% endif %}"><i data-lucide="file-check"></i><span>Mock Test</span></a>
    <a href="/mock/history" class="ni {% if active_page=='mock_history' %}on{% endif %}"><i data-lucide="history"></i><span>History</span></a>
    
    {% if _is_staff %}
    <div class="navlbl">Finance</div>
    <a href="/payments/" class="ni {% if active_page=='payments' %}on{% endif %}"><i data-lucide="credit-card"></i><span>Payments</span></a>
    <a href="/finance/debts" class="ni {% if active_page=='debts' %}on{% endif %}"><i data-lucide="alert-circle"></i><span>Debts</span></a>
    <a href="/finance/income" class="ni {% if active_page=='income' %}on{% endif %}"><i data-lucide="trending-up"></i><span>Income</span></a>
    {% endif %}

    <div class="navlbl">Learning</div>
    <a href="/library/" class="ni {% if active_page=='library' %}on{% endif %}"><i data-lucide="book-open"></i><span>Library</span></a>
    <a href="/library/books" class="ni {% if active_page=='books' %}on{% endif %}"><i data-lucide="book"></i><span>Books</span></a>
    <a href="/library/audio" class="ni {% if active_page=='audio' %}on{% endif %}"><i data-lucide="headphones"></i><span>Audio</span></a>

    <div class="sp"></div>
    <a href="/settings" class="ni {% if active_page=='settings' %}on{% endif %}"><i data-lucide="settings"></i><span>Settings</span></a>
    <a href="/logout" class="ni"><i data-lucide="log-out"></i><span>Sign Out</span></a>
    
    <div class="ucard">
      {% set parts = _u.full_name.split() if _u.full_name else [_u.username] %}
      {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper if parts else 'U' %}
      <div class="av" style="background:#7B61FF">{{ initials }}</div>
      <div class="uc-t"><div class="nm">{{ _u.full_name or _u.username }}</div><div class="rl" style="text-transform:capitalize">{{ _u.role }} &middot; Liberum</div></div>
    </div>
  </aside>
"""
    html = html[:old_sidebar.start()] + new_sidebar + html[old_sidebar.end():]
    
    # Ensure main-content uses display flex with sidebar
    html = html.replace('<div class="main-content">', '<div class="main-content" style="flex:1; min-width:0; background:var(--bg); height:100vh; overflow-y:auto">')
    html = html.replace('</head>', '<script src="https://unpkg.com/lucide@latest"></script>\n</head>')
    
    # init lucide icons before body close
    html = html.replace('</body>', '<script>lucide.createIcons();</script>\n</body>')

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(html)
