files = ["templates/library/owner_books_manage.html", "templates/library/owner_audio_manage.html"]
for file in files:
    with open(file, "r") as f:
        text = f.read()

    text = text.replace('var(--text)', 'var(--txt)')
    text = text.replace('var(--text2)', 'var(--txt2)')
    text = text.replace('var(--text3)', 'var(--txt3)')
    text = text.replace('var(--bg2)', 'var(--card)')
    text = text.replace('var(--bg3)', 'var(--fill)')
    text = text.replace('var(--border)', 'var(--line)')
    text = text.replace('var(--border2)', 'var(--acc)')
    
    with open(file, "w") as f:
        f.write(text)
