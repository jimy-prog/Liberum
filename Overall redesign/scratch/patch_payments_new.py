html_content = """{% extends "base.html" %}
{% block title %}Payments
<a href="/monthly-report/" class="btn block" style="position:fixed;bottom:24px;right:24px;box-shadow:0 8px 24px rgba(0,0,0,0.2);z-index:100;border-radius:99px;"><i data-lucide="file-text"></i> Monthly Report</a>
{% endblock %}
{% block page_title %}Payments{% endblock %}
{% block topbar_actions %}
<div style="display:flex;gap:8px;align-items:center">
  <input class="form-control" type="month" value="{{ month_str }}" onchange="window.location='/payments/?month='+this.value" style="width:150px;padding:5px 10px">
  <form method="post" action="/payments/all-paid" style="display:inline">
    <input type="hidden" name="month" value="{{ month_str }}">
    <button type="submit" class="btn sm" style="background:var(--money);color:#fff;" onclick="return confirm('Mark ALL students as paid for {{ month_str }}?')">✓ All Paid</button>
  </form>
</div>
{% endblock %}

{% block content %}
<div class="segs">
  <button class="on" onclick="window.location='/payments/'">Payments</button>
  <button class="" onclick="window.location='/finance/'">Finance</button>
</div>

<div class="stats">
   <div class="stat"><div class="v money">{{ "{:,.0f}".format(collected) }}</div><div class="l">Collected · {{ month_str }}</div></div>
   <div class="stat"><div class="v" style="color:var(--red)">{{ "{:,.0f}".format(outstanding) }}</div><div class="l">Outstanding</div></div>
   <div class="stat"><div class="v">{{ paid_count }}<span style="font-size:15px;color:var(--txt3)">/{{ paid_count + unpaid_count }}</span></div><div class="l">Students paid</div></div>
</div>

<div class="card">
  <div class="ct">Payments <button class="btn sm" onclick="openRecord('','',400000,'{{ month_str }}')"><i data-lucide="plus"></i>Record payment</button></div>
  <div id="payList">
    {% for r in rows %}
    <div class="row">
      <div class="av" style="background:var(--accbg);color:var(--acc)">{{ r.student.name[0] }}</div>
      <div class="rmain">
        <div class="rt">{{ r.student.name }}</div>
        <div class="rs">{{ r.group.name }} · expected {{ "{:,.0f}".format(r.expected|int) }} UZS</div>
      </div>
      {% if r.status == 'paid' %}
        <span style="font-family:var(--fm);font-size:12px;color:var(--txt2)">{{ r.payment.method if r.payment else 'Cash' }}</span>
        <span class="pill p-green">{{ "{:,.0f}".format(r.paid|int) }} UZS</span>
      {% else %}
        <span class="pill p-red">Unpaid</span>
        <button class="btn soft sm" onclick="openRecord({{ r.student.id }},'{{ r.student.name }}',{{ r.expected|int }},'{{ month_str }}')">Record</button>
      {% endif %}
    </div>
    {% endfor %}
    {% if not rows %}
    <div style="padding:24px;text-align:center;color:var(--txt3);font-size:13px">No active students this month</div>
    {% endif %}
  </div>
</div>

<!-- Record Payment Modal -->
<div class="ovl" id="recordModal" onclick="if(event.target===this)closeModal('recordModal')">
  <div class="modal">
    <div class="mt">
      <span id="recordTitle">Record Payment</span>
      <button class="x" onclick="closeModal('recordModal')"><i data-lucide="x"></i></button>
    </div>
    <form method="post" id="recordForm" action="/payments/record/">
      <input type="hidden" name="month" id="recordMonth">
      <div class="fgroup">
        <label>Student</label>
        <select class="form-control" name="student_id" id="recordStudent">
          {% for r in rows %}
          <option value="{{ r.student.id }}">{{ r.student.name }}</option>
          {% endfor %}
        </select>
      </div>
      <div class="frow">
        <div class="fgroup">
          <label>Amount (UZS)</label>
          <input class="form-control" type="number" name="amount" id="recordAmount" step="10000">
        </div>
        <div class="fgroup">
          <label>Method</label>
          <select class="form-control" name="method">
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Transfer">Bank Transfer</option>
            <option value="Online">Online</option>
          </select>
        </div>
      </div>
      <div class="fgroup">
        <label>Notes (optional)</label>
        <input class="form-control" name="notes" placeholder="Reference number, etc.">
      </div>
      <button type="submit" class="btn block">Save payment</button>
    </form>
  </div>
</div>
{% endblock %}

{% block scripts %}
<script>
function openRecord(sid, name, amount, month) {
  if (name) {
    document.getElementById('recordTitle').textContent = `Record Payment — ${name}`;
    let select = document.getElementById('recordStudent');
    if (select) {
      select.value = sid;
      select.style.display = 'none'; // hide select if student is pre-selected
      select.previousElementSibling.style.display = 'none'; // hide label
    }
    document.getElementById('recordForm').action = `/payments/record/${sid}`;
  } else {
    document.getElementById('recordTitle').textContent = `Record Payment`;
    let select = document.getElementById('recordStudent');
    if (select) {
      select.style.display = 'block';
      select.previousElementSibling.style.display = 'block';
    }
    // Note: backend might not support global /payments/record/ without sid, but keeping form standard.
  }
  document.getElementById('recordMonth').value = month;
  document.getElementById('recordAmount').value = amount;
  openModal('recordModal');
}
</script>
{% endblock %}
"""

with open("templates/payments.html", "w") as f:
    f.write(html_content)
