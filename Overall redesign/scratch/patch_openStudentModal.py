with open("templates/base.html", "r") as f:
    base = f.read()

import re

js = '''
<script>
async function openStudentModal(id) {
    try {
        const res = await fetch(`/students/${id}?modal=1`);
        if (!res.ok) throw new Error("Failed to load");
        const html = await res.text();
        let container = document.getElementById('student-modal-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'student-modal-container';
            document.body.appendChild(container);
        }
        container.innerHTML = html;
        if(window.lucide) lucide.createIcons();
    } catch (err) {
        window.location = `/students/${id}`;
    }
}
</script>
'''

if 'async function openStudentModal' not in base:
    base = base.replace('</body>', js + '\n</body>')
    with open("templates/base.html", "w") as f:
        f.write(base)

with open("templates/group_detail.html", "r") as f:
    text = f.read()

# Remove from group_detail
text = re.sub(r'<div id="student-modal-container"></div>', '', text)
text = re.sub(r'async function openStudentModal\(id\).*?\}', '', text, flags=re.DOTALL)

with open("templates/group_detail.html", "w") as f:
    f.write(text)
