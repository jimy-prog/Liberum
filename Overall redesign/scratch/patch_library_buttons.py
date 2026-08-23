back_btn = '''
        <div style="display: flex; gap: 12px; align-items: center;">
            <a href="/library" class="btn btn-ghost sm" style="padding: 6px 10px; border-radius: 50%;">
                <svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </a>
            <h1 style="font-family: var(--font-d); font-size: 1.5rem; font-weight: 700;">Universal Grammar</h1>
        </div>
'''

with open("templates/library/student_grammar.html", "r") as f:
    text = f.read()

import re
# Look for <h1 ...>Universal Grammar</h1>
text = re.sub(r'<h1 style="font-family: var\(--font-d\); font-size: 1.5rem; font-weight: 700;">Universal Grammar</h1>', back_btn, text)

with open("templates/library/student_grammar.html", "w") as f:
    f.write(text)
