with open("templates/payments.html", "r") as f:
    text = f.read()

# Make the paid row clickable
old_paid_row = '''{% if r.status == 'paid' %}
        <span style="font-family:var(--fm);font-size:12px;color:var(--txt2)">{{ r.payment.method if r.payment else 'Cash' }}</span>
        <span class="pill p-green">{{ "{:,.0f}".format(r.paid|int) }} UZS</span>
      {% else %}'''

new_paid_row = '''{% if r.status == 'paid' %}
        <span style="font-family:var(--fm);font-size:12px;color:var(--txt2)">{{ r.payment.method if r.payment else 'Cash' }}</span>
        <span class="pill p-green">{{ "{:,.0f}".format(r.paid|int) }} UZS</span>
        <button class="btn ghost sm" style="margin-left:8px" onclick="viewPayment('{{ r.student.name }}', {{ r.paid|int }}, '{{ r.payment.method if r.payment else 'Cash' }}', '{{ month_str }}')">Details</button>
      {% else %}'''

text = text.replace(old_paid_row, new_paid_row)

# Add View Payment Modal
view_modal = '''
<!-- View Payment Modal -->
<div class="ovl" id="viewPaymentModal" onclick="if(event.target===this)closeModal('viewPaymentModal')">
  <div class="modal">
    <div class="mt">
      Payment Details
      <button class="x" onclick="closeModal('viewPaymentModal')"><i data-lucide="x"></i></button>
    </div>
    <div style="margin-top:16px">
      <div style="font-size:24px;font-weight:700;margin-bottom:4px" id="vpAmount"></div>
      <div style="color:var(--txt2);font-size:13px;margin-bottom:16px" id="vpStudent"></div>
      
      <div class="frow">
        <div class="fgroup"><label>Method</label><div id="vpMethod" style="padding:10px;background:var(--fill);border-radius:6px;font-weight:500"></div></div>
        <div class="fgroup"><label>Month</label><div id="vpMonth" style="padding:10px;background:var(--fill);border-radius:6px;font-weight:500"></div></div>
      </div>
      
      <div class="fgroup" style="margin-top:16px">
        <label>Teacher Notes (Optional)</label>
        <textarea class="form-control" placeholder="Add a note about this payment..."></textarea>
      </div>
      
      <div class="fgroup">
        <label>Check Image / Receipt</label>
        <div style="border:1px dashed var(--line);border-radius:8px;padding:20px;text-align:center;color:var(--txt3);cursor:pointer">
          <i data-lucide="upload-cloud" style="margin-bottom:8px"></i><br>
          Click to upload receipt
        </div>
      </div>
      
      <button class="btn block" style="margin-top:16px" onclick="closeModal('viewPaymentModal')">Save Updates</button>
    </div>
  </div>
</div>
<script>
function viewPayment(student, amount, method, month) {
    document.getElementById('vpStudent').innerText = student;
    document.getElementById('vpAmount').innerText = new Intl.NumberFormat().format(amount) + ' UZS';
    document.getElementById('vpMethod').innerText = method;
    document.getElementById('vpMonth').innerText = month;
    document.getElementById('viewPaymentModal').classList.add('open');
}
</script>
'''

if 'viewPaymentModal' not in text:
    text = text.replace('{% endblock %}', view_modal + '\n{% endblock %}')

with open("templates/payments.html", "w") as f:
    f.write(text)
