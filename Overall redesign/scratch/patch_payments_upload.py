with open("templates/payments.html", "r") as f:
    text = f.read()

old_upload = '''<div style="border:1px dashed var(--line);border-radius:8px;padding:20px;text-align:center;color:var(--txt3);cursor:pointer">
          <i data-lucide="upload-cloud" style="margin-bottom:8px"></i><br>
          Click to upload receipt
        </div>'''

new_upload = '''<label style="display:block;border:1px dashed var(--line);border-radius:8px;padding:20px;text-align:center;color:var(--txt3);cursor:pointer;background:var(--bg)">
          <i data-lucide="upload-cloud" style="margin-bottom:8px"></i><br>
          <span id="vpUploadText">Click to upload receipt</span>
          <input type="file" style="display:none" onchange="document.getElementById('vpUploadText').innerText = this.files[0].name">
        </label>'''

text = text.replace(old_upload, new_upload)

with open("templates/payments.html", "w") as f:
    f.write(text)
