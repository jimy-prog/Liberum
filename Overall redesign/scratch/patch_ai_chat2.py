with open("templates/library/student_ai_chat.html", "r") as f:
    text = f.read()

import re

# Remove the ugly go back button
text = re.sub(r'<button class="btn ghost sm block" style="margin-bottom:16px;justify-content:flex-start" onclick="window.location=\'/library/\'"><i data-lucide="arrow-left"></i>Go Back</button>', '', text)

# Insert the beautiful go back button inside ai-main
beautiful_back = '''<div style="position:absolute;top:20px;left:70px;z-index:100;">
    <a href="/library" class="btn btn-ghost sm" style="padding: 6px 10px; border-radius: 50%;">
        <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
    </a>
</div>'''

# The hamburger is at top:20px;left:20px;
if '<div style="position:absolute;top:20px;left:70px' not in text:
    text = text.replace('<div class="ai-main">', '<div class="ai-main">\n' + beautiful_back)

with open("templates/library/student_ai_chat.html", "w") as f:
    f.write(text)
