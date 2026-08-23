with open("templates/base.html", "r") as f:
    text = f.read()

styles = """
/* Legacy modal support */
.modal-overlay { display: none; position:fixed; inset:0; background:rgba(0,0,0,.32); backdrop-filter:blur(6px); z-index:100; align-items:center; justify-content:center; padding:20px; }
.modal-overlay.open, .modal-overlay.active { display:flex; animation: fadein .2s ease; }
.modal-overlay .modal { width:100%; max-width:460px; max-height:88vh; background:var(--card); border-radius:22px; padding:26px; overflow-y:auto; box-shadow:0 24px 80px -20px rgba(0,0,0,.35); animation: pop .28s cubic-bezier(.2,.9,.3,1.1); }
.modal-overlay .modal-header { font-family:var(--fd); font-size:19px; font-weight:600; display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
.modal-overlay .modal-close { width:30px; height:30px; border-radius:50%; background:var(--fill); display:flex; align-items:center; justify-content:center; color:var(--txt2); cursor:pointer; border:none; }
"""

if "/* Legacy modal support */" not in text:
    text = text.replace('/* modal */', styles + '\n/* modal */')

script_old = "function openModal(html){$('#modal').innerHTML=html;$('#ovl').classList.add('open');lucide.createIcons()}"
script_new = """function openModal(htmlOrId){
  const el = document.getElementById(htmlOrId);
  if(el && (el.classList.contains('modal-overlay') || el.classList.contains('ovl'))) {
    el.classList.add('open');
    el.classList.add('active');
  } else {
    $('#modal').innerHTML=htmlOrId;
    $('#ovl').classList.add('open');
    lucide.createIcons();
  }
}"""
text = text.replace(script_old, script_new)

script_close_old = "function closeModal(){$('#ovl').classList.remove('open')}"
script_close_new = """function closeModal(id){
  if(id) {
    const el = document.getElementById(id);
    if(el) { el.classList.remove('open'); el.classList.remove('active'); }
  } else {
    $('#ovl').classList.remove('open');
  }
}"""
text = text.replace(script_close_old, script_close_new)

with open("templates/base.html", "w") as f:
    f.write(text)
