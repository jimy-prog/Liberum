with open("templates/library/student_ai_chat.html", "r") as f:
    text = f.read()

import re

# Add button to toggle sidebar
toggle_btn = '''
    <div style="position:absolute;top:20px;left:64px;z-index:100;">
        <button class="btn btn-ghost sm" onclick="document.querySelector('.ai-sidebar').style.display = document.querySelector('.ai-sidebar').style.display === 'none' ? 'flex' : 'none';" style="padding: 6px 10px; border-radius: 8px;">
            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
    </div>
'''

if 'onclick="document.querySelector' not in text:
    text = text.replace('<!-- Chat History', toggle_btn + '\n        <!-- Chat History')

with open("templates/library/student_ai_chat.html", "w") as f:
    f.write(text)
