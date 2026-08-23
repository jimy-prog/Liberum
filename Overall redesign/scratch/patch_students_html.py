with open("templates/students.html", "r") as f:
    text = f.read()

# Replace onclick
old_onclick = '''<div class="row" onclick="window.location='/students/{{ s.id }}'">'''
new_onclick = '''<div class="row" onclick="openStudentModal({{ s.id }})" style="cursor:pointer">'''
text = text.replace(old_onclick, new_onclick)

# Add js function at the end
js = '''
<div id="student-modal-container"></div>
<script>
async function openStudentModal(id) {
    try {
        const res = await fetch(`/students/${id}?modal=1`);
        if (!res.ok) throw new Error("Failed to load");
        const html = await res.text();
        document.getElementById('student-modal-container').innerHTML = html;
    } catch (err) {
        window.location = `/students/${id}`;
    }
}
</script>
'''

if 'openStudentModal' not in text:
    text = text.replace('{% endblock %}', js + '\n{% endblock %}')

with open("templates/students.html", "w") as f:
    f.write(text)

