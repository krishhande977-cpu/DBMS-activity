from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.database.connection import get_db
from app.models.models import Doctor, Department, User
from app.schemas.schemas import DoctorCreate, DoctorUpdate, DoctorResponse
from app.utils.security import hash_password
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/doctors", tags=["Doctors"])


def generate_doctor_code(db: Session) -> str:
    last_doc = db.query(Doctor).order_by(Doctor.id.desc()).first()
    next_id = (last_doc.id + 1) if last_doc else 1
    return f"DOC-{next_id:03d}"


@router.get("", response_model=List[DoctorResponse])
def get_doctors(
    department_id: Optional[int] = Query(None),
    specialization: Optional[str] = Query(None),
    availability_status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Doctor)

    if department_id:
        query = query.filter(Doctor.department_id == department_id)

    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))

    if availability_status:
        query = query.filter(Doctor.availability_status == availability_status)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Doctor.name.ilike(search_filter),
                Doctor.doctor_code.ilike(search_filter),
                Doctor.specialization.ilike(search_filter)
            )
        )

    doctors = query.all()
    response = []
    for d in doctors:
        resp = DoctorResponse.model_validate(d)
        resp.department_name = d.department.department_name if d.department else None
        response.append(resp)
    return response


@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(doctor_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    resp = DoctorResponse.model_validate(doctor)
    resp.department_name = doctor.department.department_name if doctor.department else None
    return resp


@router.post("", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(
    doctor_in: DoctorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    # Verify department exists
    dept = db.query(Department).filter(Department.id == doctor_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=400, detail="Specified Department does not exist")

    # Check for duplicate email
    existing_email = db.query(Doctor).filter(Doctor.email == doctor_in.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Doctor with this email already exists")

    doctor_code = doctor_in.doctor_code or generate_doctor_code(db)

    # Optional: create a user account for the doctor
    user_id = doctor_in.user_id
    if doctor_in.password and not user_id:
        existing_user = db.query(User).filter(User.email == doctor_in.email).first()
        if existing_user:
            user_id = existing_user.id
        else:
            new_user = User(
                name=doctor_in.name,
                email=doctor_in.email,
                password_hash=hash_password(doctor_in.password),
                role="DOCTOR",
                phone=doctor_in.phone,
                status="ACTIVE"
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user_id = new_user.id

    doc_data = doctor_in.model_dump(exclude={"password", "user_id"})
    doc_data["doctor_code"] = doctor_code
    doc_data["user_id"] = user_id

    new_doc = Doctor(**doc_data)
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    resp = DoctorResponse.model_validate(new_doc)
    resp.department_name = dept.department_name
    return resp


@router.put("/{doctor_id}", response_model=DoctorResponse)
def update_doctor(
    doctor_id: int,
    doctor_in: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    update_data = doctor_in.model_dump(exclude_unset=True)
    if "department_id" in update_data:
        dept = db.query(Department).filter(Department.id == update_data["department_id"]).first()
        if not dept:
            raise HTTPException(status_code=400, detail="Specified Department does not exist")

    for field, val in update_data.items():
        setattr(doctor, field, val)

    db.commit()
    db.refresh(doctor)

    resp = DoctorResponse.model_validate(doctor)
    resp.department_name = doctor.department.department_name if doctor.department else None
    return resp


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    db.delete(doctor)
    db.commit()
    return None
