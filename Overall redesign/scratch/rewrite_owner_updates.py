with open('templates/owner_updates.html', 'r', encoding='utf-8') as f:
    text = f.read()

new_html = """{% extends "base.html" %}
{% block title %}Platform Updates | Liberum{% endblock %}
{% block page_title %}Users & Platform{% endblock %}
{% block page_subtitle %}Manage all users and system settings{% endblock %}

{% block content %}
<div class="segs">
    <button onclick="window.location='/owner/users'">Users</button>
    <button class="on" onclick="window.location='/owner/updates'">Platform Updates</button>
</div>

<div class="card">
    <div class="ct">Recent Updates</div>
    {% for u in updates %}
    <div class="row">
        <div class="av" style="background:var(--accbg);color:var(--acc2)"><i data-lucide="refresh-cw"></i></div>
        <div class="rmain">
            <div class="rt">v{{ u.version }} · {{ u.title }}
                <span class="pill {% if u.status == 'Live' %}p-green{% else %}p-acc{% endif %}" style="margin-left:6px">{{ u.status }}</span>
            </div>
            <div class="rs">{{ u.description }}</div>
        </div>
        <span style="font-family:var(--fm);font-size:12px;color:var(--txt2)">{{ u.release_date.strftime('%Y-%m-%d') }}</span>
    </div>
    {% else %}
    <div class="empty">No updates recorded yet</div>
    {% endfor %}
</div>
{% endblock %}
"""

with open('templates/owner_updates.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
