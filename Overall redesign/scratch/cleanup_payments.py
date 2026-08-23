with open("templates/payments.html", "r") as f:
    text = f.read()

import re

# Remove all injected viewPaymentModal definitions
text = re.sub(r'<div class="ovl" id="viewPaymentModal".*?</script>', '', text, flags=re.DOTALL)

# Re-inject it ONCE at the end of the file
payment_modal = '''
<div class="ovl" id="viewPaymentModal" onclick="if(event.target===this)this.classList.remove('open')">
  <div class="modal">
    <div class="mt">
      Payment Details
      <button class="x" onclick="document.getElementById('viewPaymentModal').classList.remove('open')"><i data-lucide="x"></i></button>
    </div>
    <div style="margin-top:16px">
      <div style="font-size:24px;font-weight:700;margin-bottom:4px" id="vpAmount"></div>
      <div style="color:var(--txt2);font-size:13px;margin-bottom:16px" id="vpStudent"></div>
      
      <div class="frow">
        <div class="fgroup">
            <label>Method</label>
            <select id="vpMethod" class="form-control" style="font-size:14px;font-weight:500;">
                <option>Cash</option>
                <option>Card</option>
                <option>Transfer</option>
            </select>
        </div>
        <div class="fgroup">
            <label>Month</label>
            <input type="month" id="vpMonth" class="form-control" style="font-size:14px;font-weight:500;">
        </div>
      </div>
      
      <div class="fgroup" style="margin-top:16px">
        <label>Teacher Notes (Optional)</label>
        <textarea class="form-control" placeholder="Add a note about this payment..."></textarea>
      </div>
      
      <div class="fgroup">
        <label>Check Image / Receipt</label>
        <label style="display:block;border:1px dashed var(--line);border-radius:8px;padding:20px;text-align:center;color:var(--txt3);cursor:pointer;background:var(--bg)">
          <i data-lucide="upload-cloud" style="margin-bottom:8px"></i><br>
          <span id="vpUploadText">Click to upload receipt</span>
          <input type="file" style="display:none" onchange="document.getElementById('vpUploadText').innerText = this.files[0].name">
        </label>
      </div>
      
      <button class="btn block" style="margin-top:16px" onclick="document.getElementById('viewPaymentModal').classList.remove('open')">Save Updates</button>
    </div>
  </div>
</div>
<script>
function viewPayment(student, amount, method, month) {
    let m = document.getElementById('viewPaymentModal');
    if(m.parentNode !== document.body) document.body.appendChild(m);
    document.getElementById('vpStudent').innerText = student;
    document.getElementById('vpAmount').innerText = new Intl.NumberFormat().format(amount) + ' UZS';
    
    // Set method and month
    let methodSelect = document.getElementById('vpMethod');
    if ([...methodSelect.options].some(o => o.value === method)) {
        methodSelect.value = method;
    }
    document.getElementById('vpMonth').value = month;
    
    m.style.zIndex = '99999';
    m.classList.add('open');
}
</script>
'''

text = text + '\n' + payment_modal

with open("templates/payments.html", "w") as f:
    f.write(text)
