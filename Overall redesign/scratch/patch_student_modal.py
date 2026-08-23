with open("templates/student_detail_modal.html", "r") as f:
    text = f.read()

import re
old_wrapper = '<div class="modal" id="studentDetailModal" style="display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);">'
new_wrapper = '<div class="ovl open" id="studentDetailModal" style="display:flex;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);" onclick="if(event.target===this)this.remove()">'

old_box = '<div class="modal-box"'
new_box = '<div class="modal"'

text = text.replace(old_wrapper, new_wrapper)
text = text.replace(old_box, new_box)

with open("templates/student_detail_modal.html", "w") as f:
    f.write(text)
