with open("templates/timetable.html", "r") as f:
    text = f.read()

import re

# We want to replace all occurrences of: window.location='/lessons/{{ l.id }}' (or c.lesson.id)
text = re.sub(r'window\.location=\'/lessons/\{\{\s*(l|c\.lesson)\.id\s*\}\}\'', r'openLessonModal({{\1.id}})', text)
# For Month view, I think I used <a href="/lessons/{{ l.id }}" ...
text = re.sub(r'href="/lessons/\{\{\s*(l|c\.lesson)\.id\s*\}\}"', r'href="#" onclick="openLessonModal({{\1.id}}); return false"', text)

# I should also add the openLessonModal function in the scripts block
modal_js = '''
<script>
async function openLessonModal(lid) {
    try {
        let res = await fetch(`/lessons/${lid}/modal`);
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
        modal.classList.add('open');
    } catch(e) {
        console.error(e);
    }
}
</script>
'''

if 'async function openLessonModal' not in text:
    text = text.replace('{% block scripts %}', '{% block scripts %}\n' + modal_js)

with open("templates/timetable.html", "w") as f:
    f.write(text)
