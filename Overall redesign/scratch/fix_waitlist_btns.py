import re
with open('templates/waitlist.html', 'r') as f:
    text = f.read()

# I want to replace the whole block of ft-btn buttons with just the correct 5.
start_str = '<div style="display:flex; gap:4px; margin-right:12px;">'
end_str = '</div>\n      <button class="btn sm"'

before = text.split(start_str)[0]
after = text.split(end_str)[1]

new_btns = """
        <button class="ft-btn active" onclick="filterWl('all', this)">All</button>
        <button class="ft-btn" onclick="filterWl('new', this)">New Enquiry</button>
        <button class="ft-btn" onclick="filterWl('contacted', this)">Contacted</button>
        <button class="ft-btn" onclick="filterWl('trial', this)">Trial</button>
        <button class="ft-btn" onclick="filterWl('enrolled', this)">Enrolled</button>
      """

with open('templates/waitlist.html', 'w') as f:
    f.write(before + start_str + "\n" + new_btns + end_str + after)
