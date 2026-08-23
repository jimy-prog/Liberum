with open("templates/lesson_detail.html", "r") as f:
    text = f.read()

import re
old_back = r'''<button class="btn ghost sm" onclick="window\.location='/lessons/'"><i data-lucide="arrow-left"></i>Back to Lessons</button>'''
new_back = '''<button class="btn ghost sm" onclick="window.history.back()"><i data-lucide="arrow-left"></i>Go Back</button>'''

text = re.sub(old_back, new_back, text)
with open("templates/lesson_detail.html", "w") as f:
    f.write(text)
