with open("templates/students.html", "r") as f:
    text = f.read()

js = '''
<div id="student-modal-container"></div>
<script>
async function openStudentModal(id) {
    try {
        const res = await fetch(`/students/${id}?modal=1`);
        if (!res.ok) throw new Error("Failed to load");
        const html = await res.text();
        document.getElementById('student-modal-container').innerHTML = html;
        if (window.lucide) { window.lucide.createIcons(); }
    } catch (err) {
        window.location = `/students/${id}`;
    }
}
</script>
'''

if 'openStudentModal' not in text:
    # Just append it before the final {% endblock %}
    parts = text.rsplit('{% endblock %}', 1)
    text = parts[0] + js + '\n{% endblock %}'

with open("templates/students.html", "w") as f:
    f.write(text)
