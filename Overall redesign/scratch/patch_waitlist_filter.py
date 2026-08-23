with open("templates/waitlist.html", "r") as f:
    text = f.read()

# I need to add an id to the rows, or just dataset.
text = text.replace('<div class="wl-row wl-grid">', '<div class="wl-row wl-grid" data-status="{{ w.status }}">')

# And I need to add onclick to the filter buttons
filter_buttons = """
        <button class="ft-btn active" onclick="filterWl('all', this)">All</button>
        <button class="ft-btn" onclick="filterWl('new', this)">New Enquiry</button>
        <button class="ft-btn" onclick="filterWl('contacted', this)">Contacted</button>
        <button class="ft-btn" onclick="filterWl('trial', this)">Trial</button>
        <button class="ft-btn" onclick="filterWl('enrolled', this)">Enrolled</button>
"""

import re
text = re.sub(r'<button class="ft-btn active">All</button>.*?</button>', filter_buttons.strip(), text, flags=re.DOTALL)

# And add the JS function
js = """
function filterWl(status, btn) {
  document.querySelectorAll('.ft-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const rows = document.querySelectorAll('.wl-row');
  let count = 0;
  rows.forEach(r => {
    if (status === 'all' || r.dataset.status === status) {
      r.style.display = 'grid'; // match css grid
      count++;
    } else {
      r.style.display = 'none';
    }
  });
  document.getElementById('wl-count').innerText = count;
}
"""
text = text.replace("ALL ENQUIRIES ({{ entries|length }})", 'ALL ENQUIRIES (<span id="wl-count">{{ entries|length }}</span>)')
text = text.replace("</script>", js + "\n</script>")

with open("templates/waitlist.html", "w") as f:
    f.write(text)
