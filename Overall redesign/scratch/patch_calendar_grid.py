with open("templates/timetable.html", "r") as f:
    text = f.read()

import re

# Add minmax(0,1fr) to .cal-grid
text = re.sub(r'\.cal-grid \{.*grid-template-columns:\s*repeat\(7,\s*1fr\);', '.cal-grid {\n  display: grid;\n  grid-template-columns: repeat(7, minmax(0, 1fr));', text, flags=re.DOTALL)

# Add minmax(0,1fr) to .wk in base.html
with open("templates/base.html", "r") as f2:
    base = f2.read()
base = re.sub(r'\.wk\{display:grid;grid-template-columns:repeat\(7,1fr\);gap:10px\}', '.wk{display:grid;grid-template-columns:repeat(7, minmax(0,1fr));gap:10px}', base)
with open("templates/base.html", "w") as f2:
    f2.write(base)

# The user wants "grid behind the calendar that separates the calendar... from other parts"
# Maybe put a card around the calendar?
old_monthly = '<div class="cal-grid">'
new_monthly = '<div class="card" style="padding: 16px; background: var(--card2); border: 1px solid var(--border); border-radius: 16px; margin-bottom: 32px;"><div class="cal-grid">'
if new_monthly not in text:
    text = text.replace(old_monthly, new_monthly)
    # We also need to close the extra div
    old_end = '  </a>\n  {% endfor %}\n</div>\n{% endif %}'
    new_end = '  </a>\n  {% endfor %}\n</div>\n</div>\n{% endif %}'
    text = text.replace(old_end, new_end)

with open("templates/timetable.html", "w") as f:
    f.write(text)
