with open('templates/owner_users.html', 'r', encoding='utf-8') as f:
    text = f.read()

new_html = """{% extends "base.html" %}
{% block title %}User Management | Owner{% endblock %}
{% block page_title %}Users & Platform{% endblock %}
{% block page_subtitle %}Manage all users and system settings{% endblock %}

{% block content %}
<div class="segs">
    <button class="{% if not active_role %}on{% endif %}" onclick="window.location='/owner/users'">All</button>
    <button class="{% if active_role=='teacher' %}on{% endif %}" onclick="window.location='/owner/users?role=teacher'">Teachers</button>
    <button class="{% if active_role=='student' %}on{% endif %}" onclick="window.location='/owner/users?role=student'">Students</button>
</div>

<div class="card">
    <div class="ct">Platform Users</div>
    {% for u in users %}
    <div class="row">
        {% set parts = u.full_name.split() if u.full_name else [u.username] %}
        {% set initials = (parts[0][0] + (parts[1][0] if parts|length > 1 else '')) | upper %}
        <div class="av" style="background:var(--fill);color:var(--txt2)">{{ initials }}</div>
        
        <div class="rmain">
            <div class="rt">{{ u.full_name or u.username }} 
                {% if u.is_banned %}
                <span class="pill p-red" style="margin-left:6px">Banned</span>
                {% elif not u.is_active %}
                <span class="pill p-orange" style="margin-left:6px">Inactive</span>
                {% else %}
                <span class="pill p-green" style="margin-left:6px">Active</span>
                {% endif %}
            </div>
            <div class="rs">{{ u.email }} · Joined {{ u.created_at.strftime('%Y-%m-%d') }}</div>
        </div>
        
        <span class="pill {% if u.role == 'teacher' %}p-acc{% elif u.role == 'owner' %}p-red{% else %}p-grey{% endif %}" style="text-transform:capitalize">{{ u.role }}</span>
        
        <div style="display:flex; gap:6px;">
            <form action="/owner/users/{{ u.id }}/ban" method="POST" style="margin:0;">
                <button type="submit" class="btn sm {% if u.is_banned %}soft{% else %}ghost{% endif %}">
                    {% if u.is_banned %}Unban{% else %}Ban{% endif %}
                </button>
            </form>
            {% if u.id != user.id %}
            <form action="/owner/users/{{ u.id }}/delete" method="POST" style="margin:0;" onsubmit="return confirm('Are you sure you want to PERMANENTLY DELETE this user?');">
                <button type="submit" class="btn sm dang"><i data-lucide="trash-2"></i></button>
            </form>
            {% endif %}
        </div>
    </div>
    {% else %}
    <div class="empty">No users found</div>
    {% endfor %}
</div>
{% endblock %}
"""

with open('templates/owner_users.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
