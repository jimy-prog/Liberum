import glob
for file in glob.glob("templates/mock*.html"):
    with open(file, "r") as f:
        text = f.read()
    text = text.replace('var(--bg2)', 'var(--card)').replace('var(--border)', 'var(--line)').replace('var(--text)', 'var(--txt)').replace('var(--text2)', 'var(--txt2)').replace('var(--text3)', 'var(--txt3)').replace('var(--accent)', 'var(--acc)').replace('var(--radius)', '16px').replace('class="card mb-6"', 'class="card" style="margin-bottom:24px"').replace('class="card-header"', 'class="ct"').replace('<span class="card-title">', '<span>')
    with open(file, "w") as f:
        f.write(text)
