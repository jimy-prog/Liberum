with open('templates/base.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. CSS tokens
new_root = """
/* ================= TOKENS ================= */
:root{
  --bg:#F5F5F7; --card:#FFFFFF; --card2:#FBFBFD; --fill:rgba(120,120,128,.12); --fill2:rgba(120,120,128,.18);
  --line:rgba(0,0,0,.07); --txt:#1D1D1F; --txt2:#6E6E73; --txt3:#AEAEB2;
  --acc:#7B61FF; --acc2:#6B51EF; --accbg:rgba(123,97,255,.1);
  --green:#30D158; --greenD:#1E9E4A; --red:#FF453A; --yellow:#FFD60A; --orange:#FF9F0A; --money:#1E9E4A;
  --shadow:0 1px 2px rgba(0,0,0,.04),0 8px 28px -12px rgba(0,0,0,.08);
  --r:18px; --rs:13px;
  --fd:'Space Grotesk',sans-serif; --fb:'Inter',-apple-system,sans-serif; --fm:'JetBrains Mono',monospace;
  --border: var(--line);
  --border2: rgba(0,0,0,.15);
  --text: var(--txt);
  --text2: var(--txt2);
  --text3: var(--txt3);
  --accent: var(--acc);
  --accent2: var(--acc2);
}
"""
import re
html = re.sub(r':root\s*\{[^}]*\}', new_root, html, count=1)

new_classes = """
.side{width:250px;flex:none;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:22px 14px 14px;border-right:1px solid var(--line);background:var(--bg);z-index:40}
.brand{font-family:var(--fd);font-weight:700;font-size:23px;letter-spacing:-.03em;padding:0 12px;display:flex;align-items:center;gap:10px}
.brand span{color:var(--acc)}
.brand .dotl{width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,var(--acc),var(--acc2));display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px}
.navlbl{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--txt3);padding:14px 12px 6px}
.ni{display:flex;align-items:center;gap:11px;padding:9.5px 12px;border-radius:12px;font-size:14px;font-weight:500;color:var(--txt2);margin-bottom:2px;transition:.18s;width:100%;text-align:left;position:relative; text-decoration:none}
.ni:hover{background:var(--fill);color:var(--txt)}
.ni.on{background:var(--card);color:var(--txt);font-weight:600;box-shadow:var(--shadow)}
.ni.on::before{content:'';position:absolute;left:-14px;top:20%;bottom:20%;width:3.5px;border-radius:2px;background:var(--acc)}
.sp{flex:1}
.ucard{display:flex;align-items:center;gap:10px;background:var(--card);border-radius:14px;padding:10px 12px;box-shadow:var(--shadow);margin-top:10px}
.ucard .nm{font-size:13px;font-weight:600; color:var(--txt)}
.ucard .rl{font-size:11px;color:var(--txt2)}
.ucard .av{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;font-family:var(--fd)}
"""
html = html.replace('</style>', new_classes + '\n</style>')

# 2. Sidebar replacement
new_sidebar = """<aside class="side">
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
  </aside>"""

parts = html.split('<div class="sidebar" id="sidebar">')
before_sidebar = parts[0]
after_sidebar = parts[1].split('<div class="main-content">')[1]

final_html = before_sidebar + new_sidebar + '\n<div class="main-content" style="flex:1; min-width:0; background:var(--bg); height:100vh; overflow-y:auto">\n' + after_sidebar

final_html = final_html.replace('<body>', '<body style="display:flex;">')
final_html = final_html.replace('</head>', '<script src="https://unpkg.com/lucide@latest"></script>\n</head>')
final_html = final_html.replace('</body>', '<script>lucide.createIcons();</script>\n</body>')

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(final_html)
