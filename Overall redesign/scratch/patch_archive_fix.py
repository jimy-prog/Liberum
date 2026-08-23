import glob

files = ["templates/placement_dashboard.html"]

segs_html = """
<div class="segs">
  <button class="" onclick="window.location='/students/'">Students</button>
  <button class="" onclick="window.location='/groups/'">Groups</button>
  <button class="" onclick="window.location='/waitlist/'">Waitlist</button>
  <button class="" onclick="window.location='/performance/'">Performance</button>
  <button class="on" onclick="window.location='/placement/'">Placement tests</button>
  <button class="" onclick="window.location='/archive/'">Archive</button>
</div>
"""

for file in files:
    try:
        with open(file, "r") as f:
            text = f.read()

        if '<div class="segs">' in text:
            start = text.find('<div class="segs">')
            end = text.find('</div>', start) + 6
            text = text[:start] + text[end:]

        text = text.replace('{% block content %}', '{% block content %}\n' + segs_html)

        with open(file, "w") as f:
            f.write(text)
    except Exception as e:
        print(f"Error {file}: {e}")
