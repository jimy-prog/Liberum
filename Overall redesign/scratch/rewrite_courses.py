with open("templates/courses.html", "r") as f:
    text = f.read()

# I will replace CSS vars
text = text.replace('var(--text2)', 'var(--txt2)').replace('var(--text)', 'var(--txt)')
text = text.replace('var(--bg2)', 'var(--card)').replace('var(--bg3)', 'var(--fill)').replace('var(--border)', 'var(--line)')
text = text.replace('pill-blue', 'p-acc').replace('pill-grey', 'p-grey')
text = text.replace('var(--radius-sm)', '8px').replace('var(--radius)', '20px')

# I'll replace .course-card with .card
text = text.replace('class="course-card"', 'class="card" style="padding:0;overflow:hidden"')

with open("templates/courses.html", "w") as f:
    f.write(text)
