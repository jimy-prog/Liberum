with open("templates/performance.html", "r") as f:
    text = f.read()

import re

# We will replace the table headers
old_headers = r'''          {% for w in weeks %}
          <th class="pwh" colspan="3">Week {{ w }}</th>
          {% endfor %}
          <th class="pth" rowspan="2" style="text-align:center">Avg</th>
        </tr>
        <tr>
          {% for w in weeks %}
          <th class="psh">G</th><th class="psh">A</th><th class="psh">V</th>
          {% endfor %}'''

new_headers = '''          {% for w in weeks %}
          <th class="pwh" colspan="4">Week {{ w }}</th>
          {% endfor %}
          <th class="pth" rowspan="2" style="text-align:center">Avg</th>
        </tr>
        <tr>
          {% for w in weeks %}
          <th class="psh" title="Vocabulary">V</th><th class="psh" title="Grammar">G</th><th class="psh" title="Fluency">F</th><th class="psh" title="Homework">H</th>
          {% endfor %}'''

text = re.sub(r'          {% for w in weeks %}\n          <th class="pwh" colspan="3".*?{% endfor %}', new_headers, text, flags=re.DOTALL)

# Replace the row data
old_row = r'''          {% for w in weeks %}{% set wp=row.weeks.get\(w\) %}
          {% for field,fattr in \[\('grammar','grammar'\),\('activity','activity'\),\('vocabulary','vocabulary'\)\] %}
          {% set val=wp.grammar if fattr=='grammar' and wp else wp.activity if fattr=='activity' and wp else wp.vocabulary if fattr=='vocabulary' and wp else none %}
          <td class="ps">
            <div class="sd {% if val==1 %}s1{% elif val==2 %}s2{% elif val==3 %}s3{% endif %}"
                 data-val="{{ val or 0 }}" data-sid="{{ s.id }}" data-week="{{ w }}" data-field="{{ field }}"
                 onclick="cycleScore\(this,'{{ month_str }}'\)">
              {% if val==1 %}🔴{% elif val==2 %}🟡{% elif val==3 %}🟢{% else %}<span style="color:var\(--txt3\);font-size:.62rem">—</span>{% endif %}
            </div>
          </td>
          {% if val and val>0 %}{% set tot.s=tot.s\+val %}{% set tot.c=tot.c\+1 %}{% endif %}
          {% endfor %}{% endfor %}'''

new_row = '''          {% for w in weeks %}{% set wp=row.weeks.get(w) %}
          {% for field,fattr in [('vocabulary','vocabulary'),('grammar','grammar'),('activity','activity'),('homework','homework')] %}
          {% set val=wp.vocabulary if fattr=='vocabulary' and wp else wp.grammar if fattr=='grammar' and wp else wp.activity if fattr=='activity' and wp else wp.homework if fattr=='homework' and wp else none %}
          <td class="ps">
            <input type="number" min="0" max="10" class="sd-input"
                 value="{{ val if val is not none else '' }}" data-sid="{{ s.id }}" data-week="{{ w }}" data-field="{{ field }}"
                 onblur="saveScore(this,'{{ month_str }}')" placeholder="-">
          </td>
          {% if val is not none %}{% set tot.s=tot.s+val %}{% set tot.c=tot.c+1 %}{% endif %}
          {% endfor %}{% endfor %}'''

text = re.sub(r'          {% for w in weeks %}{% set wp=row.weeks.get\(w\).*?{% endfor %}{% endfor %}', new_row, text, flags=re.DOTALL)

# Update alert
text = re.sub(r'<div class="alert alert-info".*?</div>', '<div class="alert alert-info" style="font-size:.78rem"><strong>V</strong>=Vocabulary · <strong>G</strong>=Grammar · <strong>F</strong>=Fluency · <strong>H</strong>=Homework · Score out of 10</div>', text)

# Replace JS logic
old_js = r'''const emojis={0:'<span style="color:var\(--text3\);font-size:.62rem">—</span>',1:'🔴',2:'🟡',3:'🟢'};
const cls={0:'',1:'s1',2:'s2',3:'s3'};
function cycleScore\(dot,month\){
  const cur=parseInt\(dot.dataset.val\)\|\|0,next=\(cur\+1\)%4;
  dot.dataset.val=next; dot.innerHTML=emojis\[next\];
  dot.className='sd '\+cls\[next\];
  fetch\('/performance/quick-save',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify\(\{student_id:parseInt\(dot.dataset.sid\),month,week:parseInt\(dot.dataset.week\),field:dot.dataset.field,value:next\|\|null\}\)\}\);
  updateAvg\(dot\);
}
function updateAvg\(dot\){
  const row=dot.closest\('tr'\);
  let s=0,c=0;
  row.querySelectorAll\('\.sd'\).forEach\(d=>{const v=parseInt\(d.dataset.val\)\|\|0;if\(v>0\){s\+=v;c\+\+;}}\);
  const cell=row.querySelector\('\.pa'\);
  if\(!cell\)return;
  if\(!c\){cell.innerHTML='—';return;}
  const avg=s/c,col=avg>=2\.5\?'var\(--green\)':avg>=1\.8\?'var\(--yellow\)':'var\(--red\)';
  cell.innerHTML=`<span style="color:${col}">${avg.toFixed\(1\)}</span>`;
}'''

new_js = '''async function saveScore(input, month) {
  let val = parseInt(input.value);
  if (isNaN(val)) val = null;
  else if (val < 0) val = 0;
  else if (val > 10) val = 10;
  input.value = val !== null ? val : '';
  
  await fetch('/performance/quick-save',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({student_id:parseInt(input.dataset.sid),month,week:parseInt(input.dataset.week),field:input.dataset.field,value:val})});
  updateAvg(input);
}
function updateAvg(input){
  const row=input.closest('tr');
  let s=0,c=0;
  row.querySelectorAll('.sd-input').forEach(d=>{
    const v=parseInt(d.value);
    if(!isNaN(v)){s+=v;c++;}
  });
  const cell=row.querySelector('.pa');
  if(!cell)return;
  if(!c){cell.innerHTML='—';return;}
  const avg=s/c,col=avg>=8?'var(--green)':avg>=5?'var(--yellow)':'var(--red)';
  cell.innerHTML=`<span style="color:${col};font-weight:700">${avg.toFixed(1)}</span>`;
}'''

text = re.sub(old_js, new_js, text, flags=re.DOTALL)

with open("templates/performance.html", "w") as f:
    f.write(text)
