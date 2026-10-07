from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func
from typing import Optional, List
from decimal import Decimal
from app.database.connection import get_db
from app.models.models import (
    Patient, Appointment, MedicalRecord, Prescription, Admission, Bill, Payment, Doctor
)
from app.schemas.schemas import (
    PatientCreate, PatientUpdate, PatientResponse, PatientDetailResponse,
    AppointmentResponse, MedicalRecordResponse, PrescriptionResponse,
    AdmissionResponse, BillResponse, PaymentResponse
)
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/patients", tags=["Patients"])


def generate_patient_code(db: Session) -> str:
    """Generate next PAT-XXXX code."""
    last_patient = db.query(Patient).order_by(Patient.id.desc()).first()
    next_id = (last_patient.id + 1) if last_patient else 1
    return f"PAT-{next_id:04d}"


@router.get("", response_model=dict)
def get_patients(
    search: Optional[str] = Query(None, description="Search by name, code or phone"),
    gender: Optional[str] = Query(None),
    blood_group: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    sort_by: str = Query("id", pattern="^(id|name|patient_code|date_of_birth)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Patient)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Patient.name.ilike(search_filter),
                Patient.patient_code.ilike(search_filter),
                Patient.phone.ilike(search_filter)
            )
        )

    if gender:
        query = query.filter(Patient.gender == gender)

    if blood_group:
        query = query.filter(Patient.blood_group == blood_group)

    total = query.count()

    order_column = getattr(Patient, sort_by)
    if sort_order == "desc":
        query = query.order_by(desc(order_column))
    else:
        query = query.order_by(order_column)

    patients = query.offset(skip).limit(limit).all()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "patients": [PatientResponse.model_validate(p) for p in patients]
    }


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "RECEPTIONIST"]))
):
    # Auto-generate patient code if not supplied
    patient_code = patient_in.patient_code or generate_patient_code(db)

    # Check for duplicate code
    existing = db.query(Patient).filter(Patient.patient_code == patient_code).first()
    if existing:
        patient_code = generate_patient_code(db)

    patient_dict = patient_in.model_dump()
    patient_dict["patient_code"] = patient_code

    new_patient = Patient(**patient_dict)
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return PatientResponse.model_validate(new_patient)


@router.get("/{patient_id}", response_model=PatientDetailResponse)
def get_patient_detail(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 1. Appointments history with doctor & department
    appointments = []
    for a in sorted(patient.appointments, key=lambda x: (x.appointment_date, x.appointment_time), reverse=True):
        appointments.append(AppointmentResponse(
            id=a.id,
            patient_id=a.patient_id,
            doctor_id=a.doctor_id,
            appointment_date=a.appointment_date,
            appointment_time=a.appointment_time,
            appointment_type=a.appointment_type,
            reason=a.reason,
            status=a.status,
            created_at=a.created_at,
            patient_name=patient.name,
            patient_code=patient.patient_code,
            doctor_name=a.doctor.name if a.doctor else None,
            department_name=a.doctor.department.department_name if a.doctor and a.doctor.department else None
        ))

    # 2. Medical records with prescriptions
    medical_records = []
    for mr in sorted(patient.medical_records, key=lambda x: x.created_at or x.id, reverse=True):
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
                patient_name=patient.name,
                patient_code=patient.patient_code,
                doctor_name=mr.doctor.name if mr.doctor else None,
                created_at=pr.created_at
            )
            for pr in mr.prescriptions
        ]
        medical_records.append(MedicalRecordResponse(
            id=mr.id,
            patient_id=mr.patient_id,
            doctor_id=mr.doctor_id,
            appointment_id=mr.appointment_id,
            diagnosis=mr.diagnosis,
            symptoms=mr.symptoms,
            treatment_notes=mr.treatment_notes,
            follow_up_date=mr.follow_up_date,
            created_at=mr.created_at,
            patient_name=patient.name,
            patient_code=patient.patient_code,
            doctor_name=mr.doctor.name if mr.doctor else None,
            prescriptions=prescriptions
        ))

    # 3. Prescriptions flattened
    all_prescriptions = []
    for pr in sorted(patient.prescriptions, key=lambda x: x.id, reverse=True):
        all_prescriptions.append(PrescriptionResponse(
            id=pr.id,
            medical_record_id=pr.medical_record_id,
            patient_id=pr.patient_id,
            doctor_id=pr.doctor_id,
            medicine_name=pr.medicine_name,
            dosage=pr.dosage,
            frequency=pr.frequency,
            duration=pr.duration,
            instructions=pr.instructions,
            patient_name=patient.name,
            patient_code=patient.patient_code,
            doctor_name=pr.doctor.name if pr.doctor else None,
            created_at=pr.created_at
        ))

    # 4. Admissions
    admissions = []
    for adm in sorted(patient.admissions, key=lambda x: x.admission_date, reverse=True):
        admissions.append(AdmissionResponse(
            id=adm.id,
            patient_id=adm.patient_id,
            doctor_id=adm.doctor_id,
            room_id=adm.room_id,
            admission_date=adm.admission_date,
            discharge_date=adm.discharge_date,
            reason=adm.reason,
            status=adm.status,
            patient_name=patient.name,
            patient_code=patient.patient_code,
            doctor_name=adm.doctor.name if adm.doctor else None,
            room_number=adm.room.room_number if adm.room else None,
            room_type=adm.room.room_type if adm.room else None,
            daily_charge=adm.room.daily_charge if adm.room else Decimal("0.00")
        ))

    # 5. Bills with payments
    bills = []
    for b in sorted(patient.bills, key=lambda x: x.id, reverse=True):
        paid = sum(p.amount for p in b.payments) if b.payments else Decimal("0.00")
        balance = max(Decimal("0.00"), Decimal(str(b.total_amount)) - Decimal(str(paid)))
        payments = [
            PaymentResponse(
                id=pm.id,
                bill_id=pm.bill_id,
                amount=pm.amount,
                payment_method=pm.payment_method,
                transaction_reference=pm.transaction_reference,
                payment_date=pm.payment_date,
                patient_name=patient.name,
                patient_code=patient.patient_code
            )
            for pm in b.payments
        ]
        bills.append(BillResponse(
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
            patient_name=patient.name,
            patient_code=patient.patient_code,
            patient_phone=patient.phone,
            paid_amount=paid,
            balance_amount=balance,
            payments=payments
        ))

    return PatientDetailResponse(
        id=patient.id,
        patient_code=patient.patient_code,
        name=patient.name,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        blood_group=patient.blood_group,
        phone=patient.phone,
        email=patient.email,
        address=patient.address,
        emergency_contact=patient.emergency_contact,
        emergency_phone=patient.emergency_phone,
        created_at=patient.created_at,
        appointments=appointments,
        medical_records=medical_records,
        prescriptions=all_prescriptions,
        admissions=admissions,
        bills=bills
    )


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "RECEPTIONIST"]))
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = patient_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(patient, field, val)

    db.commit()
    db.refresh(patient)
    return PatientResponse.model_validate(patient)


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    db.delete(patient)
    db.commit()
    return None
