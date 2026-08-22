with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("{{ income | default('0') }}", "{{ '{:,.0f}'.format(income | default(0)) }}")
text = text.replace("{{ att_rate | default('0') }}%", "{{ att_rate | default('0') }}%") # already fine
text = text.replace("{{ held_count | default('0') }}<span", "{{ held_count | default('0') }}<span") # fine

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
