with open("templates/library/student_home.html", "r") as f:
    text = f.read()

import re
# Regex to remove the block that has Margaret Thatcher
text = re.sub(r'<div class="card" style="margin-top:24px.*?Margaret Thatcher.*?</div>\s*</div>\s*</div>', '', text, flags=re.DOTALL)

with open("templates/library/student_home.html", "w") as f:
    f.write(text)
