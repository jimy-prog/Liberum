import glob

files = glob.glob("templates/library/student_*.html") + \
        ["templates/library/grammar_detail.html",
         "templates/library/grammar_test.html",
         "templates/library/grammar_quiz.html",
         "templates/library/reader.html",
         "templates/library/audio_player.html",
         "templates/mock_*.html",
         "templates/student_classes.html"]

for file in files:
    try:
        with open(file, "r") as f:
            text = f.read()

        text = text.replace('var(--accent)', 'var(--acc)')
        text = text.replace('var(--accent-glow)', 'var(--accbg)')
        text = text.replace('var(--accent2)', 'var(--acc2)')
        
        with open(file, "w") as f:
            f.write(text)
    except Exception as e:
        pass
