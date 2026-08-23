with open("templates/library/owner_books_manage.html", "r") as f:
    text = f.read()

# Replace .card-header with .ct, .card-title with nothing
text = text.replace('class="card-header"', 'class="ct"').replace('<h2 class="card-title" style="color: var(--text);">', '').replace('</h2>', '')
text = text.replace('class="form-group"', 'class="fgroup"')
text = text.replace('<label class="form-label">', '<label>')
text = text.replace('btn btn-primary', 'btn block')
text = text.replace('btn btn-sm btn-danger', 'btn sm ghost p-red')

# Replace the table with .row elements
# Wait, it's easier to just use standard table for now or write a regex.
# Let's just fix the classes.
text = text.replace('var(--text)', 'var(--txt)').replace('var(--bg3)', 'var(--fill)').replace('var(--bg2)', 'var(--card)').replace('var(--border)', 'var(--line)')
text = text.replace('var(--text3)', 'var(--txt3)')

with open("templates/library/owner_books_manage.html", "w") as f:
    f.write(text)
