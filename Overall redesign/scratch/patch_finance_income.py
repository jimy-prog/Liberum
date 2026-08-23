with open("templates/finance.html", "r") as f:
    text = f.read()

import re
text = re.sub(r'total_income', 'active_income', text)

with open("templates/finance.html", "w") as f:
    f.write(text)
