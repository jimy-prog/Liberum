with open("templates/course_detail.html", "r") as f:
    text = f.read()

text = text.replace('var(--text2)', 'var(--txt2)').replace('var(--text)', 'var(--txt)').replace('var(--text3)', 'var(--txt3)')
text = text.replace('var(--bg2)', 'var(--card)').replace('var(--bg3)', 'var(--fill)').replace('var(--border)', 'var(--line)').replace('var(--bg4)', 'var(--fill2)')
text = text.replace('pill-blue', 'p-acc').replace('pill-grey', 'p-grey')
text = text.replace('var(--radius-sm)', '8px').replace('var(--radius)', '16px')

text = text.replace('class="card mb-6"', 'class="card" style="margin-bottom:16px"')
text = text.replace('class="card-header"', 'class="ct"').replace('<span class="card-title">', '<span>').replace('btn btn-primary btn-sm', 'btn sm block').replace('btn btn-ghost btn-sm mb-4', 'btn sm ghost" style="margin-bottom:16px;')

with open("templates/course_detail.html", "w") as f:
    f.write(text)
