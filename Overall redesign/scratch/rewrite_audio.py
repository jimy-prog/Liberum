with open("templates/library/owner_audio_manage.html", "r") as f:
    text = f.read()

text = text.replace('class="card-header"', 'class="ct"').replace('<h2 class="card-title" style="color: var(--text);">', '').replace('</h2>', '')
text = text.replace('class="form-group"', 'class="fgroup"')
text = text.replace('<label class="form-label">', '<label>')
text = text.replace('btn btn-primary', 'btn block')
text = text.replace('btn btn-sm btn-danger', 'btn sm ghost p-red')

text = text.replace('var(--text)', 'var(--txt)').replace('var(--bg3)', 'var(--fill)').replace('var(--bg2)', 'var(--card)').replace('var(--border)', 'var(--line)')
text = text.replace('var(--text3)', 'var(--txt3)')

with open("templates/library/owner_audio_manage.html", "w") as f:
    f.write(text)
