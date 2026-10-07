from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from datetime import date
from app.database.connection import get_db
from app.models.models import Appointment, Patient, Doctor, Department
from app.schemas.schemas import (
    AppointmentCreate, AppointmentUpdate, AppointmentStatusUpdate, AppointmentResponse
)
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def appointment_to_response(a: Appointment) -> AppointmentResponse:
    return AppointmentResponse(
        id=a.id,
        patient_id=a.patient_id,
        doctor_id=a.doctor_id,
        appointment_date=a.appointment_date,
        appointment_time=a.appointment_time,
        appointment_type=a.appointment_type,
        reason=a.reason,
        status=a.status,
        created_at=a.created_at,
        patient_name=a.patient.name if a.patient else None,
        patient_code=a.patient.patient_code if a.patient else None,
        doctor_name=a.doctor.name if a.doctor else None,
        department_name=a.doctor.department.department_name if a.doctor and a.doctor.department else None
    )


@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    doctor_id: Optional[int] = Query(None),
    patient_id: Optional[int] = Query(None),
    appointment_date: Optional[date] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Appointment).join(Patient).join(Doctor)

    # Role enforcement: if DOCTOR, only their appointments unless admin
    if current_user.role == "DOCTOR" and getattr(current_user, "doctor_id", None):
        query = query.filter(Appointment.doctor_id == current_user.doctor_id)
    elif doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)

    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)

    if appointment_date:
        query = query.filter(Appointment.appointment_date == appointment_date)

    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Patient.name.ilike(search_filter),
                Patient.patient_code.ilike(search_filter),
                Doctor.name.ilike(search_filter)
            )
        )

    appointments = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).all()
    return [appointment_to_response(a) for a in appointments]


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    a = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment_to_response(a)


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appt_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == appt_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == appt_in.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Double Booking Prevention: Check if doctor already has an active appointment at that date & time
    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == appt_in.doctor_id,
        Appointment.appointment_date == appt_in.appointment_date,
        Appointment.appointment_time == appt_in.appointment_time,
        Appointment.status.notin_(["Cancelled"])
    ).first()

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Double-booking prevented: {doctor.name} already has an appointment scheduled on {appt_in.appointment_date} at {appt_in.appointment_time}."
        )

    new_appt = Appointment(**appt_in.model_dump())
    db.add(new_appt)
    db.commit()
    db.refresh(new_appt)
    return appointment_to_response(new_appt)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    appt_in: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    target_doctor_id = appt_in.doctor_id or appt.doctor_id
    target_date = appt_in.appointment_date or appt.appointment_date
    target_time = appt_in.appointment_time or appt.appointment_time

    # Double Booking Prevention if date or time or doctor changed
    if (target_doctor_id != appt.doctor_id or target_date != appt.appointment_date or target_time != appt.appointment_time):
        conflict = db.query(Appointment).filter(
            Appointment.doctor_id == target_doctor_id,
            Appointment.appointment_date == target_date,
            Appointment.appointment_time == target_time,
            Appointment.id != appointment_id,
            Appointment.status.notin_(["Cancelled"])
        ).first()

        if conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Double-booking prevented: Doctor already has an appointment on {target_date} at {target_time}."
            )

    update_data = appt_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(appt, field, val)

    db.commit()
    db.refresh(appt)
    return appointment_to_response(appt)


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    status_in: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    valid_statuses = ["Scheduled", "Confirmed", "Completed", "Cancelled", "No Show"]
    if status_in.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    appt.status = status_in.status
    db.commit()
    db.refresh(appt)
    return appointment_to_response(appt)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "RECEPTIONIST"]))
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appt)
    db.commit()
    return None
