with open("templates/library/teacher_dashboard.html", "r") as f:
    text = f.read()

text = text.replace('{% block content %}', '{% block page_title %}Learning / Library{% endblock %}\n{% block page_subtitle %}Homework · courses · library · Lexi AI{% endblock %}\n\n{% block content %}')

with open("templates/library/teacher_dashboard.html", "w") as f:
    f.write(text)
