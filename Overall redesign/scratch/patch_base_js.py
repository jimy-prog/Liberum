with open('templates/base.html', 'r', encoding='utf-8') as f:
    text = f.read()

js_func = """
<script>
async function openAddLessonModal() {
  const res = await fetch('/groups/api/list');
  const groups = await res.json();
  let opts = groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
  
  const today = new Date().toISOString().split('T')[0];
  
  const html = `
    <div class="mt">Add lesson<button type="button" class="x" onclick="document.getElementById('dynamicModal').classList.remove('open')"><i data-lucide="x"></i></button></div>
    <form action="/lessons/add" method="POST" style="margin-top:16px">
      <div class="fgroup">
        <label>Group</label>
        <select name="group_id" required>${opts}</select>
      </div>
      <div class="frow">
        <div class="fgroup"><label>Date</label><input type="date" name="date_str" value="${today}" required></div>
        <div class="fgroup"><label>Time</label><input type="time" name="time" value="14:00" required></div>
      </div>
      <div class="fgroup">
        <label>Status</label>
        <select name="status">
          <option value="Held">Held / Scheduled</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <button type="submit" class="btn block" style="margin-top:16px">Add Lesson</button>
    </form>
  `;
  
  let mod = document.getElementById('dynamicModal');
  if (!mod) {
    mod = document.createElement('div');
    mod.id = 'dynamicModal';
    mod.className = 'ovl';
    mod.innerHTML = `<div class="modal" style="max-width:360px;padding:24px" id="dynamicModalContent"></div>`;
    document.body.appendChild(mod);
  }
  document.getElementById('dynamicModalContent').innerHTML = html;
  lucide.createIcons();
  mod.classList.add('open');
}
</script>
</body>
"""

text = text.replace('</body>', js_func)

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(text)
