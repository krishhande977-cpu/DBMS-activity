from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from decimal import Decimal
from app.database.connection import get_db
from app.models.models import Bill, Payment, Patient, Appointment, Admission
from app.schemas.schemas import (
    BillCreate, BillUpdate, BillResponse, PaymentResponse
)
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/bills", tags=["Billing"])


def bill_to_response(b: Bill) -> BillResponse:
    paid = sum(p.amount for p in b.payments) if b.payments else Decimal("0.00")
    balance = max(Decimal("0.00"), Decimal(str(b.total_amount)) - Decimal(str(paid)))

    payments = [
        PaymentResponse(
            id=p.id,
            bill_id=p.bill_id,
            amount=p.amount,
            payment_method=p.payment_method,
            transaction_reference=p.transaction_reference,
            payment_date=p.payment_date,
            patient_name=b.patient.name if b.patient else None,
            patient_code=b.patient.patient_code if b.patient else None
        )
        for p in b.payments
    ]

    return BillResponse(
        id=b.id,
        patient_id=b.patient_id,
        appointment_id=b.appointment_id,
        admission_id=b.admission_id,
        consultation_charge=b.consultation_charge,
        room_charge=b.room_charge,
        medicine_charge=b.medicine_charge,
        test_charge=b.test_charge,
        other_charge=b.other_charge,
        total_amount=b.total_amount,
        payment_status=b.payment_status,
        generated_at=b.generated_at,
        patient_name=b.patient.name if b.patient else None,
        patient_code=b.patient.patient_code if b.patient else None,
        patient_phone=b.patient.phone if b.patient else None,
        paid_amount=paid,
        balance_amount=balance,
        payments=payments
    )


@router.get("", response_model=List[BillResponse])
def get_bills(
    patient_id: Optional[int] = Query(None),
    payment_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Bill).join(Patient)

    if patient_id:
        query = query.filter(Bill.patient_id == patient_id)

    if payment_status:
        query = query.filter(Bill.payment_status == payment_status)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Patient.name.ilike(search_filter),
                Patient.patient_code.ilike(search_filter)
            )
        )

    bills = query.order_by(Bill.generated_at.desc()).all()
    return [bill_to_response(b) for b in bills]


@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(bill_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    b = db.query(Bill).filter(Bill.id == bill_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill_to_response(b)


@router.post("", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
def create_bill(
    bill_in: BillCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "RECEPTIONIST"]))
):
    patient = db.query(Patient).filter(Patient.id == bill_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    total = (
        bill_in.consultation_charge +
        bill_in.room_charge +
        bill_in.medicine_charge +
        bill_in.test_charge +
        bill_in.other_charge
    )

    new_bill = Bill(
        patient_id=bill_in.patient_id,
        appointment_id=bill_in.appointment_id,
        admission_id=bill_in.admission_id,
        consultation_charge=bill_in.consultation_charge,
        room_charge=bill_in.room_charge,
        medicine_charge=bill_in.medicine_charge,
        test_charge=bill_in.test_charge,
        other_charge=bill_in.other_charge,
        total_amount=total,
        payment_status="Pending"
    )
    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)
    return bill_to_response(new_bill)


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(
    bill_id: int,
    bill_in: BillUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "RECEPTIONIST"]))
):
    b = db.query(Bill).filter(Bill.id == bill_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bill not found")

    update_data = bill_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(b, field, val)

    # Recalculate total
    b.total_amount = (
        b.consultation_charge +
        b.room_charge +
        b.medicine_charge +
        b.test_charge +
        b.other_charge
    )

    # Update payment status based on paid amount
    paid = sum(p.amount for p in b.payments) if b.payments else Decimal("0.00")
    if paid >= b.total_amount:
        b.payment_status = "Paid"
    elif paid > 0:
        b.payment_status = "Partially Paid"
    else:
        b.payment_status = "Pending"

    db.commit()
    db.refresh(b)
    return bill_to_response(b)


@router.delete("/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    b = db.query(Bill).filter(Bill.id == bill_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bill not found")

    db.delete(b)
    db.commit()
    return None
