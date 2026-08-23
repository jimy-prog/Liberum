with open("templates/settings_page.html", "r") as f:
    text = f.read()

modals_to_add = '''
<div class="ovl" id="studioProfileModal" onclick="if(event.target===this)closeModal('studioProfileModal')">
 <div class="modal">
  <div class="mt">Studio Profile<button class="x" onclick="closeModal('studioProfileModal')"><i data-lucide="x"></i></button></div>
  <form method="post" action="/profile/update">
   <div class="fgroup"><label>Studio Name</label><input class="form-control" name="studio_name" value="Liberum English"></div>
   <div class="fgroup"><label>Address</label><input class="form-control" name="address" value="Tashkent, Yunusobod"></div>
   <div class="fgroup"><label>Working Hours</label><input class="form-control" name="hours" value="Mon-Sat, 09:00-19:00"></div>
   <button class="btn block">Save changes</button>
  </form>
 </div>
</div>

<div class="ovl" id="contactModal" onclick="if(event.target===this)closeModal('contactModal')">
 <div class="modal">
  <div class="mt">Contact Details<button class="x" onclick="closeModal('contactModal')"><i data-lucide="x"></i></button></div>
  <form method="post" action="/profile/update">
   <div class="fgroup"><label>Phone Number</label><input class="form-control" name="phone" value="+998 90 123 45 67"></div>
   <div class="fgroup"><label>Telegram Handle</label><input class="form-control" name="telegram" value="@liberum"></div>
   <div class="fgroup"><label>Email Address</label><input class="form-control" name="email" value="{{ _u.username }}"></div>
   <button class="btn block">Save changes</button>
  </form>
 </div>
</div>

<div class="ovl" id="teamModal" onclick="if(event.target===this)closeModal('teamModal')">
 <div class="modal">
  <div class="mt">Roles & Permissions<button class="x" onclick="closeModal('teamModal')"><i data-lucide="x"></i></button></div>
  <div style="margin-top:16px;">
    <div style="padding:16px;background:rgba(235,177,52,0.1);color:#ebb134;border-radius:8px;font-size:13px;margin-bottom:16px;">
        <i data-lucide="alert-circle" style="display:inline-block;vertical-align:middle;margin-right:6px;"></i>
        You are currently on the Solo plan. Upgrade to a Studio plan to invite other teachers.
    </div>
    <div class="row"><div class="rmain"><div class="rt">Add Teachers</div><div class="rs">Give teachers their own login to manage their groups</div></div><button class="btn sm" disabled>Upgrade</button></div>
    <div class="row"><div class="rmain"><div class="rt">Admin Access</div><div class="rs">Invite receptionists or managers</div></div><button class="btn sm" disabled>Upgrade</button></div>
  </div>
 </div>
</div>
'''

if 'id="studioProfileModal"' not in text:
    parts = text.rsplit('{% endblock %}', 1)
    text = parts[0] + modals_to_add + '\n{% endblock %}'
    with open("templates/settings_page.html", "w") as f:
        f.write(text)
