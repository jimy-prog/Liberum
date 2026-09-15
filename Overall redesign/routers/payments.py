from fastapi import APIRouter, Request, Depends, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from datetime import date
from database import get_db, Group, Student, Payment
from auth import get_current_user, require_teacher_or_owner

router = APIRouter(prefix="/payments")
templates = Jinja2Templates(directory="templates")

def get_month_data(db, month_str):
    """Get payment status for all active students this month."""
    active_groups = db.query(Group).filter(Group.status == "active").all()
    rows = []
    expected_total = 0
    collected = 0

    for g in active_groups:
        students = db.query(Student).filter(
            Student.group_id == g.id,
            Student.archived == False
        ).all()
        for s in students:
            payment = db.query(Payment).filter(
                Payment.student_id == s.id,
                Payment.month == month_str
            ).first()
            # Expected = group monthly price (student pays this)
            expected = g.price_monthly
            paid_amount = payment.amount if payment else 0
            expected_total += expected
            collected += paid_amount
            rows.append({
                "student": s, "group": g,
                "payment": payment, "expected": expected,
                "paid": paid_amount,
                "status": "paid" if payment else "unpaid"
            })
    return rows, expected_total, collected

@router.get("/")
def payments_view(request: Request, month: str = None,
                  db: Session = Depends(get_db)):
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/login", status_code=303)

    today = date.today()
    month_str = month or today.strftime("%Y-%m")

    # If the user is a student, render their luxury personal tuition statement
    if user.role == "student":
        student = db.query(Student).filter(
            (Student.email == user.email) | (Student.phone == user.phone) | (Student.name == user.full_name)
        ).first()

        group = student.group if student else None
        monthly_fee = group.price_monthly if (group and group.price_monthly) else 400000
        
        # Fetch payment history for this student
        history = []
        is_current_paid = False
        current_paid_amount = 0
        current_month_name = today.strftime("%B")

        if student:
            payments = db.query(Payment).filter(Payment.student_id == student.id).order_by(Payment.paid_date.desc(), Payment.created_at.desc()).all()
            for p in payments:
                if (current_month_name.lower() in (p.month or "").lower()) or (month_str in (p.month or "")):
                    current_paid_amount += (p.amount or 0)
                history.append(p)
            if current_paid_amount >= monthly_fee:
                is_current_paid = True

        return templates.TemplateResponse("payments_student.html", {
            "request": request, "user": user, "student": student, "group": group,
            "monthly_fee": monthly_fee, "is_current_paid": is_current_paid,
            "current_paid_amount": current_paid_amount, "current_month_name": current_month_name,
            "month_str": month_str, "history": history,
            "active_page": "payments", "main_section": "money"
        })

    # Owner / Teacher View
    rows, expected, collected = get_month_data(db, month_str)
    outstanding = expected - collected
    paid_count   = sum(1 for r in rows if r["status"] == "paid")
    unpaid_count = sum(1 for r in rows if r["status"] == "unpaid")

    return templates.TemplateResponse("payments.html", {
        "request": request,
        "month_str": month_str,
        "rows": rows,
        "expected": expected,
        "collected": collected,
        "outstanding": outstanding,
        "paid_count": paid_count,
        "unpaid_count": unpaid_count,
        "active_page": "payments", "main_section": "money"
    })

@router.post("/record/{student_id}")
def record_payment(student_id: int,
                   month: str = Form(...),
                   amount: float = Form(...),
                   method: str = Form("Cash"),
                   notes: str = Form(""),
                   db: Session = Depends(get_db)):
    existing = db.query(Payment).filter(
        Payment.student_id == student_id,
        Payment.month == month
    ).first()
    if existing:
        existing.amount = amount
        existing.method = method
        existing.notes  = notes
        existing.paid_date = date.today()
    else:
        db.add(Payment(
            student_id=student_id, amount=amount,
            month=month, method=method,
            notes=notes, paid_date=date.today()
        ))
    db.commit()
    return RedirectResponse(f"/payments/?month={month}", status_code=303)

@router.post("/mark-paid/{student_id}")
def mark_paid(student_id: int, month: str = Form(...),
              db: Session = Depends(get_db)):
    """Quick mark as paid with default amount."""
    s = db.query(Student).get(student_id)
    if not s or not s.group: 
        return RedirectResponse(f"/payments/?month={month}", status_code=303)
    existing = db.query(Payment).filter(
        Payment.student_id == student_id,
        Payment.month == month
    ).first()
    if not existing:
        db.add(Payment(
            student_id=student_id,
            amount=s.group.price_monthly,
            month=month, method="Cash",
            paid_date=date.today()
        ))
        db.commit()
    return RedirectResponse(f"/payments/?month={month}", status_code=303)

@router.post("/mark-unpaid/{student_id}")
def mark_unpaid(student_id: int, month: str = Form(...),
                db: Session = Depends(get_db)):
    """Remove payment record."""
    p = db.query(Payment).filter(
        Payment.student_id == student_id,
        Payment.month == month
    ).first()
    if p: db.delete(p); db.commit()
    return RedirectResponse(f"/payments/?month={month}", status_code=303)

@router.post("/all-paid")
def all_paid(month: str = Form(...), db: Session = Depends(get_db)):
    """Mark ALL active students as paid for the month."""
    active_groups = db.query(Group).filter(Group.status == "active").all()
    for g in active_groups:
        students = db.query(Student).filter(
            Student.group_id == g.id,
            Student.archived == False
        ).all()
        for s in students:
            existing = db.query(Payment).filter(
                Payment.student_id == s.id,
                Payment.month == month
            ).first()
            if not existing:
                db.add(Payment(
                    student_id=s.id,
                    amount=g.price_monthly,
                    month=month, method="Cash",
                    paid_date=date.today()
                ))
    db.commit()
    return RedirectResponse(f"/payments/?month={month}", status_code=303)

@router.post("/delete/{pid}")
def delete_payment(pid: int, month: str = Form(...),
                   db: Session = Depends(get_db)):
    p = db.query(Payment).get(pid)
    if p: db.delete(p); db.commit()
    return RedirectResponse(f"/payments/?month={month}", status_code=303)
