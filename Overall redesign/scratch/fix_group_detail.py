with open('templates/group_detail.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
# We have duplicate extends. Let's just find the SECOND {% extends "base.html" %} and keep everything from there.
parts = text.split('{% extends "base.html" %}')
if len(parts) >= 3:
    fixed = '{% extends "base.html" %}' + parts[-1]
    with open('templates/group_detail.html', 'w', encoding='utf-8') as f:
        f.write(fixed)
