with open("templates/group_detail.html", "r") as f:
    text = f.read()

# Add a few UI polished things
polished_html = '''
    <div style="display:flex;gap:8px;margin-top:16px;border-top:1px dashed var(--line);padding-top:16px">
        <button class="btn ghost block" onclick="alert('Message feature coming soon!')"><i data-lucide="message-circle"></i>Message All</button>
        <button class="btn ghost block" style="color:var(--red)" onclick="if(confirm('Archive this group?')) alert('Archiving logic goes here')"><i data-lucide="archive"></i>Archive</button>
    </div>
'''

if "Message All" not in text:
    text = text.replace('<!-- Info -->', '<!-- Info -->')
    # find where to inject
    # after the group details
    # I'll inject into the "Group Details" card
    text = text.replace('{% endif %}\n      </div>\n    </div>', '{% endif %}\n      </div>\n' + polished_html + '\n    </div>')

with open("templates/group_detail.html", "w") as f:
    f.write(text)
