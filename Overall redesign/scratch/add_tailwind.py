with open("templates/library/teacher_dashboard.html", "r") as f:
    text = f.read()

if "cdn.tailwindcss.com" not in text:
    text = text.replace('{% block extra_styles %}', '{% block extra_styles %}\n<script src="https://cdn.tailwindcss.com"></script>\n<script>\n  tailwind.config = {\n    darkMode: "class",\n    theme: {\n      extend: {\n        colors: {\n          gray: {\n            800: "#1e1e24",\n            900: "#131316"\n          }\n        }\n      }\n    }\n  }\n</script>')
    if '{% block extra_styles %}' not in text:
        # Add it if missing
        text = text.replace('{% block content %}', '{% block extra_styles %}\n<script src="https://cdn.tailwindcss.com"></script>\n<script>\n  tailwind.config = {\n    darkMode: "class",\n    theme: {\n      extend: {\n        colors: {\n          gray: {\n            800: "#1e1e24",\n            900: "#131316"\n          }\n        }\n      }\n    }\n  }\n</script>\n{% endblock %}\n\n{% block content %}')

with open("templates/library/teacher_dashboard.html", "w") as f:
    f.write(text)

# Also add to owner_books_manage and owner_audio_manage
for file in ["templates/library/owner_books_manage.html", "templates/library/owner_audio_manage.html"]:
    with open(file, "r") as f:
        t = f.read()
    if "cdn.tailwindcss.com" not in t:
        if '{% block extra_styles %}' in t:
            t = t.replace('{% block extra_styles %}', '{% block extra_styles %}\n<script src="https://cdn.tailwindcss.com"></script>')
        else:
            t = t.replace('{% block content %}', '{% block extra_styles %}\n<script src="https://cdn.tailwindcss.com"></script>\n{% endblock %}\n\n{% block content %}')
    with open(file, "w") as f:
        f.write(t)
