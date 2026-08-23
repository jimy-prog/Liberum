import re

# 1. Add /api/groups endpoint to routers/groups.py
with open('routers/groups.py', 'r', encoding='utf-8') as f:
    text = f.read()

api_route = """
@router.get("/api/list")
def api_list_groups(db: Session = Depends(get_db)):
    groups = db.query(Group).filter(Group.status == "active").all()
    return [{"id": g.id, "name": g.name} for g in groups]
"""
if '/api/list' not in text:
    text = text.replace('router = APIRouter(prefix="/groups"', api_route + '\nrouter = APIRouter(prefix="/groups"')

with open('routers/groups.py', 'w', encoding='utf-8') as f:
    f.write(text)
