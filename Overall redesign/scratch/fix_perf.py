with open('templates/performance.html', 'r', encoding='utf-8') as f:
    text = f.read()

# find the second occurrence of <div class="segs"> ... </div> and remove it.
import re
# The first segs block is from <div class="segs"> to </div>
blocks = re.findall(r'<div class="segs">.*?</div>', text, flags=re.DOTALL)
if len(blocks) > 1:
    text = text.replace(blocks[1], "", 1)

with open('templates/performance.html', 'w', encoding='utf-8') as f:
    f.write(text)
