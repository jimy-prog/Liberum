import glob

files = ["templates/finance.html", "templates/payments.html", "templates/monthly_report.html"]

for file in files:
    try:
        with open(file, "r") as f:
            text = f.read()

        # Remove monthly report from segs
        text = text.replace('<button  onclick="window.location=\'/monthly-report/\'">Monthly report</button>', '')
        text = text.replace('<button class="on" onclick="window.location=\'/monthly-report/\'">Monthly report</button>', '')
        text = text.replace('<button  onclick="window.location=\'/finance/\'">Finance</button>', '<button onclick="window.location=\'/finance/\'">Finance</button>')
        text = text.replace('<button onclick="window.location=\'/finance/\'">Finance</button>', '<button onclick="window.location=\'/finance/\'">Finance</button>') # no op but careful
        if 'class="on" onclick="window.location=\'/finance/\'"' in text: pass # leave it
        if 'class="on" onclick="window.location=\'/payments/\'"' in text: pass # leave it
        
        # Add monthly report FAB if it's not monthly_report itself
        if "monthly_report" not in file:
            fab = '\n<a href="/monthly-report/" class="btn block" style="position:fixed;bottom:24px;right:24px;box-shadow:0 8px 24px rgba(0,0,0,0.2);z-index:100;border-radius:99px;"><i data-lucide="file-text"></i> Monthly Report</a>\n'
            text = text.replace('{% endblock %}', fab + '{% endblock %}', 1)

        # Update CSS variables and classes
        text = text.replace('var(--bg2)', 'var(--card)')
        text = text.replace('var(--bg3)', 'var(--fill)')
        text = text.replace('var(--border)', 'var(--line)')
        text = text.replace('var(--text2)', 'var(--txt2)')
        text = text.replace('var(--text3)', 'var(--txt3)')
        text = text.replace('var(--text)', 'var(--txt)')
        text = text.replace('var(--radius)', '16px')
        text = text.replace('var(--accent)', 'var(--acc)')
        text = text.replace('var(--accent2)', 'var(--acc2)')
        text = text.replace('var(--green)', 'var(--money)')
        text = text.replace('class="card mb-6"', 'class="card" style="margin-bottom:24px"')
        text = text.replace('class="card-header"', 'class="ct"')
        text = text.replace('<span class="card-title">', '<span>')
        text = text.replace('btn btn-ghost btn-sm', 'btn sm ghost')
        text = text.replace('btn btn-primary btn-sm', 'btn sm block')
        text = text.replace('btn btn-green btn-sm', 'btn sm" style="background:var(--money);color:#fff;')
        
        with open(file, "w") as f:
            f.write(text)
    except Exception as e:
        print(f"Error {file}: {e}")
