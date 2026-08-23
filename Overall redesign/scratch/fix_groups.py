with open('routers/groups.py', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Remove the broken api_list_groups from the top
text = re.sub(r'@router\.get\("/api/list"\)\ndef api_list_groups.*?return \[\{"id": g\.id, "name": g\.name\} for g in groups\]\n', '', text, flags=re.DOTALL)

# Append it to the BOTTOM of the file
api_route = """
@router.get("/api/list")
def api_list_groups(db: Session = Depends(get_db)):
    groups = db.query(Group).filter(Group.status == "active").all()
    return [{"id": g.id, "name": g.name} for g in groups]
"""
text += api_route

with open('routers/groups.py', 'w', encoding='utf-8') as f:
    f.write(text)
