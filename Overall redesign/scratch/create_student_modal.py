import re

# Read routers/students.py
with open("routers/students.py", "r") as f:
    text = f.read()

# Replace return templates.TemplateResponse("student_detail.html"...
# with conditional
old = 'return templates.TemplateResponse("student_detail.html", {'
new = '''template_name = "student_detail_modal.html" if request.query_params.get("modal") else "student_detail.html"
    return templates.TemplateResponse(template_name, {'''
text = text.replace(old, new)
with open("routers/students.py", "w") as f:
    f.write(text)

