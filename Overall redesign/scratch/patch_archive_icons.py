with open("templates/archive.html", "r") as f:
    text = f.read()

text = text.replace('🗂', '<i data-lucide="folder"></i>')
text = text.replace('👤', '<i data-lucide="users"></i>')

with open("templates/archive.html", "w") as f:
    f.write(text)
