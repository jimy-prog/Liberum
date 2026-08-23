with open("routers/students.py", "r") as f:
    text = f.read()

import re

old_return = '''        return templates.TemplateResponse("student_detail_modal.html", {
            "request": request, "student": s, "records": records,
            "present": present, "absent": absent, "excused": excused,
            "rate": rate, "tests": tests, "monthly": dict(monthly), "debt": 0
        })'''

new_return = '''        # Calculate average performance
        from database import WeeklyPerformance
        perfs = db.query(WeeklyPerformance).filter_by(student_id=sid).all()
        p_avg = {'v':0, 'g':0, 'f':0, 'h':0}
        if perfs:
            v_scores = [p.vocabulary for p in perfs if p.vocabulary is not None]
            g_scores = [p.grammar for p in perfs if p.grammar is not None]
            f_scores = [p.activity for p in perfs if p.activity is not None]
            h_scores = [p.homework for p in perfs if p.homework is not None]
            p_avg['v'] = sum(v_scores)/len(v_scores) if v_scores else 0
            p_avg['g'] = sum(g_scores)/len(g_scores) if g_scores else 0
            p_avg['f'] = sum(f_scores)/len(f_scores) if f_scores else 0
            p_avg['h'] = sum(h_scores)/len(h_scores) if h_scores else 0

        return templates.TemplateResponse("student_detail_modal.html", {
            "request": request, "student": s, "records": records,
            "present": present, "absent": absent, "excused": excused,
            "rate": rate, "tests": tests, "monthly": dict(monthly), "debt": 0, "p_avg": p_avg
        })'''

text = text.replace(old_return, new_return)

with open("routers/students.py", "w") as f:
    f.write(text)
