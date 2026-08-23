files = ["templates/mock_history.html", "templates/mock_start.html", "templates/mock_take.html", "templates/mock_take_speaking.html", "templates/mock_results.html"]
for file in files:
    try:
        with open(file, "r") as f:
            text = f.read()
        if '{% extends "base.html" %}' in text:
            text = text.replace('{% extends "base.html" %}', '{% extends "student_base.html" %}')
            with open(file, "w") as f:
                f.write(text)
    except Exception as e:
        pass
