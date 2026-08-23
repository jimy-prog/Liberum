with open("templates/library/student_grammar.html", "r") as f:
    text = f.read()

import re

# In the other places I used:
beautiful_back = '<a href="/library" class="btn btn-ghost sm" style="padding: 6px 10px; border-radius: 50%; margin-right: 12px;"><svg style="width:16px;height:16px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg></a>'

text = re.sub(r'<a href="/library" class="btn sm" style="background: var\(--fill\); margin-right: 12px;">.*?</a>', beautiful_back, text)

with open("templates/library/student_grammar.html", "w") as f:
    f.write(text)
