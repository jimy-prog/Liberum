with open("templates/online.html", "r") as f:
    text = f.read()

# Replace the fake table with the proper card structure
old_table = '''<table class="table">
    <thead>
      <tr>
        <th>Group</th>
        <th>Students</th>
        <th>Schedule</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-weight:600">IELTS Speaking (Zoom)</td>
        <td>12</td>
        <td>Tue, Thu 18:00</td>
        <td><button class="btn sm ghost"><i data-lucide="video"></i>Join</button></td>
      </tr>
      <tr>
        <td style="font-weight:600">Grammar Online</td>
        <td>6</td>
        <td>Mon, Wed 20:00</td>
        <td><button class="btn sm ghost"><i data-lucide="video"></i>Join</button></td>
      </tr>
    </tbody>
  </table>'''

new_structure = '''
  <div class="row" style="cursor:pointer" onclick="window.location='/groups/1'">
    <div class="av" style="background:var(--accbg);color:var(--acc)"><i data-lucide="monitor"></i></div>
    <div class="rmain">
      <div class="rt">IELTS Speaking <span class="pill p-green" style="margin-left:6px">Online</span></div>
      <div class="rs">Tue, Thu 18:00 · Zoom</div>
    </div>
    <span style="font-family:var(--fm);font-size:13px;color:var(--txt2)">12 students</span>
    <button class="btn sm ghost" style="margin-left:12px;z-index:2" onclick="event.stopPropagation(); window.open('https://zoom.us')"><i data-lucide="video"></i>Join</button>
  </div>
  <div class="row" style="cursor:pointer" onclick="window.location='/groups/2'">
    <div class="av" style="background:var(--accbg);color:var(--acc)"><i data-lucide="monitor"></i></div>
    <div class="rmain">
      <div class="rt">Grammar Online <span class="pill p-green" style="margin-left:6px">Online</span></div>
      <div class="rs">Mon, Wed 20:00 · Zoom</div>
    </div>
    <span style="font-family:var(--fm);font-size:13px;color:var(--txt2)">6 students</span>
    <button class="btn sm ghost" style="margin-left:12px;z-index:2" onclick="event.stopPropagation(); window.open('https://zoom.us')"><i data-lucide="video"></i>Join</button>
  </div>
'''

text = text.replace(old_table, new_structure)
with open("templates/online.html", "w") as f:
    f.write(text)
