with open('templates/owner_dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("{{ channel: ' + log.channel + ' }}", "{{ log.channel }}")

with open('templates/owner_dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
