with open("templates/base.html", "r") as f:
    text = f.read()

# Change href to "#" and add "SOON" badge
# Original: <a href="/reviews/inbox" class="ni {% if main_section=='mock' %}on{% endif %}"><i data-lucide="target"></i><span>Mock Tests</span></a>
# New: <a href="#" onclick="return false;" class="ni" style="opacity:0.6; cursor:not-allowed;"><i data-lucide="target"></i><span>Mock Tests</span><span class="pill p-acc" style="font-size:8px;padding:2px 6px;margin-left:auto;">SOON</span></a>

import re
text = re.sub(r'<a href="/reviews/inbox" class="ni.*?"><i data-lucide="target"></i><span>Mock Tests</span></a>', 
              r'<a href="#" onclick="return false;" class="ni" style="opacity:0.6; cursor:not-allowed;"><i data-lucide="target"></i><span>Mock Tests</span><span class="pill p-acc" style="font-size:8px;padding:2px 6px;margin-left:auto;">SOON</span></a>', text)

text = re.sub(r'<a href="/mock/history" class="ni.*?"><i data-lucide="target"></i><span>Mock Tests</span></a>', 
              r'<a href="#" onclick="return false;" class="ni" style="opacity:0.6; cursor:not-allowed;"><i data-lucide="target"></i><span>Mock Tests</span><span class="pill p-acc" style="font-size:8px;padding:2px 6px;margin-left:auto;">SOON</span></a>', text)

with open("templates/base.html", "w") as f:
    f.write(text)
