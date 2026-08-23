import re

with open("routers/groups.py", "r") as f:
    text = f.read()

journal_route = '''
@router.get("/{group_id}/journal")
def group_journal(group_id: int, request: Request, db: Session = Depends(get_db)):
    group = db.query(Group).get(group_id)
    if not group:
        return RedirectResponse("/groups/")
    
    past_lessons = db.query(Lesson).filter(
        Lesson.group_id == group_id,
        Lesson.status.in_(["Held", "Cancelled", "Holiday"])
    ).order_by(Lesson.date.desc()).limit(20).all()
    
    return templates.TemplateResponse("group_journal.html", {
        "request": request, "group": group, "lessons": past_lessons,
        "active_page": "groups", "main_section": "academy"
    })
'''

if 'def group_journal' not in text:
    text += '\n' + journal_route
    with open("routers/groups.py", "w") as f:
        f.write(text)

journal_html = '''{% extends "base.html" %}
{% block title %}Journal: {{ group.name }}{% endblock %}
{% block page_title %}Journal: {{ group.name }}{% endblock %}
{% block topbar_actions %}
<button class="btn ghost sm" onclick="window.location='/groups/{{ group.id }}'"><i data-lucide="arrow-left"></i>Back to Group</button>
{% endblock %}
{% block content %}
<div class="card">
  <div class="ct">Recent Lessons</div>
  {% for l in lessons %}
  <div class="row" style="cursor:pointer" onclick="window.location='/lessons/{{ l.id }}'">
    <div class="av" style="background:var(--fill);color:var(--txt2)"><i data-lucide="book-open"></i></div>
    <div class="rmain">
      <div class="rt">{{ l.date.strftime('%b %d, %Y') }} at {{ l.time or 'N/A' }}</div>
      <div class="rs">Topic: {{ l.topic or 'No topic logged' }} · Status: {{ l.status }}</div>
    </div>
    <div style="font-size:13px;color:var(--txt3)">{{ l.attendance|length }} marked</div>
  </div>
  {% else %}
  <div style="padding:24px;text-align:center;color:var(--txt3)">No lessons recorded yet.</div>
  {% endfor %}
</div>
{% endblock %}
'''

with open("templates/group_journal.html", "w") as f:
    f.write(journal_html)
