import re

with open('templates/teacher_classes.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove the "Public waitlist link" card
text = re.sub(r'<div class="card" style="background:var\(--accbg\);box-shadow:none">.*?</div>\n</div>', '', text, flags=re.DOTALL)

with open('templates/teacher_classes.html', 'w', encoding='utf-8') as f:
    f.write(text)
