with open("templates/payments.html", "r") as f:
    text = f.read()

text = text.replace('class="modal-overlay"', 'class="ovl"')
text = text.replace('class="modal-header"', 'class="mt"')
text = text.replace('<span class="modal-title" id="recordTitle">Record Payment</span>', '<span id="recordTitle">Record Payment</span>')
text = text.replace('<button class="modal-close" onclick="closeModal(\'recordModal\')">✕</button>', '<button class="x" onclick="document.getElementById(\'recordModal\').classList.remove(\'open\')"><i data-lucide="x"></i></button>')
text = text.replace('onclick="if(event.target===this)closeModal(\'recordModal\')"', 'onclick="if(event.target===this)this.classList.remove(\'open\')"')
text = text.replace('onclick="closeModal(\'recordModal\')"', 'onclick="document.getElementById(\'recordModal\').classList.remove(\'open\')"')

text = text.replace('openModal(\'recordModal\');', 'document.getElementById(\'recordModal\').classList.add(\'open\');')
text = text.replace('pill-green', 'p-green')
text = text.replace('pill-red', 'p-red')
text = text.replace('btn btn-green btn-xs', 'btn sm" style="background:var(--money);color:#fff;"')
text = text.replace('btn btn-ghost btn-xs', 'btn ghost sm')

with open("templates/payments.html", "w") as f:
    f.write(text)
