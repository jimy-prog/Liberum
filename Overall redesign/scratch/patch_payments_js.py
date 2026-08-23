with open("templates/payments.html", "r") as f:
    text = f.read()

text = text.replace("document.getElementById('recordForm').action = `/payments/record/${sid}`;", "document.getElementById('recordForm').action = '/payments/record/' + sid;")

js_patch = """
document.getElementById('recordForm').addEventListener('submit', function(e) {
  let select = document.getElementById('recordStudent');
  if (select && select.style.display !== 'none') {
    this.action = '/payments/record/' + select.value;
  }
});
"""
text = text.replace("</script>", js_patch + "\n</script>")

with open("templates/payments.html", "w") as f:
    f.write(text)
