with open('templates/base.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the quick add button onclick
text = text.replace("onclick=\"toast('Quick add action', 'plus')\"", "onclick=\"document.getElementById('quickAddModal').classList.add('open')\"")

# Add the quickAddModal before </body>
modal = """
<!-- Quick Add Modal -->
<div class="ovl" id="quickAddModal" onclick="if(event.target===this)document.getElementById('quickAddModal').classList.remove('open')">
  <div class="modal" style="max-width:320px;padding:24px">
    <div class="mt">Quick Add<button type="button" class="x" onclick="document.getElementById('quickAddModal').classList.remove('open')"><i data-lucide="x"></i></button></div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px">
      <button class="btn ghost block" style="justify-content:flex-start;padding:12px;font-size:15px;color:var(--txt)" onclick="window.location='/classes/add'">
        <div class="av" style="background:var(--accbg);color:var(--acc2);margin-right:12px;width:34px;height:34px;border-radius:10px"><i data-lucide="clock"></i></div>
        New Lesson
      </button>
      <button class="btn ghost block" style="justify-content:flex-start;padding:12px;font-size:15px;color:var(--txt)" onclick="window.location='/students/add'">
        <div class="av" style="background:rgba(48,209,88,.12);color:var(--greenD);margin-right:12px;width:34px;height:34px;border-radius:10px"><i data-lucide="user-plus"></i></div>
        New Student
      </button>
      <button class="btn ghost block" style="justify-content:flex-start;padding:12px;font-size:15px;color:var(--txt)" onclick="window.location='/payments/'">
        <div class="av" style="background:rgba(30,158,74,.12);color:var(--money);margin-right:12px;width:34px;height:34px;border-radius:10px"><i data-lucide="banknote"></i></div>
        Record Payment
      </button>
    </div>
  </div>
</div>
"""
if 'id="quickAddModal"' not in text:
    text = text.replace('</body>', modal + '\n</body>')

with open('templates/base.html', 'w', encoding='utf-8') as f:
    f.write(text)
