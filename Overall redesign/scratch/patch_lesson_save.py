with open("routers/lessons.py", "r") as f:
    text = f.read()

import re
old_save = '''        else:
            if val in ["Present", "Absent", "Excused"]:
                db.add(Attendance(lesson_id=lid, student_id=sid, status=val))
    
    db.commit()
    return RedirectResponse(f"/lessons/{lid}", status_code=303)'''

new_save = '''        else:
            if val in ["Present", "Absent", "Excused"]:
                db.add(Attendance(lesson_id=lid, student_id=sid, status=val))
    
    db.commit()
    
    from_modal = request.query_params.get("from_modal")
    if from_modal:
        ref = request.headers.get("referer", "/timetable/")
        return RedirectResponse(ref, status_code=303)
        
    return RedirectResponse(f"/lessons/{lid}", status_code=303)'''

text = text.replace(old_save, new_save)
with open("routers/lessons.py", "w") as f:
    f.write(text)
