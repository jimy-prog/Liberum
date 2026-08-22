import re

new_dash = """{% extends "base.html" %}
{% block title %}Dashboard{% endblock %}
{% block page_title %}Home{% endblock %}
{% block page_subtitle %}Your studio at a glance{% endblock %}

{% block content %}

{% if notifications %}
<div class="card mb-4" style="border:1px solid var(--red)">
  <div class="ct" style="color:var(--red)"><span style="display:flex;align-items:center;gap:8px"><i data-lucide="alert-triangle"></i> Alerts</span>
    <form method="post" action="/notifications/dismiss-all"><button class="btn dang sm">Dismiss all</button></form>
  </div>
  <div style="display:flex;flex-direction:column;gap:7px">
    {% for n in notifications %}
    <div class="row" style="padding-left:0;padding-right:0">
      <div class="rmain"><div class="rt">{{ n.message }}</div></div>
      <form method="post" action="/notifications/dismiss/{{ n.id }}" style="display:inline;flex-shrink:0">
        <button class="btn ghost sm"><i data-lucide="x"></i></button>
      </form>
    </div>
    {% endfor %}
  </div>
</div>
{% endif %}

<div class="stats">
  <div class="stat">
    <div class="ic" style="background:rgba(30,158,74,.12);color:var(--money)"><i data-lucide="banknote"></i></div>
    <div class="v">{{ stats.income_earned | default('0') }}</div>
    <div class="l">UZS earned · {{ today.strftime('%B') }}</div>
    {% if stats.max_income and stats.max_income > 0 %}
    <div class="d" style="color:var(--greenD)">On track</div>
    {% else %}
    <div class="d" style="color:var(--txt2)">max {{ stats.max_income | default('0') }}</div>
    {% endif %}
  </div>
  <div class="stat">
    <div class="ic" style="background:var(--accbg);color:var(--acc)"><i data-lucide="presentation"></i></div>
    <div class="v">{{ stats.lessons_done | default('0') }}<span style="font-size:15px;color:var(--txt3)">/{{ stats.lessons_total | default('0') }}</span></div>
    <div class="l">Lessons held</div>
    <div class="d" style="color:var(--txt2)">this month</div>
  </div>
  <div class="stat">
    <div class="ic" style="background:var(--accbg);color:var(--acc)"><i data-lucide="check-square"></i></div>
    <div class="v">{{ stats.attendance_rate | default('0') }}%</div>
    <div class="l">Attendance rate</div>
    <div class="d" style="color:var(--txt2)">same as last month</div>
  </div>
  <div class="stat">
    <div class="ic" style="background:rgba(255,69,58,.1);color:var(--red)"><i data-lucide="credit-card"></i></div>
    <div class="v">{{ stats.payments_done | default('0') }}<span style="font-size:15px;color:var(--txt3)">/{{ stats.payments_total | default('0') }}</span></div>
    <div class="l">Students paid</div>
    <div class="d" style="color:var(--txt2)">Manage →</div>
  </div>
</div>

<div class="grid2">
  <div class="card">
    <div class="ct">Today's classes <a href="/classes" class="link">Schedule →</a></div>
    {% if today_classes %}
      {% for c in today_classes %}
      <div class="row">
        <div class="av" style="background:var(--accbg);color:var(--acc2)"><i data-lucide="clock"></i></div>
        <div class="rmain">
          <div class="rt">{{ c.group.name }}</div>
          <div class="rs">{{ c.start_time.strftime('%H:%M') }} · Room {{ c.room_id | default('1') }}</div>
        </div>
        <a href="/classes/{{ c.id }}/attendance" class="btn soft sm">Marked</a>
      </div>
      {% endfor %}
    {% else %}
      <div class="empty">
        <i data-lucide="calendar"></i>
        <b>No classes today</b>
        Check your group schedules in <a href="/settings">Settings</a>
      </div>
    {% endif %}
    <a href="/classes/add" class="btn soft block" style="margin-top:12px"><i data-lucide="plus"></i>Add lesson</a>
  </div>

  <div class="card">
    <div class="ct">Needs attention</div>
    {% if recent_reviews %}
      {% for r in recent_reviews %}
      <div class="row" onclick="window.location='/reviews/inbox'">
        <div class="av" style="background:var(--fill);color:var(--txt2)"><i data-lucide="edit-3"></i></div>
        <div class="rmain">
          <div class="rt">Writing review waiting</div>
          <div class="rs">Submitted by {{ r.student.full_name }}</div>
        </div>
        <i data-lucide="chevron-right" style="color:var(--txt3)"></i>
      </div>
      {% endfor %}
    {% else %}
      <div class="empty" style="padding:20px">
        <i data-lucide="check-circle-2"></i>
        <div class="rs">All caught up!</div>
      </div>
    {% endif %}
  </div>
</div>
{% endblock %}
"""

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(new_dash)

new_owner_dash = """{% extends "base.html" %}
{% block title %}Owner Dashboard | Liberum{% endblock %}
{% block page_title %}Owner Control Center{% endblock %}
{% block page_subtitle %}Platform-wide overview{% endblock %}

{% block content %}
<div class="stats">
  <div class="stat">
    <div class="ic" style="background:rgba(30,158,74,.12);color:var(--money)"><i data-lucide="users"></i></div>
    <div class="v">{{ stats.total_teachers }}</div>
    <div class="l">Total Teachers</div>
  </div>
  <div class="stat">
    <div class="ic" style="background:var(--accbg);color:var(--acc)"><i data-lucide="users"></i></div>
    <div class="v">{{ stats.total_students }}</div>
    <div class="l">Total Students</div>
  </div>
  <div class="stat">
    <div class="ic" style="background:var(--accbg);color:var(--acc)"><i data-lucide="book-open"></i></div>
    <div class="v">{{ stats.total_mocks }}</div>
    <div class="l">Mock Library</div>
  </div>
  <div class="stat">
    <div class="ic" style="background:rgba(255,69,58,.1);color:var(--red)"><i data-lucide="check-square"></i></div>
    <div class="v">{{ stats.total_attempts }}</div>
    <div class="l">Total Attempts</div>
  </div>
</div>

<div class="grid2">
    <div class="card">
        <div class="ct">Recent User Registrations <a href="/owner/users" class="link">View All</a></div>
        {% for u in recent_users %}
        <div class="row">
            <div class="av" style="background:var(--fill);color:var(--txt2)"><i data-lucide="user"></i></div>
            <div class="rmain">
                <div class="rt">{{ u.full_name or u.username }}</div>
                <div class="rs">{{ u.email }} · Joined {{ u.created_at.strftime('%d %b %Y') if u.created_at else 'N/A' }}</div>
            </div>
            <span class="pill {{ 'p-acc' if u.role == 'teacher' else 'p-grey' }}">{{ u.role }}</span>
        </div>
        {% else %}
        <div class="empty">No recent registrations</div>
        {% endfor %}
    </div>

    <div class="card">
        <div class="ct">System Logs</div>
        {% for log in recent_logs %}
        <div class="row" style="padding-left:0;padding-right:0">
            <div class="rmain">
                <div class="rt" style="font-family:var(--fm);font-size:12px">{{ log.action }}</div>
                <div class="rs">User {{ log.user_id }} · {{ log.timestamp.strftime('%H:%M:%S') }}</div>
            </div>
        </div>
        {% else %}
        <div class="empty">No recent logs</div>
        {% endfor %}
    </div>
</div>
{% endblock %}
"""

with open('templates/owner_dashboard.html', 'w', encoding='utf-8') as f:
    f.write(new_owner_dash)

