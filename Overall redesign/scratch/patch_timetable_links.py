with open("templates/timetable.html", "r") as f:
    text = f.read()

# Make week view groups clickable
import re
text = re.sub(r'<div class="rt">{{ l.group.name }}</div>', r'<div class="rt" style="cursor:pointer" onclick="window.location=\'/groups/{{ l.group.id }}\'">{{ l.group.name }}</div>', text)

# Make day view groups clickable
text = re.sub(r'<div class="rt">{{ c.lesson.group.name }}</div>', r'<div class="rt" style="cursor:pointer" onclick="window.location=\'/groups/{{ c.lesson.group.id }}\'">{{ c.lesson.group.name }}</div>', text)

with open("templates/timetable.html", "w") as f:
    f.write(text)
