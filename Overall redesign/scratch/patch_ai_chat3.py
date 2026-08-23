with open("templates/library/student_ai_chat.html", "r") as f:
    text = f.read()

beautiful_back = '''
    <div style="position:absolute;top:20px;left:20px;z-index:100;">
        <a href="/library" class="btn btn-ghost sm" style="padding: 6px 10px; border-radius: 50%;">
            <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </a>
    </div>
'''

if 'beautiful_back' not in text:
    text = text.replace('<div class="ai-wrapper">', '<div class="ai-wrapper">\n' + beautiful_back)

with open("templates/library/student_ai_chat.html", "w") as f:
    f.write(text)
