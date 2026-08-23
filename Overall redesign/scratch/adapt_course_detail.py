with open("templates/course_detail.html", "r") as f:
    text = f.read()

text = text.replace('var(--bg2)', 'var(--card)')
text = text.replace('var(--bg3)', 'var(--fill)')
text = text.replace('var(--bg4)', 'var(--fill2)')
text = text.replace('var(--border)', 'var(--line)')
text = text.replace('var(--border2)', 'var(--acc)')
text = text.replace('var(--text)', 'var(--txt)')
text = text.replace('var(--text2)', 'var(--txt2)')
text = text.replace('var(--text3)', 'var(--txt3)')
text = text.replace('var(--radius-sm)', '8px')
text = text.replace('var(--radius)', '16px')
text = text.replace('pill-blue', 'p-acc')
text = text.replace('pill-grey', 'p-grey')
text = text.replace('pill-green', 'p-green')

with open("templates/course_detail.html", "w") as f:
    f.write(text)
