with open("templates/online.html", "r") as f:
    text = f.read()

# Replace 0s with fake data
text = text.replace('<div class="v">0</div><div class="l">Online groups</div>', '<div class="v">2</div><div class="l">Online groups</div>')
text = text.replace('<div class="v">0</div><div class="l">Online students</div>', '<div class="v">18</div><div class="l">Online students</div>')
text = text.replace('<div class="v money">0</div><div class="l">UZS this month</div>', '<div class="v money">14,400,000</div><div class="l">UZS this month</div>')

# Replace empty state with a table
empty_state = '<div class="empty">No online groups currently</div>'
fake_table = '''
  <table class="table">
    <thead>
      <tr>
        <th>Group</th>
        <th>Students</th>
        <th>Schedule</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-weight:600">IELTS Speaking (Zoom)</td>
        <td>12</td>
        <td>Tue, Thu 18:00</td>
        <td><button class="btn sm ghost"><i data-lucide="video"></i>Join</button></td>
      </tr>
      <tr>
        <td style="font-weight:600">Grammar Online</td>
        <td>6</td>
        <td>Mon, Wed 20:00</td>
        <td><button class="btn sm ghost"><i data-lucide="video"></i>Join</button></td>
      </tr>
    </tbody>
  </table>
'''
text = text.replace(empty_state, fake_table)

with open("templates/online.html", "w") as f:
    f.write(text)

