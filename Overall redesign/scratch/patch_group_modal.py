import re

# 1. Update online.html to use openGroupAttendanceModal
with open("templates/online.html", "r") as f:
    text = f.read()

text = text.replace("window.location='/groups/{{ g.id }}'", "openGroupAttendanceModal({{ g.id }})")

js = '''
async function openGroupAttendanceModal(gid) {
    try {
        let res = await fetch(`/groups/${gid}/latest-lesson-modal`);
        let html = await res.text();
        let container = document.getElementById('modalContainer');
        if(!container) {
            container = document.createElement('div');
            container.id = 'modalContainer';
            document.body.appendChild(container);
        }
        container.innerHTML = html;
        if(window.lucide) lucide.createIcons();
        let modal = document.getElementById('lessonAttendanceModal');
        if (modal) modal.classList.add('open');
    } catch(e) {
        console.error(e);
    }
}
'''
text = text.replace('function toggleIncome() {', js + 'function toggleIncome() {')

with open("templates/online.html", "w") as f:
    f.write(text)

# 2. Add endpoint in routers/groups.py
with open("routers/groups.py", "r") as f:
    groups_router = f.read()

endpoint = '''
@router.get("/{gid}/latest-lesson-modal")
def latest_lesson_modal(gid: int, request: Request, db: Session = Depends(get_db)):
    group = db.query(Group).get(gid)
    # Find latest lesson
    lesson = db.query(Lesson).filter(Lesson.group_id == gid).order_by(Lesson.date.desc(), Lesson.time.desc()).first()
    if not lesson:
        return "<div class='ovl open' id='lessonAttendanceModal' onclick=\\"if(event.target===this)this.classList.remove('open')\\"><div class='modal'><div class='mt'>Error<button class='x' onclick=\\"document.getElementById('lessonAttendanceModal').classList.remove('open')\\"><i data-lucide='x'></i></button></div><div>No lessons found for this group.</div></div></div>"
    
    records = db.query(Attendance).filter(Attendance.lesson_id == lesson.id).all()
    students = db.query(Student).filter(
        Student.group_id == group.id, Student.active == True
    ).all()
    attended = {r.student_id: r for r in records}
    return templates.TemplateResponse("lesson_modal.html", {
        "request": request, "lesson": lesson, "records": records,
        "students": students, "attended": attended
    })
'''
if "def latest_lesson_modal" not in groups_router:
    groups_router += endpoint
    with open("routers/groups.py", "w") as f:
        f.write(groups_router)
