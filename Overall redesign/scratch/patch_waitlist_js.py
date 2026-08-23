with open('templates/waitlist.html', 'a', encoding='utf-8') as f:
    f.write("""
{% block scripts %}
<script>
function openEnroll(eid, name) {
  const form = document.getElementById('enrollForm');
  if (form) {
      form.action = `/waitlist/${eid}/enroll`;
  }
  document.getElementById('enrollModal').classList.add('open');
}
</script>
{% endblock %}
""")

# Also fix the onclick in waitlist.html to call openEnroll
with open('templates/waitlist.html', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace("document.getElementById('enrollModal').classList.add('open')", "openEnroll({{ w.id }}, '{{ w.name }}')")
with open('templates/waitlist.html', 'w', encoding='utf-8') as f:
    f.write(text)
