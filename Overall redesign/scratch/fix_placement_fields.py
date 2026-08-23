with open('templates/placement_dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix field names to match PlacementSession model
# pin_code -> access_code
text = text.replace('s.pin_code', 's.access_code')
# result_level -> no such field, use s.passed and target_level
text = text.replace('{{ s.result_level or \'Done\' }}', '{{ "Passed" if s.passed else "Done" }}')
# s.student_id -> no such field in PlacementSession - use s.status
text = text.replace('{% if not s.student_id %}', '{% if s.status == "completed" and not s.passed %}')
# created_at -> started_at or completed_at
text = text.replace('s.created_at.strftime', 's.completed_at.strftime')
text = text.replace('if s.created_at', 'if s.completed_at')

with open('templates/placement_dashboard.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Done")
