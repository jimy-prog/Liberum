import glob

files = ["templates/students.html", "templates/groups.html", "templates/waitlist.html", "templates/performance.html", "templates/placement.html", "templates/archive.html"]

segs_html = """
<div class="segs">
  <button class="{st_on}" onclick="window.location='/students/'">Students</button>
  <button class="{gr_on}" onclick="window.location='/groups/'">Groups</button>
  <button class="{wa_on}" onclick="window.location='/waitlist/'">Waitlist</button>
  <button class="{pe_on}" onclick="window.location='/performance/'">Performance</button>
  <button class="{pl_on}" onclick="window.location='/placement/'">Placement tests</button>
  <button class="{ar_on}" onclick="window.location='/archive/'">Archive</button>
</div>
"""

for file in files:
    try:
        with open(file, "r") as f:
            text = f.read()

        # Remove old segs
        if '<div class="segs">' in text:
            start = text.find('<div class="segs">')
            end = text.find('</div>', start) + 6
            text = text[:start] + text[end:]

        st_on = "on" if "students.html" in file else ""
        gr_on = "on" if "groups.html" in file else ""
        wa_on = "on" if "waitlist.html" in file else ""
        pe_on = "on" if "performance.html" in file else ""
        pl_on = "on" if "placement.html" in file else ""
        ar_on = "on" if "archive.html" in file else ""

        segs = segs_html.format(st_on=st_on, gr_on=gr_on, wa_on=wa_on, pe_on=pe_on, pl_on=pl_on, ar_on=ar_on)

        text = text.replace('{% block content %}', '{% block content %}\n' + segs)

        if "archive.html" in file:
            # Map CSS vars
            text = text.replace('var(--bg2)', 'var(--card)')
            text = text.replace('var(--bg3)', 'var(--fill)')
            text = text.replace('var(--border)', 'var(--line)')
            text = text.replace('var(--text2)', 'var(--txt2)')
            text = text.replace('var(--text3)', 'var(--txt3)')
            text = text.replace('var(--text)', 'var(--txt)')
            text = text.replace('var(--radius)', '16px')
            text = text.replace('pill-grey', 'p-grey')
            text = text.replace('pill-green', 'p-green')
            text = text.replace('pill-red', 'p-red')
            text = text.replace('pill-blue', 'p-acc')
            text = text.replace('btn btn-ghost btn-sm', 'btn sm ghost')
            text = text.replace('btn btn-primary btn-sm', 'btn sm block')
            text = text.replace('btn-primary', 'block')

        with open(file, "w") as f:
            f.write(text)
    except Exception as e:
        print(f"Error {file}: {e}")
