with open("templates/finance.html", "r") as f:
    text = f.read()

expense_modal = '''
<div class="ovl" id="addExpenseModal" onclick="if(event.target===this)closeModal('addExpenseModal')">
 <div class="modal">
  <div class="mt">Add Expense<button class="x" onclick="closeModal('addExpenseModal')"><i data-lucide="x"></i></button></div>
  <form method="post" action="/finance/expense">
   <div class="fgroup">
    <label>Amount (UZS)</label>
    <input type="number" class="form-control" name="amount" required placeholder="e.g. 500000">
   </div>
   <div class="fgroup">
    <label>Description</label>
    <input type="text" class="form-control" name="description" required placeholder="e.g. Zoom subscription">
   </div>
   <div class="fgroup">
    <label>Date</label>
    <input type="date" class="form-control" name="date_str">
   </div>
   <button type="submit" class="btn block">Save Expense</button>
  </form>
 </div>
</div>
'''

if 'id="addExpenseModal"' not in text:
    text = text.replace('{% endblock %}', expense_modal + '\n{% endblock %}')
    with open("templates/finance.html", "w") as f:
        f.write(text)
