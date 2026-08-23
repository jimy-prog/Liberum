with open("templates/payments.html", "r") as f:
    text = f.read()

import re
old_js = '''<script>
function viewPayment(student, amount, method, month) {
    document.getElementById('vpStudent').innerText = student;
    document.getElementById('vpAmount').innerText = new Intl.NumberFormat().format(amount) + ' UZS';
    document.getElementById('vpMethod').innerText = method;
    document.getElementById('vpMonth').innerText = month;
    document.getElementById('viewPaymentModal').classList.add('open');
}
</script>'''

new_js = '''<script>
function viewPayment(student, amount, method, month) {
    let m = document.getElementById('viewPaymentModal');
    if(m.parentNode !== document.body) document.body.appendChild(m);
    document.getElementById('vpStudent').innerText = student;
    document.getElementById('vpAmount').innerText = new Intl.NumberFormat().format(amount) + ' UZS';
    
    // The user said the method and month are very large and ugly.
    document.getElementById('vpMethod').innerText = method;
    document.getElementById('vpMethod').style.fontSize = '14px';
    document.getElementById('vpMonth').innerText = month;
    document.getElementById('vpMonth').style.fontSize = '14px';
    
    // Also increase z-index
    m.style.zIndex = '99999';
    m.classList.add('open');
}
</script>'''

text = text.replace(old_js, new_js)

with open("templates/payments.html", "w") as f:
    f.write(text)
