with open("templates/timetable.html", "r") as f:
    text = f.read()

import re
# Add icon to Attendance button
text = re.sub(r'>Attendance</button>', r'><i data-lucide="check-square"></i>Attendance</button>', text)

with open("templates/timetable.html", "w") as f:
    f.write(text)
