with open("routers/performance.py", "r") as f:
    text = f.read()

import re
old_save = '''    if p.field not in ("grammar","activity","vocabulary"):
        return {"ok":False}'''

new_save = '''    if p.field not in ("grammar","activity","vocabulary","homework"):
        return {"ok":False}'''

text = text.replace(old_save, new_save)

with open("routers/performance.py", "w") as f:
    f.write(text)
