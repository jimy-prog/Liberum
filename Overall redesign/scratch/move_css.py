import re

with open('templates/base.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_classes = """
.side{width:250px;flex:none;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;padding:22px 14px 14px;border-right:1px solid var(--line);background:var(--bg);z-index:40}
.side a{text-decoration:none !important; color:inherit}
.brand{font-family:var(--fd);font-weight:700;font-size:23px;letter-spacing:-.03em;padding:0 12px;display:flex;align-items:center;gap:10px;margin-bottom:20px}
.brand span{color:var(--acc)}
.brand .dotl{width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,var(--acc),var(--acc2));display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px}
.navlbl{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--txt3);padding:14px 12px 6px;margin-top:8px}
.ni{display:flex;align-items:center;gap:11px;padding:9.5px 12px;border-radius:12px;font-size:14px;font-weight:500;color:var(--txt2);margin-bottom:2px;transition:.18s;width:100%;text-align:left;position:relative; text-decoration:none}
.ni:hover{background:var(--fill);color:var(--txt)}
.ni.on{background:var(--card);color:var(--txt);font-weight:600;box-shadow:var(--shadow)}
.ni.on::before{content:'';position:absolute;left:-14px;top:20%;bottom:20%;width:3.5px;border-radius:2px;background:var(--acc)}
.sp{flex:1}
.ucard{display:flex;align-items:center;gap:10px;background:var(--card);border-radius:14px;padding:10px 12px;box-shadow:var(--shadow);margin-top:10px}
.ucard .nm{font-size:13px;font-weight:600; color:var(--txt)}
.ucard .rl{font-size:11px;color:var(--txt2)}
.ucard .av{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;font-family:var(--fd)}
"""

# Remove old new_classes from the bottom of style
html = html.replace(new_classes, '')

# Insert it right after :root block
# Find end of :root
root_end = html.find('}\n\n\nbody.dark {')
if root_end == -1:
    root_end = html.find('}\n\nbody.dark')

if root_end != -1:
    root_end = html.find('}', root_end) + 1
    html = html[:root_end] + "\n" + new_classes + html[root_end:]

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(html)
