from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.connection import get_db
from app.models.models import User, Doctor, Department
from app.schemas.schemas import LoginRequest, DoctorLoginRequest, TokenResponse, UserResponse
from app.utils.security import verify_password, hash_password, create_access_token
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def generate_doc_code(db: Session) -> str:
    last_doc = db.query(Doctor).order_by(Doctor.id.desc()).first()
    next_id = (last_doc.id + 1) if last_doc else 1
    return f"DOC-{next_id:03d}"


@router.get("/doctors-list", response_model=List[dict])
def get_public_doctors_list(db: Session = Depends(get_db)):
    """Provides a list of registered doctor names and specializations for easy selection on the login page."""
    doctors = db.query(Doctor).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "doctor_code": d.doctor_code,
            "specialization": d.specialization,
            "department_name": d.department.department_name if d.department else "General Medicine"
        }
        for d in doctors
    ]


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact system administrator."
        )

    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()

    # If doctor_name was explicitly given by the doctor during login, update doctor name
    if login_data.doctor_name and login_data.doctor_name.strip():
        new_name = login_data.doctor_name.strip()
        user.name = new_name
        if doctor:
            doctor.name = new_name
        db.commit()
        db.refresh(user)
        if doctor:
            db.refresh(doctor)

    doctor_id = doctor.id if doctor else None

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "doctor_id": doctor_id
    })

    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        phone=user.phone,
        status=user.status,
        created_at=user.created_at,
        doctor_id=doctor_id
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_response
    )


@router.post("/doctor-login", response_model=TokenResponse)
def doctor_login_by_name(login_data: DoctorLoginRequest, db: Session = Depends(get_db)):
    """
    Allows a doctor to log in by providing their doctor name directly on the login page.
    If the doctor already exists, authenticate and log in as that doctor.
    If it's a new doctor name, register the doctor with that name and log in.
    """
    raw_name = login_data.doctor_name.strip()
    if not raw_name:
        raise HTTPException(status_code=400, detail="Doctor name cannot be empty")

    # Format doctor name gracefully (ensure Dr. prefix if not already present)
    doctor_name = raw_name if raw_name.lower().startswith("dr.") or raw_name.lower().startswith("dr ") else f"Dr. {raw_name}"

    # Check if a doctor with this name already exists in the database
    doctor = db.query(Doctor).filter(Doctor.name.ilike(doctor_name)).first()

    if doctor:
        # Check linked user account
        user = None
        if doctor.user_id:
            user = db.query(User).filter(User.id == doctor.user_id).first()

        if not user:
            # Create user account linked to this doctor
            email_slug = doctor.name.lower().replace("dr.", "").replace("dr ", "").replace(" ", "").strip()
            user_email = f"{email_slug}@medicare.com"
            # Ensure unique email
            existing_user = db.query(User).filter(User.email == user_email).first()
            if existing_user:
                user_email = f"{email_slug}{doctor.id}@medicare.com"

            user = User(
                name=doctor.name,
                email=user_email,
                password_hash=hash_password(login_data.password or "Doctor@123"),
                role="DOCTOR",
                phone=doctor.phone,
                status="ACTIVE"
            )
            db.add(user)
            db.flush()
            doctor.user_id = user.id
            db.commit()
            db.refresh(user)
    else:
        # Create a new doctor with the name given by the user
        dept_id = login_data.department_id
        if not dept_id:
            first_dept = db.query(Department).first()
            dept_id = first_dept.id if first_dept else 1

        email_slug = doctor_name.lower().replace("dr.", "").replace("dr ", "").replace(" ", "").strip()
        user_email = f"{email_slug}@medicare.com"
        existing_user = db.query(User).filter(User.email == user_email).first()
        if existing_user:
            import time
            user_email = f"{email_slug}{int(time.time()) % 1000}@medicare.com"

        user = User(
            name=doctor_name,
            email=user_email,
            password_hash=hash_password(login_data.password or "Doctor@123"),
            role="DOCTOR",
            phone="+91 9876543200",
            status="ACTIVE"
        )
        db.add(user)
        db.flush()

        doc_code = generate_doc_code(db)
        doctor = Doctor(
            user_id=user.id,
            doctor_code=doc_code,
            name=doctor_name,
            specialization=login_data.specialization or "Consultant Physician",
            department_id=dept_id,
            phone="+91 9876543200",
            email=user_email,
            qualification="MBBS, MD",
            experience=10,
            consultation_fee=700.00,
            availability_status="AVAILABLE"
        )
        db.add(doctor)
        db.commit()
        db.refresh(user)
        db.refresh(doctor)

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": doctor.name,
        "doctor_id": doctor.id
    })

    user_response = UserResponse(
        id=user.id,
        name=doctor.name,
        email=user.email,
        role=user.role,
        phone=user.phone,
        status=user.status,
        created_at=user.created_at,
        doctor_id=doctor.id
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        phone=current_user.phone,
        status=current_user.status,
        created_at=current_user.created_at,
        doctor_id=getattr(current_user, "doctor_id", None)
    )
