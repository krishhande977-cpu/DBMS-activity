from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.connection import get_db
from app.models.models import Room, Admission, Patient
from app.schemas.schemas import RoomCreate, RoomUpdate, RoomResponse
from app.dependencies.auth import get_current_user, require_roles

router = APIRouter(prefix="/rooms", tags=["Rooms"])


def room_to_response(r: Room, db: Session) -> RoomResponse:
    # Check if there is an active admission in this room
    active_adm = db.query(Admission).filter(
        Admission.room_id == r.id,
        Admission.status == "Active"
    ).first()

    patient_name = None
    admission_id = None
    if active_adm:
        admission_id = active_adm.id
        patient = db.query(Patient).filter(Patient.id == active_adm.patient_id).first()
        if patient:
            patient_name = patient.name

    return RoomResponse(
        id=r.id,
        room_number=r.room_number,
        room_type=r.room_type,
        floor=r.floor,
        status=r.status,
        daily_charge=r.daily_charge,
        current_patient_name=patient_name,
        current_admission_id=admission_id
    )


@router.get("", response_model=List[RoomResponse])
def get_rooms(
    status_filter: Optional[str] = Query(None, alias="status"),
    room_type: Optional[str] = Query(None),
    floor: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Room)

    if status_filter:
        query = query.filter(Room.status == status_filter)

    if room_type:
        query = query.filter(Room.room_type == room_type)

    if floor:
        query = query.filter(Room.floor == floor)

    rooms = query.order_by(Room.floor.asc(), Room.room_number.asc()).all()
    return [room_to_response(r, db) for r in rooms]


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = db.query(Room).filter(Room.id == room_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Room not found")
    return room_to_response(r, db)


@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room_in: RoomCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    existing = db.query(Room).filter(Room.room_number == room_in.room_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room number already exists")

    new_room = Room(**room_in.model_dump())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return room_to_response(new_room, db)


@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    room_in: RoomUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN", "RECEPTIONIST"]))
):
    r = db.query(Room).filter(Room.id == room_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Room not found")

    update_data = room_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(r, field, val)

    db.commit()
    db.refresh(r)
    return room_to_response(r, db)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["ADMIN"]))
):
    r = db.query(Room).filter(Room.id == room_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Room not found")

    if r.status == "Occupied":
        raise HTTPException(status_code=400, detail="Cannot delete an occupied room")

    db.delete(r)
    db.commit()
    return None
