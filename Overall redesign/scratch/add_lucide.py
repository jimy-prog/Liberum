with open('templates/base.html', 'r', encoding='utf-8') as f:
    html = f.read()

lucide_css = "\n.lucide{width:18px;height:18px;stroke-width:2;flex:none}\n"
if ".lucide{" not in html:
    html = html.replace('.ni.on::before', lucide_css + '.ni.on::before')

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(html)
