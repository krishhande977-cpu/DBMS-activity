from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from decimal import Decimal
from app.database.connection import get_db
from app.models.models import Payment, Bill, Patient
from app.schemas.schemas import PaymentCreate, PaymentResponse
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/payments", tags=["Payments"])


def payment_to_response(p: Payment) -> PaymentResponse:
    patient_name = None
    patient_code = None
    if p.bill and p.bill.patient:
        patient_name = p.bill.patient.name
        patient_code = p.bill.patient.patient_code

    return PaymentResponse(
        id=p.id,
        bill_id=p.bill_id,
        amount=p.amount,
        payment_method=p.payment_method,
        transaction_reference=p.transaction_reference,
        payment_date=p.payment_date,
        patient_name=patient_name,
        patient_code=patient_code
    )


@router.get("", response_model=List[PaymentResponse])
def get_payments(
    bill_id: Optional[int] = Query(None),
    payment_method: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Payment).join(Bill).join(Patient)

    if bill_id:
        query = query.filter(Payment.bill_id == bill_id)

    if payment_method:
        query = query.filter(Payment.payment_method == payment_method)

    payments = query.order_by(Payment.payment_date.desc()).all()
    return [payment_to_response(p) for p in payments]


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def record_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "RECEPTIONIST"]))
):
    """
    Transactional Payment Recording:
    1. Lock bill record
    2. Calculate existing paid amount
    3. Ensure payment does not exceed remaining balance
    4. Insert payment
    5. Update bill status (Paid or Partially Paid)
    """
    try:
        bill = db.query(Bill).filter(Bill.id == payment_in.bill_id).with_for_update().first()
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")

        current_paid = db.query(func.sum(Payment.amount)).filter(
            Payment.bill_id == bill.id
        ).scalar() or Decimal("0.00")

        remaining_balance = Decimal(str(bill.total_amount)) - Decimal(str(current_paid))

        if payment_in.amount <= Decimal("0.00"):
            raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")

        if payment_in.amount > remaining_balance:
            raise HTTPException(
                status_code=400,
                detail=f"Payment amount (${payment_in.amount}) cannot exceed remaining balance (${remaining_balance})."
            )

        new_payment = Payment(
            bill_id=payment_in.bill_id,
            amount=payment_in.amount,
            payment_method=payment_in.payment_method,
            transaction_reference=payment_in.transaction_reference
        )
        db.add(new_payment)
        db.flush()

        # Recalculate new total paid
        new_total_paid = Decimal(str(current_paid)) + Decimal(str(payment_in.amount))

        if new_total_paid >= Decimal(str(bill.total_amount)):
            bill.payment_status = "Paid"
        else:
            bill.payment_status = "Partially Paid"

        db.commit()
        db.refresh(new_payment)
        return payment_to_response(new_payment)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error during payment processing: {str(e)}")
