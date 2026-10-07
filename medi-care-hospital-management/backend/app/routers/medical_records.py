from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.connection import get_db
from app.models.models import MedicalRecord, Prescription, Patient, Doctor, Appointment
from app.schemas.schemas import (
    MedicalRecordCreate, MedicalRecordResponse, PrescriptionResponse
)
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])


def record_to_response(mr: MedicalRecord) -> MedicalRecordResponse:
    prescriptions = [
        PrescriptionResponse(
            id=pr.id,
            medical_record_id=pr.medical_record_id,
            patient_id=pr.patient_id,
            doctor_id=pr.doctor_id,
            medicine_name=pr.medicine_name,
            dosage=pr.dosage,
            frequency=pr.frequency,
            duration=pr.duration,
            instructions=pr.instructions,
            patient_name=mr.patient.name if mr.patient else None,
            patient_code=mr.patient.patient_code if mr.patient else None,
            doctor_name=mr.doctor.name if mr.doctor else None,
            created_at=pr.created_at
        )
        for pr in mr.prescriptions
    ]
    return MedicalRecordResponse(
        id=mr.id,
        patient_id=mr.patient_id,
        doctor_id=mr.doctor_id,
        appointment_id=mr.appointment_id,
        diagnosis=mr.diagnosis,
        symptoms=mr.symptoms,
        treatment_notes=mr.treatment_notes,
        follow_up_date=mr.follow_up_date,
        created_at=mr.created_at,
        patient_name=mr.patient.name if mr.patient else None,
        patient_code=mr.patient.patient_code if mr.patient else None,
        doctor_name=mr.doctor.name if mr.doctor else None,
        prescriptions=prescriptions
    )


@router.get("", response_model=List[MedicalRecordResponse])
def get_medical_records(
    patient_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(MedicalRecord).join(Patient).join(Doctor)

    if current_user.role == "DOCTOR" and getattr(current_user, "doctor_id", None):
        query = query.filter(MedicalRecord.doctor_id == current_user.doctor_id)
    elif doctor_id:
        query = query.filter(MedicalRecord.doctor_id == doctor_id)

    if patient_id:
        query = query.filter(MedicalRecord.patient_id == patient_id)

    records = query.order_by(MedicalRecord.created_at.desc()).all()
    return [record_to_response(r) for r in records]


@router.get("/{record_id}", response_model=MedicalRecordResponse)
def get_medical_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    mr = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not mr:
        raise HTTPException(status_code=404, detail="Medical Record not found")
    return record_to_response(mr)


@router.post("", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED)
def create_medical_record(
    record_in: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "DOCTOR"]))
):
    # Verify patient
    patient = db.query(Patient).filter(Patient.id == record_in.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor_id = record_in.doctor_id
    if current_user.role == "DOCTOR" and getattr(current_user, "doctor_id", None):
        doctor_id = current_user.doctor_id

    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    new_record = MedicalRecord(
        patient_id=record_in.patient_id,
        doctor_id=doctor_id,
        appointment_id=record_in.appointment_id,
        diagnosis=record_in.diagnosis,
        symptoms=record_in.symptoms,
        treatment_notes=record_in.treatment_notes,
        follow_up_date=record_in.follow_up_date
    )
    db.add(new_record)
    db.flush()

    # If linked to appointment, mark appointment as Completed
    if record_in.appointment_id:
        appt = db.query(Appointment).filter(Appointment.id == record_in.appointment_id).first()
        if appt:
            appt.status = "Completed"

    # Add any prescriptions attached
    if record_in.prescriptions:
        for p_item in record_in.prescriptions:
            new_p = Prescription(
                medical_record_id=new_record.id,
                patient_id=record_in.patient_id,
                doctor_id=doctor_id,
                medicine_name=p_item.medicine_name,
                dosage=p_item.dosage,
                frequency=p_item.frequency,
                duration=p_item.duration,
                instructions=p_item.instructions
            )
            db.add(new_p)

    db.commit()
    db.refresh(new_record)
    return record_to_response(new_record)
