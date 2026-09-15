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

@router.post("/api/v1/student/pay")
async def student_pay_api(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request)
    if not user:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    
    data = await request.json()
    method = data.get("method", "Payme")
    
    student = db.query(Student).filter(
        (Student.email == user.email) | (Student.phone == user.phone) | (Student.name == user.full_name)
    ).first()
    
    if not student:
        student = db.query(Student).first()
        
    group = student.group if student else None
    monthly_fee = group.price_monthly if (group and group.price_monthly) else 400000
    month_str = date.today().strftime("%Y-%m")
    
    # Register payment
    existing = db.query(Payment).filter(
        Payment.student_id == student.id,
        Payment.month == month_str
    ).first()
    
    if not existing:
        payment = Payment(
            student_id=student.id,
            amount=monthly_fee,
            month=month_str,
            method=method,
            paid_date=date.today()
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)
    
    return JSONResponse({
        "status": "success",
        "message": f"Payment of {monthly_fee:,.0f} UZS via {method} confirmed!"
    })

@router.get("/receipt/{pid}")
def download_receipt(pid: int, request: Request, db: Session = Depends(get_db)):
    from fastapi.responses import HTMLResponse
    p = db.query(Payment).get(pid)
    if not p:
        return HTMLResponse("Receipt not found", status_code=404)
        
    s = p.student
    html = f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt #{p.id} — Liberum</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1D1D1F; max-width: 600px; margin: 0 auto; background: #fafafa; }}
        .card {{ background: #fff; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #f3f4f6; padding-bottom: 20px; }}
        .brand {{ font-size: 24px; font-weight: 800; color: #7B61FF; }}
        .badge {{ background: #ecfdf5; color: #059669; font-weight: 700; padding: 6px 14px; border-radius: 999px; font-size: 13px; }}
        .row {{ display: flex; justify-content: space-between; margin: 14px 0; font-size: 14px; }}
        .row span {{ color: #6b7280; }}
        .row b {{ color: #111827; }}
        .total {{ font-size: 26px; font-weight: 800; color: #10B981; margin: 24px 0 10px; border-top: 1px solid #f3f4f6; padding-top: 20px; text-align: right; }}
        .btn-print {{ display: block; width: 100%; text-align: center; background: #7B61FF; color: #fff; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 20px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="brand">Liberum Studio</div>
          <div class="badge">OFFICIAL RECEIPT</div>
        </div>
        <div style="margin-top: 24px;">
          <div class="row"><span>Receipt ID:</span><b>#LIB-{p.id:06d}</b></div>
          <div class="row"><span>Date & Time:</span><b>{p.paid_date or p.date}</b></div>
          <div class="row"><span>Student Name:</span><b>{s.name if s else 'Student'}</b></div>
          <div class="row"><span>Billing Month:</span><b>{p.month}</b></div>
          <div class="row"><span>Payment Rail:</span><b>{p.payment_method or p.method or 'Cash'}</b></div>
          <div class="row"><span>Transaction Status:</span><b style="color: #059669;">Verified & Cleared ✓</b></div>
        </div>
        <div class="total">{int(p.amount):,} UZS</div>
        <div style="text-align: right; font-size: 11px; color: #9ca3af;">Fiscal identifier: UZ-TASHKENT-LIBERUM-ACADEMY</div>
        <a href="javascript:window.print()" class="btn-print">Print / Save as PDF</a>
      </div>
    </body>
    </html>
    """
    return HTMLResponse(html)
