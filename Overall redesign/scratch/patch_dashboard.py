with open("templates/dashboard.html", "r") as f:
    text = f.read()

import re
text = re.sub(r'\{% else %\}\s*<div class="row".*?MK.*?</div>\s*\{% endif %\}', '{% else %}<div class="row" style="text-align:center;padding:24px;color:var(--txt3);justify-content:center;font-size:13px;">Nothing needs attention</div>{% endif %}', text, flags=re.DOTALL)

with open("templates/dashboard.html", "w") as f:
    f.write(text)

with open("templates/support.html", "r") as f:
    text = f.read()
text = text.replace('fa-solid fa-envelope', 'lucide="mail"')
text = text.replace('fa-solid fa-paper-plane', 'lucide="send"')
text = text.replace('fa-solid fa-handshake', 'lucide="handshake"')
text = text.replace('fa-solid fa-file-pdf', 'lucide="file-text"')
text = text.replace('fa-solid fa-comments', 'lucide="message-square"')
text = text.replace('fa-solid fa-play', 'lucide="play"')
text = text.replace('<i class="lucide=', '<i data-lucide=')
with open("templates/support.html", "w") as f:
    f.write(text)
