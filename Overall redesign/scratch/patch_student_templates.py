import glob

files = glob.glob("templates/library/student_*.html") + \
        ["templates/library/grammar_detail.html",
         "templates/library/grammar_test.html",
         "templates/library/grammar_quiz.html",
         "templates/library/reader.html",
         "templates/library/audio_player.html"]

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
