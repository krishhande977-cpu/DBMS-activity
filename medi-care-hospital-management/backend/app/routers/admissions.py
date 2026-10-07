from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import math
from decimal import Decimal
from typing import Optional, List
from app.database.connection import get_db
from app.models.models import Admission, Room, Patient, Doctor, Bill
from app.schemas.schemas import (
    AdmissionCreate, AdmissionDischarge, AdmissionResponse
)
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/admissions", tags=["Admissions"])


def admission_to_response(adm: Admission) -> AdmissionResponse:
    # Calculate days stayed
    days = 1
    charge = Decimal("0.00")
    if adm.admission_date:
        end_time = adm.discharge_date or datetime.now()
        diff = end_time - adm.admission_date
        total_seconds = max(0, diff.total_seconds())
        # Minimum 1 day, then ceiling of days
        days = max(1, math.ceil(total_seconds / 86400))
        if adm.room and adm.room.daily_charge:
            charge = Decimal(str(adm.room.daily_charge)) * Decimal(str(days))

    return AdmissionResponse(
        id=adm.id,
        patient_id=adm.patient_id,
        doctor_id=adm.doctor_id,
        room_id=adm.room_id,
        admission_date=adm.admission_date,
        discharge_date=adm.discharge_date,
        reason=adm.reason,
        status=adm.status,
        patient_name=adm.patient.name if adm.patient else None,
        patient_code=adm.patient.patient_code if adm.patient else None,
        doctor_name=adm.doctor.name if adm.doctor else None,
        room_number=adm.room.room_number if adm.room else None,
        room_type=adm.room.room_type if adm.room else None,
        daily_charge=adm.room.daily_charge if adm.room else Decimal("0.00"),
        calculated_days=days,
        calculated_room_charge=charge
    )


@router.get("", response_model=List[AdmissionResponse])
def get_admissions(
    status_filter: Optional[str] = Query(None, alias="status"),
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Admission).join(Patient).join(Doctor).join(Room)

    if status_filter:
        query = query.filter(Admission.status == status_filter)

    if patient_id:
        query = query.filter(Admission.patient_id == patient_id)

    if current_user.role == "DOCTOR" and getattr(current_user, "doctor_id", None):
        query = query.filter(Admission.doctor_id == current_user.doctor_id)
    elif doctor_id:
        query = query.filter(Admission.doctor_id == doctor_id)

    admissions = query.order_by(Admission.admission_date.desc()).all()
    return [admission_to_response(a) for a in admissions]


@router.get("/{admission_id}", response_model=AdmissionResponse)
def get_admission(admission_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    adm = db.query(Admission).filter(Admission.id == admission_id).first()
    if not adm:
        raise HTTPException(status_code=404, detail="Admission record not found")
    return admission_to_response(adm)


@router.post("", response_model=AdmissionResponse, status_code=status.HTTP_201_CREATED)
def admit_patient(
    adm_in: AdmissionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "RECEPTIONIST"]))
):
    """
    Transactional admission operation:
    1. Verify patient and doctor exist
    2. Check room is Available
    3. Create Admission record
    4. Automatically update Room status to OCCUPIED
    """
    # Begin transaction
    try:
        patient = db.query(Patient).filter(Patient.id == adm_in.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")

        doctor = db.query(Doctor).filter(Doctor.id == adm_in.doctor_id).first()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        room = db.query(Room).filter(Room.id == adm_in.room_id).with_for_update().first()
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")

        if room.status != "Available":
            raise HTTPException(
                status_code=400,
                detail=f"Room {room.room_number} is currently {room.status} and cannot be assigned."
            )

        new_adm = Admission(
            patient_id=adm_in.patient_id,
            doctor_id=adm_in.doctor_id,
            room_id=adm_in.room_id,
            admission_date=adm_in.admission_date,
            reason=adm_in.reason,
            status="Active"
        )
        db.add(new_adm)

        # Atomic state change on room
        room.status = "Occupied"

        db.commit()
        db.refresh(new_adm)
        return admission_to_response(new_adm)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database transaction error during admission: {str(e)}")


@router.put("/{admission_id}/discharge", response_model=AdmissionResponse)
def discharge_patient(
    admission_id: int,
    discharge_data: AdmissionDischarge,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "RECEPTIONIST"]))
):
    """
    Transactional discharge operation:
    1. Find active admission
    2. Set discharge_date and status = 'Discharged'
    3. Update room status to 'Available'
    4. Calculate room charge (days * daily_charge)
    5. Automatically create/update bill with calculated room charge
    """
    try:
        adm = db.query(Admission).filter(Admission.id == admission_id).with_for_update().first()
        if not adm:
            raise HTTPException(status_code=404, detail="Admission record not found")

        if adm.status == "Discharged":
            raise HTTPException(status_code=400, detail="Patient is already discharged from this admission")

        discharge_date = discharge_data.discharge_date or datetime.now()
        adm.discharge_date = discharge_date
        adm.status = "Discharged"

        # Mark Room Available
        room = db.query(Room).filter(Room.id == adm.room_id).first()
        if room:
            room.status = "Available"

        # Calculate stay days and charges
        diff = discharge_date - adm.admission_date
        total_seconds = max(0, diff.total_seconds())
        days = max(1, math.ceil(total_seconds / 86400))
        room_charge = Decimal(str(room.daily_charge if room else 500)) * Decimal(str(days))

        # Generate / Update Bill
        if discharge_data.generate_bill:
            existing_bill = db.query(Bill).filter(Bill.admission_id == adm.id).first()
            doctor = db.query(Doctor).filter(Doctor.id == adm.doctor_id).first()
            consultation_fee = doctor.consultation_fee if doctor else Decimal("500.00")

            if existing_bill:
                existing_bill.room_charge = room_charge
                existing_bill.total_amount = (
                    existing_bill.consultation_charge +
                    room_charge +
                    existing_bill.medicine_charge +
                    existing_bill.test_charge +
                    existing_bill.other_charge
                )
            else:
                new_bill = Bill(
                    patient_id=adm.patient_id,
                    admission_id=adm.id,
                    consultation_charge=consultation_fee,
                    room_charge=room_charge,
                    medicine_charge=Decimal("1500.00"),
                    test_charge=Decimal("2000.00"),
                    other_charge=Decimal("500.00"),
                    total_amount=consultation_fee + room_charge + Decimal("4000.00"),
                    payment_status="Pending"
                )
                db.add(new_bill)

        db.commit()
        db.refresh(adm)
        return admission_to_response(adm)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database transaction error during discharge: {str(e)}")
