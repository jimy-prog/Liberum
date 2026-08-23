with open('templates/timetable.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('  <div>\n    <button class="btn ghost sm"', '  <div style="display:flex; align-items:center; gap:8px;">\n    <button class="btn ghost sm"')

with open('templates/timetable.html', 'w', encoding='utf-8') as f:
    f.write(text)
