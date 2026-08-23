import re

with open('templates/students.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the Add Student Modal content
new_modal = """<!-- Add Student Modal -->
<div class="ovl" id="addStudent">
  <div class="modal">
    <div class="mt">Add Student<button type="button" class="x" onclick="document.getElementById('addStudent').classList.remove('open')"><i data-lucide="x"></i></button></div>
    <form id="addStudentForm" action="/students/add" method="POST" style="margin-top:16px">
      <div id="phoneCheckBox" style="display:none;padding:12px;border-radius:8px;font-size:13.5px;margin-bottom:12px"></div>
      
      <div class="fgroup"><label>Full Name</label><input name="name" required></div>
      <div class="frow">
        <div class="fgroup"><label>Group (Optional)</label>
          <select name="group_id">
            <option value="">No Group</option>
            {% for g in groups %}
            <option value="{{ g.id }}">{{ g.name }}</option>
            {% endfor %}
          </select>
        </div>
        <div class="fgroup"><label>Level</label>
          <select name="level" id="studentLevelSelect" onchange="onLevelChange(this.value)">
            <option value="beginner">Beginner / Unsure</option>
            <option value="elementary">Elementary</option>
            <option value="pre-intermediate">Pre-Intermediate</option>
            <option value="intermediate">Intermediate</option>
            <option value="upper-intermediate">Upper-Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
      
      <div class="frow">
        <div class="fgroup"><label>Phone</label><input name="phone" placeholder="+998..." onblur="checkPhoneMatch(this.value)"></div>
        <div class="fgroup"><label>Parent Phone</label><input name="parent_phone" placeholder="+998..."></div>
      </div>
      
      <div class="fgroup"><label>Email (Optional)</label><input type="email" name="email"></div>
      <div class="fgroup"><label>Notes</label><textarea name="notes" rows="2"></textarea></div>
      
      <button type="submit" class="btn block" id="addStudentSubmit" style="margin-top:16px">Add Student</button>
    </form>
  </div>
</div>
{% endblock %}"""

text = re.sub(r'<!-- Add Student Modal -->.*\{% endblock %\}', new_modal, text, flags=re.DOTALL)
with open('templates/students.html', 'w', encoding='utf-8') as f:
    f.write(text)
