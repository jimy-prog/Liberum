import re

with open('templates/spa_app.html', 'r', encoding='utf-8') as f:
    spa = f.read()

# 1. Extract the CSS from spa_app.html
css_match = re.search(r'<style>(.*?)</style>', spa, re.DOTALL)
css = css_match.group(1) if css_match else ""

# 2. Extract the JS helpers from spa_app.html
js_helpers = """
<script>
const $=q=>document.querySelector(q);
const esc=s=>s.replace(/'/g,"\\'");
function toast(msg,ic='check-circle-2'){const t=document.createElement('div');t.className='toast';t.innerHTML=`<i data-lucide="${ic}"></i>${msg}`;$('#toasts').appendChild(t);lucide.createIcons();setTimeout(()=>{t.style.opacity=0;t.style.transition='.3s';setTimeout(()=>t.remove(),300)},2400)}
function openModal(html){$('#modal').innerHTML=html;$('#ovl').classList.add('open');lucide.createIcons()}
function closeModal(){$('#ovl').classList.remove('open')}
function openDrawer(html){$('#drawer').innerHTML=html;$('#drawer').classList.add('open');lucide.createIcons()}
function closeDrawer(){$('#drawer').classList.remove('open')}
function toggleTheme(){const h=document.documentElement;const d=h.dataset.theme==='dark';h.dataset.theme=d?'':'dark';$('#themeIc').setAttribute('data-lucide',d?'moon':'sun');lucide.createIcons();toast(d?'Light mode':'Dark mode',d?'sun':'moon')}
function setAccent(c,c2){document.documentElement.style.setProperty('--acc',c);document.documentElement.style.setProperty('--acc2',c2);document.querySelectorAll('.dotsw i').forEach(d=>d.classList.toggle('on',d.dataset.c===c))}
function seg(el,fn){el.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('on'));el.classList.add('on');fn()}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeDrawer()}});
</script>
"""

# 3. Build the new base.html completely from scratch, using the SPA shell
new_base = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{% block title %}}Liberum{{% endblock %}}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@0.454.0/dist/umd/lucide.min.js"></script>
<script src="https://cdn.lr-ingest.com/LogRocket.min.js" crossorigin="anonymous"></script>
<script>window.LogRocket && window.LogRocket.init('jgqnaa/liberum');</script>
<style>
{css}
{{% block extra_styles %}}{{% endblock %}}
</style>
</head>
<body>
<div class="app">
  <!-- ============ SIDEBAR ============ -->
  <aside class="side">
    <div class="brand"><div class="dotl">L</div><div>Liber<span>um</span></div></div>
    
    {{% set _u = request.state.current_user %}}
    {{% set _is_owner = _u and _u.role == 'owner' %}}
    {{% set _is_teacher = _u and _u.role == 'teacher' %}}
    {{% set _is_staff = _is_owner or _is_teacher %}}

    <div class="navlbl" style="margin-top:14px">Overview</div>
    <a href="/dashboard" class="ni {{% if active_page=='dashboard' %}}on{{% endif %}}"><i data-lucide="layout-dashboard"></i><span>Dashboard</span></a>
    
    {{% if _is_owner %}}
    <div class="navlbl">Administration</div>
    <a href="/owner/" class="ni {{% if active_page=='owner_dashboard' %}}on{{% endif %}}"><i data-lucide="shield"></i><span>Owner Admin</span></a>
    <a href="/owner/updates" class="ni {{% if active_page=='owner_updates' %}}on{{% endif %}}"><i data-lucide="refresh-cw"></i><span>Platform Updates</span></a>
    <a href="/owner/users" class="ni {{% if active_page=='owner_users' %}}on{{% endif %}}"><i data-lucide="users"></i><span>All Users</span></a>
    <a href="/mock/manage" class="ni {{% if active_page=='manage_mocks' %}}on{{% endif %}}"><i data-lucide="settings"></i><span>Manage Mocks</span></a>
    {{% endif %}}

    {{% if _is_staff %}}
    <div class="navlbl">Teaching</div>
    <a href="/timetable/" class="ni {{% if active_page=='timetable' %}}on{{% endif %}}"><i data-lucide="calendar"></i><span>Timetable</span></a>
    <a href="/classes/" class="ni {{% if active_page=='classes' %}}on{{% endif %}}"><i data-lucide="school"></i><span>My Classes</span></a>
    {{% if _is_teacher %}}
    <a href="/reviews/inbox" class="ni {{% if active_page=='reviews' %}}on{{% endif %}}"><i data-lucide="inbox"></i><span>Review Inbox</span></a>
    {{% endif %}}
    <a href="/groups/" class="ni {{% if active_page=='groups' %}}on{{% endif %}}"><i data-lucide="users-2"></i><span>Groups</span></a>
    <a href="/students/" class="ni {{% if active_page=='students' %}}on{{% endif %}}"><i data-lucide="users"></i><span>Students</span></a>
    <a href="/students/banned" class="ni {{% if active_page=='banned' %}}on{{% endif %}}"><i data-lucide="user-x"></i><span>Banned</span></a>
    <a href="/monthly-report/" class="ni {{% if active_page=='monthly_report' %}}on{{% endif %}}"><i data-lucide="file-text"></i><span>Monthly Report</span></a>
    {{% endif %}}
    
    <div class="navlbl">Tools</div>
    <a href="/mock/test" class="ni {{% if active_page=='mock_dashboard' %}}on{{% endif %}}"><i data-lucide="file-check"></i><span>Mock Test</span></a>
    <a href="/mock/history" class="ni {{% if active_page=='mock_history' %}}on{{% endif %}}"><i data-lucide="history"></i><span>History</span></a>
    
    {{% if _is_staff %}}
    <div class="navlbl">Finance</div>
    <a href="/payments/" class="ni {{% if active_page=='payments' %}}on{{% endif %}}"><i data-lucide="credit-card"></i><span>Payments</span></a>
    <a href="/finance/debts" class="ni {{% if active_page=='debts' %}}on{{% endif %}}"><i data-lucide="alert-circle"></i><span>Debts</span></a>
    <a href="/finance/income" class="ni {{% if active_page=='income' %}}on{{% endif %}}"><i data-lucide="trending-up"></i><span>Income</span></a>
    {{% endif %}}

    <div class="navlbl">Learning</div>
    <a href="/library/" class="ni {{% if active_page=='library' %}}on{{% endif %}}"><i data-lucide="book-open"></i><span>Library</span></a>
    <a href="/library/books" class="ni {{% if active_page=='books' %}}on{{% endif %}}"><i data-lucide="book"></i><span>Books</span></a>
    <a href="/library/audio" class="ni {{% if active_page=='audio' %}}on{{% endif %}}"><i data-lucide="headphones"></i><span>Audio</span></a>

    <div class="sp"></div>
    <a href="/settings" class="ni {{% if active_page=='settings' %}}on{{% endif %}}"><i data-lucide="settings"></i><span>Settings</span></a>
    <a href="/logout" class="ni"><i data-lucide="log-out"></i><span>Sign Out</span></a>
    
    <div class="ucard" style="margin-top:10px">
      {{% set parts = _u.full_name.split() if _u.full_name else [_u.username] if _u else ['U'] %}}
      {{% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper if parts else 'U' %}}
      <div class="av" style="background:var(--accbg);color:var(--acc2)">{{{{ initials }}}}</div>
      <div class="uc-t"><div class="nm">{{{{ _u.full_name or _u.username if _u else 'Guest' }}}}</div><div class="rl" style="text-transform:capitalize">{{{{ _u.role if _u else 'Visitor' }}}}</div></div>
    </div>
  </aside>

  <!-- ============ MAIN ============ -->
  <div class="main">
    <header class="top">
      <div class="row1">
        <div>
          <div class="ltitle">{{% block page_title %}}Home{{% endblock %}}</div>
          <div class="lsub">{{% block page_subtitle %}}{{% endblock %}}</div>
        </div>
        <div class="tacts">
          <button class="aic" onclick="toggleTheme()" title="Dark mode"><i data-lucide="moon" id="themeIc"></i></button>
          <button class="aic" onclick="toast('No new notifications','bell')" title="Notifications"><i data-lucide="bell"></i><span class="bdg"></span></button>
          {{% block topbar_actions %}}{{% endblock %}}
        </div>
      </div>
    </header>
    <main class="view" id="view">
      {{% block content %}}{{% endblock %}}
    </main>
  </div>
</div>

<div class="ovl" id="ovl" onclick="if(event.target===this)closeModal()"><div class="modal" id="modal"></div></div>
<div class="drawer" id="drawer"></div>
<div id="toasts"></div>

{js_helpers}
<script>
lucide.createIcons();
</script>
{{% block scripts %}}{{% endblock %}}
</body>
</html>
"""

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(new_base)
