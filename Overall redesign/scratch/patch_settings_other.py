with open("templates/settings_page.html", "r") as f:
    text = f.read()

other_row = '''  <div class="row" onclick="openModal('otherSettingsModal')"><div class="av" style="background:var(--fill);color:var(--txt2)"><i data-lucide="settings"></i></div><div class="rmain"><div class="rt">Other</div><div class="rs">Advanced systematic settings, online groups</div></div><i data-lucide="chevron-right" style="color:var(--txt3)"></i></div>'''
text = text.replace('</div>\n \n <div class="card"><div class="ct">Finance defaults</div>', other_row + '\n </div>\n \n <div class="card"><div class="ct">Finance defaults</div>')

other_modal = '''
<div class="ovl" id="otherSettingsModal" onclick="if(event.target===this)closeModal('otherSettingsModal')">
  <div class="modal">
    <div class="mt">Other Settings<button class="x" onclick="closeModal('otherSettingsModal')"><i data-lucide="x"></i></button></div>
    <div style="font-size:13px;color:var(--txt3);margin-bottom:16px">Set groups as online or offline.</div>
    <form method="post" action="/settings/set_online">
      <div class="fgroup">
        <label>Select Group</label>
        <select class="form-control" name="group_id" required>
            {% for g in all_groups %}
            <option value="{{ g.id }}">{{ g.name }} (Currently: {{ g.mode or 'in-person' }})</option>
            {% endfor %}
        </select>
      </div>
      <div class="fgroup">
        <label>Mode</label>
        <select class="form-control" name="mode">
            <option value="Online">Online</option>
            <option value="in-person">Offline / In-person</option>
        </select>
      </div>
      <div class="fgroup">
        <label>Zoom Link</label>
        <input type="url" class="form-control" name="zoom_link" placeholder="https://zoom.us/j/123456789">
      </div>
      <button class="btn block" type="submit">Save Changes</button>
    </form>
  </div>
</div>
'''

if 'id="otherSettingsModal"' not in text:
    text = text.replace('{% endblock %}', other_modal + '\n{% endblock %}')

with open("templates/settings_page.html", "w") as f:
    f.write(text)

with open("routers/settings_router.py", "r") as f:
    settings_router = f.read()

import re
# Pass all_groups to settings page
if 'all_groups = db.query(Group)' not in settings_router:
    settings_router = settings_router.replace('def settings_view(request: Request, db: Session = Depends(get_db)):', 'def settings_view(request: Request, db: Session = Depends(get_db)):\n    all_groups = db.query(Group).filter(Group.status == "active").all()')
    settings_router = settings_router.replace('return templates.TemplateResponse("settings_page.html", {', 'return templates.TemplateResponse("settings_page.html", {\n        "all_groups": all_groups,')

endpoint = '''
@router.post("/set_online")
async def set_group_online(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    g = db.query(Group).get(int(form.get("group_id")))
    if g:
        g.mode = form.get("mode", "in-person")
        if form.get("zoom_link"):
            g.zoom_link = form.get("zoom_link")
        db.commit()
    return RedirectResponse("/settings/", status_code=303)
'''
if 'def set_group_online' not in settings_router:
    settings_router += endpoint

with open("routers/settings_router.py", "w") as f:
    f.write(settings_router)

