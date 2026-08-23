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

        text = text.replace('var(--bg2)', 'var(--card)')
        text = text.replace('var(--bg3)', 'var(--fill)')
        text = text.replace('var(--bg4)', 'var(--fill2)')
        text = text.replace('var(--border)', 'var(--line)')
        text = text.replace('var(--border2)', 'var(--acc)')
        text = text.replace('var(--text2)', 'var(--txt2)')
        text = text.replace('var(--text3)', 'var(--txt3)')
        text = text.replace('var(--text)', 'var(--txt)')
        text = text.replace('btn-primary', 'block')
        text = text.replace('btn btn-sm', 'btn sm')
        
        with open(file, "w") as f:
            f.write(text)
    except Exception as e:
        pass
