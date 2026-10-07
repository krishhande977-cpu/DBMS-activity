from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.database.connection import get_db
from app.models.models import Staff, Department
from app.schemas.schemas import StaffCreate, StaffUpdate, StaffResponse
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/staff", tags=["Staff"])


def staff_to_response(s: Staff) -> StaffResponse:
    return StaffResponse(
        id=s.id,
        name=s.name,
        role=s.role,
        department_id=s.department_id,
        phone=s.phone,
        email=s.email,
        salary=s.salary,
        joining_date=s.joining_date,
        status=s.status,
        department_name=s.department.department_name if s.department else None
    )


@router.get("", response_model=List[StaffResponse])
def get_staff_members(
    department_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Staff).outerjoin(Department)

    if department_id:
        query = query.filter(Staff.department_id == department_id)

    if status_filter:
        query = query.filter(Staff.status == status_filter)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Staff.name.ilike(search_filter),
                Staff.role.ilike(search_filter),
                Staff.email.ilike(search_filter),
                Staff.phone.ilike(search_filter)
            )
        )

    staff_list = query.order_by(Staff.name.asc()).all()
    return [staff_to_response(s) for s in staff_list]


@router.get("/{staff_id}", response_model=StaffResponse)
def get_staff(staff_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    s = db.query(Staff).filter(Staff.id == staff_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff_to_response(s)


@router.post("", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
def create_staff(
    staff_in: StaffCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    existing = db.query(Staff).filter(Staff.email == staff_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Staff member with this email already exists")

    if staff_in.department_id:
        dept = db.query(Department).filter(Department.id == staff_in.department_id).first()
        if not dept:
            raise HTTPException(status_code=400, detail="Specified Department does not exist")

    new_staff = Staff(**staff_in.model_dump())
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)
    return staff_to_response(new_staff)


@router.put("/{staff_id}", response_model=StaffResponse)
def update_staff(
    staff_id: int,
    staff_in: StaffUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    s = db.query(Staff).filter(Staff.id == staff_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Staff member not found")

    update_data = staff_in.model_dump(exclude_unset=True)
    if "department_id" in update_data and update_data["department_id"]:
        dept = db.query(Department).filter(Department.id == update_data["department_id"]).first()
        if not dept:
            raise HTTPException(status_code=400, detail="Specified Department does not exist")

    for field, val in update_data.items():
        setattr(s, field, val)

    db.commit()
    db.refresh(s)
    return staff_to_response(s)


@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    s = db.query(Staff).filter(Staff.id == staff_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Staff member not found")

    db.delete(s)
    db.commit()
    return None
