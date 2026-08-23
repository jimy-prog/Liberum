with open("templates/group_detail.html", "r") as f:
    text = f.read()

import re
# Add monospace to numbers
text = text.replace('class="rt">{{ group.price }} UZS</div>', 'class="rt" style="font-family:var(--fm);font-weight:600">{{ "{:,.0f}".format(group.price|float if group.price else 0) }} UZS</div>')
text = text.replace('<div style="font-size:18px;font-weight:700">', '<div style="font-size:24px;font-weight:700;font-family:var(--fm)">')

with open("templates/group_detail.html", "w") as f:
    f.write(text)
