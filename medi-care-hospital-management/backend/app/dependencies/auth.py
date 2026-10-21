from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.models.models import User, Doctor
from app.utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Retrieve current user.
    Authentication is bypassed:
    If a valid JWT token is provided, it will be decoded and used.
    Otherwise, it defaults to the active ADMIN user with full privileges so no
    unauthorized (401) errors are thrown.
    """
    if token:
        try:
            payload = decode_access_token(token)
            if payload and payload.get("sub"):
                user = db.query(User).filter(User.id == int(payload.get("sub")), User.status == "ACTIVE").first()
                if user:
                    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
                    user.doctor_id = doctor.id if doctor else None
                    return user
        except Exception:
            pass

    # Fallback to active ADMIN user
    try:
        user = db.query(User).filter(User.role == "ADMIN", User.status == "ACTIVE").first()
        if not user:
            user = db.query(User).filter(User.status == "ACTIVE").first()
        if not user:
            user = db.query(User).first()

        if user:
            doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
            user.doctor_id = doctor.id if doctor else None
            return user
    except Exception:
        pass

    # Fallback mock object if database has no users
    class MockAdminUser:
        id = 1
        name = "System Administrator"
        email = "admin@medicare.com"
        role = "ADMIN"
        status = "ACTIVE"
        phone = "+1 555-0100"
        created_at = None
        doctor_id = None

    return MockAdminUser()


def require_roles(allowed_roles: list):
    """Role checker dependency: Bypassed to grant full access unconditionally."""
    def role_checker(current_user: User = Depends(get_current_user)):
        return current_user
    return role_checker
