from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database.connection import get_db
from app.models.models import Department, Doctor
from app.schemas.schemas import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # SQL LEFT JOIN + GROUP BY demonstration
    results = db.query(
        Department,
        func.count(Doctor.id).label("doctor_count")
    ).outerjoin(Doctor, Department.id == Doctor.department_id)\
     .group_by(Department.id)\
     .all()

    departments_out = []
    for dept, doc_count in results:
        resp = DepartmentResponse(
            id=dept.id,
            department_name=dept.department_name,
            description=dept.description,
            location=dept.location,
            doctor_count=doc_count
        )
        departments_out.append(resp)
    return departments_out


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    existing = db.query(Department).filter(
        Department.department_name.ilike(dept_in.department_name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name already exists")

    new_dept = Department(**dept_in.model_dump())
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return DepartmentResponse(
        id=new_dept.id,
        department_name=new_dept.department_name,
        description=new_dept.description,
        location=new_dept.location,
        doctor_count=0
    )


@router.put("/{dept_id}", response_model=DepartmentResponse)
def update_department(
    dept_id: int,
    dept_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    update_data = dept_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(dept, field, val)

    db.commit()
    db.refresh(dept)
    doc_count = db.query(func.count(Doctor.id)).filter(Doctor.department_id == dept.id).scalar() or 0
    return DepartmentResponse(
        id=dept.id,
        department_name=dept.department_name,
        description=dept.description,
        location=dept.location,
        doctor_count=doc_count
    )


@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    doctor_count = db.query(func.count(Doctor.id)).filter(Doctor.department_id == dept.id).scalar() or 0
    if doctor_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete department. There are {doctor_count} doctors assigned to it."
        )

    db.delete(dept)
    db.commit()
    return None
