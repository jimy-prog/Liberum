with open("templates/settings_page.html", "r") as f:
    text = f.read()

import re
old_pw = '''<div class="ovl" id="changePasswordModal" onclick="if(event.target===this)closeModal('changePasswordModal')">
  <div class="modal">
    <div class="mt">Change Password<button class="x" onclick="closeModal('changePasswordModal')"><i data-lucide="x"></i></button></div>
    <form method="post" action="/settings/password">
      <div class="fgroup"><label>New Password</label><input type="password" class="form-control" name="password" required minlength="6"></div>
      <button class="btn block">Update Password</button>
    </form>
  </div>
</div>'''

new_pw = '''<div class="ovl" id="changePasswordModal" onclick="if(event.target===this)closeModal('changePasswordModal')">
  <div class="modal">
    <div class="mt">Change Password<button class="x" onclick="closeModal('changePasswordModal')"><i data-lucide="x"></i></button></div>
    <form method="post" action="/settings/password">
      <div class="fgroup"><label>Old Password</label><input type="password" class="form-control" name="old_password" required></div>
      <div class="fgroup"><label>New Password</label><input type="password" class="form-control" name="password" required minlength="6"></div>
      <button class="btn block">Update Password</button>
    </form>
  </div>
</div>'''

text = text.replace(old_pw, new_pw)
with open("templates/settings_page.html", "w") as f:
    f.write(text)
