import re

# 1. Update routers/lessons.py to add the modal endpoint
with open("routers/lessons.py", "r") as f:
    lessons_router = f.read()

modal_endpoint = '''
@router.get("/{lid}/modal")
def lesson_modal_view(lid: int, request: Request, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).get(lid)
    records = db.query(Attendance).filter(Attendance.lesson_id == lid).all()
    students = db.query(Student).filter(
        Student.group_id == lesson.group_id, Student.active == True
    ).all()
    attended = {r.student_id: r for r in records}
    return templates.TemplateResponse("lesson_modal.html", {
        "request": request, "lesson": lesson, "records": records,
        "students": students, "attended": attended
    })
'''

if "def lesson_modal_view" not in lessons_router:
    lessons_router += modal_endpoint
    with open("routers/lessons.py", "w") as f:
        f.write(lessons_router)

# 2. Create templates/lesson_modal.html
lesson_modal_html = '''
<div class="ovl" id="lessonAttendanceModal" onclick="if(event.target===this)closeModal('lessonAttendanceModal')">
  <div class="modal">
    <div class="mt">
      Attendance · {{ lesson.group.name }}
      <button class="x" onclick="closeModal('lessonAttendanceModal')"><i data-lucide="x"></i></button>
    </div>
    <div style="font-size:13px;color:var(--txt3);margin-bottom:16px">{{ lesson.date.strftime('%d %B %Y') }} · {{ lesson.time }} · {% if lesson.mode == 'online' %}Online{% else %}Room {{ lesson.room or '1' }}{% endif %}</div>
    
    <form method="post" action="/lessons/{{ lesson.id }}/save?from_modal=1">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-weight:600;font-size:14px">Students ({{ students|length }})</span>
        <button type="button" class="btn sm soft" onclick="document.querySelectorAll('.att-select').forEach(s=>s.value='Present')">
          <i data-lucide="check-square"></i> Mark all present
        </button>
      </div>
      
      <div style="max-height: 40vh; overflow-y: auto; margin:0 -12px; padding:0 12px">
        {% for s in students %}
        {% set rec = attended.get(s.id) %}
        {% set status = rec.status if rec else '' %}
        <div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)">
            <div class="rmain">
                <div class="rt">{{ s.name }}</div>
            </div>
            <select class="form-control att-select" name="att_{{ s.id }}" style="width:120px;padding:6px;font-size:13px">
                <option value="" {% if not status %}selected{% endif %}>- Select -</option>
                <option value="Present" {% if status == 'Present' %}selected{% endif %}>Present</option>
                <option value="Absent" {% if status == 'Absent' %}selected{% endif %}>Absent</option>
                <option value="Excused" {% if status == 'Excused' %}selected{% endif %}>Excused</option>
            </select>
        </div>
        {% else %}
        <div class="empty" style="padding:24px 0">No students in this group</div>
        {% endfor %}
      </div>
      
      <button type="submit" class="btn block" style="margin-top:16px"><i data-lucide="save"></i>Save Attendance</button>
    </form>
  </div>
</div>
'''

with open("templates/lesson_modal.html", "w") as f:
    f.write(lesson_modal_html)
