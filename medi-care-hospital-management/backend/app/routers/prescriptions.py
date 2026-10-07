from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.connection import get_db
from app.models.models import Prescription, MedicalRecord, Patient, Doctor
from app.schemas.schemas import PrescriptionCreate, PrescriptionResponse
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


def prescription_to_response(pr: Prescription) -> PrescriptionResponse:
    return PrescriptionResponse(
        id=pr.id,
        medical_record_id=pr.medical_record_id,
        patient_id=pr.patient_id,
        doctor_id=pr.doctor_id,
        medicine_name=pr.medicine_name,
        dosage=pr.dosage,
        frequency=pr.frequency,
        duration=pr.duration,
        instructions=pr.instructions,
        patient_name=pr.patient.name if pr.patient else None,
        patient_code=pr.patient.patient_code if pr.patient else None,
        doctor_name=pr.doctor.name if pr.doctor else None,
        created_at=pr.created_at
    )


@router.get("", response_model=List[PrescriptionResponse])
def get_prescriptions(
    patient_id: Optional[int] = Query(None),
    medical_record_id: Optional[int] = Query(None),
    doctor_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Prescription).join(Patient).join(Doctor)

    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)

    if medical_record_id:
        query = query.filter(Prescription.medical_record_id == medical_record_id)

    if current_user.role == "DOCTOR" and getattr(current_user, "doctor_id", None):
        query = query.filter(Prescription.doctor_id == current_user.doctor_id)
    elif doctor_id:
        query = query.filter(Prescription.doctor_id == doctor_id)

    prescriptions = query.order_by(Prescription.created_at.desc()).all()
    return [prescription_to_response(p) for p in prescriptions]


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    pr = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription_to_response(pr)


@router.post("", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription(
    pr_in: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "DOCTOR"]))
):
    # Verify medical record
    mr = db.query(MedicalRecord).filter(MedicalRecord.id == pr_in.medical_record_id).first()
    if not mr:
        raise HTTPException(status_code=404, detail="Medical Record not found")

    new_pr = Prescription(**pr_in.model_dump())
    db.add(new_pr)
    db.commit()
    db.refresh(new_pr)
    return prescription_to_response(new_pr)


@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "DOCTOR"]))
):
    pr = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Prescription not found")

    db.delete(pr)
    db.commit()
    return None
