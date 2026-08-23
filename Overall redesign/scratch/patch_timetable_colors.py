with open('templates/timetable.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace background:var(--accbg);color:var(--acc) with dynamic color
text = text.replace('style="background:var(--accbg);color:var(--acc)"', 'style="background:{{ l.group.color }}18;color:{{ l.group.color }}"')

with open('templates/timetable.html', 'w', encoding='utf-8') as f:
    f.write(text)
