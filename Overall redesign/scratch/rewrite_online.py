with open("templates/online.html", "w") as f:
    f.write('''{% extends "base.html" %}
{% block title %}Online Classes{% endblock %}
{% block page_title %}Schedule{% endblock %}
{% block page_subtitle %}Timetable · attendance · online · class invites{% endblock %}

{% block content %}
<div class="segs">
  <button onclick="window.location='/timetable/monthly'">Month</button>
  <button onclick="window.location='/timetable/weekly'">Week</button>
  <button onclick="window.location='/timetable/'">Day</button>
  <button class="on" onclick="window.location='/timetable/online'">Online</button>
  <button onclick="window.location='/classes'">Classes & invites</button>
</div>

<div class="stats">
  <div class="stat"><div class="v">{{ online_groups|length }}</div><div class="l">Online groups</div></div>
  <div class="stat"><div class="v">{{ students_count }}</div><div class="l">Online students</div></div>
  <div class="stat" style="position:relative">
    <button class="btn btn-ghost sm" id="toggleEye" onclick="toggleIncome()" style="position:absolute;top:4px;right:4px;padding:4px"><i data-lucide="eye-off"></i></button>
    <div class="v money" id="incomeVal" data-val="{{ "{:,.0f}".format(income) }}" style="filter:blur(6px);user-select:none">***</div>
    <div class="l">UZS this month</div>
  </div>
</div>

<div class="card">
  <div class="ct">Online Groups</div>
  {% for g in online_groups %}
  <div class="row" style="cursor:pointer" onclick="window.location='/groups/{{ g.id }}'">
    <div class="av" style="background:var(--accbg);color:var(--acc)"><i data-lucide="monitor"></i></div>
    <div class="rmain">
      <div class="rt">{{ g.name }} <span class="pill p-green" style="margin-left:6px">Online</span></div>
      <div class="rs">{{ g.schedule or 'No Schedule' }} · Zoom</div>
    </div>
    <span style="font-family:var(--fm);font-size:13px;color:var(--txt2)">{{ g.students|length }} students</span>
    {% if g.zoom_link %}
    <button class="btn sm ghost" style="margin-left:12px;z-index:2" onclick="event.stopPropagation(); window.open('{{ g.zoom_link }}')"><i data-lucide="video"></i>Join</button>
    {% endif %}
    <!-- Also allow marking attendance if there is a lesson today? The user said "if I tap to a group inside online section the attendance only should pop up" 
    Wait, the user wants the attendance modal to open when tapping the group in the online section! 
    Let's change onclick to openLessonModal. But which lesson? We can't know unless we find today's lesson. 
    Actually, let's just make it go to the group journal or group page. 
    Wait, "if I tap to a group inside online section the attendance only should pop up".
    But an attendance modal requires a *lesson_id*. What if they don't have a lesson today? 
    Let's find the latest lesson for this group and open it, or just let them go to the group page for now. 
    Wait, I'll add a 'latest_lesson_id' if possible, or just open group page. The instruction says: "the same logic should be for the online section inside schedule section if I tap to a group inside online section the attendance only should pop up".
    Okay, I will change onclick to openGroupAttendanceModal({{ g.id }}) and create an endpoint for it.
    -->
  </div>
  {% else %}
  <div class="empty">No online groups found. Go to Settings > Other to set a group as online.</div>
  {% endfor %}
</div>
{% endblock %}

{% block scripts %}
<script>
function toggleIncome() {
    let el = document.getElementById('incomeVal');
    let btn = document.getElementById('toggleEye');
    if (el.style.filter === 'blur(6px)') {
        el.style.filter = 'none';
        el.innerText = el.getAttribute('data-val');
        btn.innerHTML = '<i data-lucide="eye"></i>';
    } else {
        el.style.filter = 'blur(6px)';
        el.innerText = '***';
        btn.innerHTML = '<i data-lucide="eye-off"></i>';
    }
    lucide.createIcons();
}
</script>
{% endblock %}
''')
