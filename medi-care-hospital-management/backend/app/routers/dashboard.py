from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import date
from decimal import Decimal
from app.database.connection import get_db
from app.models.models import (
    Patient, Doctor, Appointment, Room, Bill, Payment, Department
)
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    total_doctors = db.query(func.count(Doctor.id)).scalar() or 0

    today = date.today()
    today_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.appointment_date == today
    ).scalar() or 0

    available_rooms = db.query(func.count(Room.id)).filter(Room.status == "Available").scalar() or 0
    occupied_rooms = db.query(func.count(Room.id)).filter(Room.status == "Occupied").scalar() or 0

    pending_bills = db.query(func.count(Bill.id)).filter(
        Bill.payment_status.in_(["Pending", "Partially Paid"])
    ).scalar() or 0

    total_revenue = db.query(func.sum(Bill.total_amount)).scalar() or Decimal("0.00")
    total_collected = db.query(func.sum(Payment.amount)).scalar() or Decimal("0.00")
    total_outstanding = max(Decimal("0.00"), Decimal(str(total_revenue)) - Decimal(str(total_collected)))

    # If current user is a doctor, count today's appointments specifically for them as well
    doctor_today_appointments = 0
    if current_user.role == "DOCTOR" and getattr(current_user, "doctor_id", None):
        doctor_today_appointments = db.query(func.count(Appointment.id)).filter(
            Appointment.doctor_id == current_user.doctor_id,
            Appointment.appointment_date == today
        ).scalar() or 0

    # Recent Appointments (Top 5)
    recent_appts_query = db.query(
        Appointment.id,
        Appointment.appointment_date,
        Appointment.appointment_time,
        Appointment.appointment_type,
        Appointment.status,
        Patient.name.label("patient_name"),
        Patient.patient_code,
        Doctor.name.label("doctor_name")
    ).join(Patient, Appointment.patient_id == Patient.id)\
     .join(Doctor, Appointment.doctor_id == Doctor.id)

    if current_user.role == "DOCTOR" and getattr(current_user, "doctor_id", None):
        recent_appts_query = recent_appts_query.filter(Appointment.doctor_id == current_user.doctor_id)

    recent_appointments = [
        {
            "id": r.id,
            "appointment_date": str(r.appointment_date),
            "appointment_time": str(r.appointment_time),
            "appointment_type": r.appointment_type,
            "status": r.status,
            "patient_name": r.patient_name,
            "patient_code": r.patient_code,
            "doctor_name": r.doctor_name
        }
        for r in recent_appts_query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).limit(5).all()
    ]

    # Recent Patients (Top 5)
    recent_patients = [
        {
            "id": p.id,
            "patient_code": p.patient_code,
            "name": p.name,
            "gender": p.gender,
            "blood_group": p.blood_group,
            "phone": p.phone,
            "created_at": p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else None
        }
        for p in db.query(Patient).order_by(Patient.id.desc()).limit(5).all()
    ]

    # Pending Payments / Bills (Top 5)
    pending_bills_query = db.query(
        Bill.id,
        Bill.total_amount,
        Bill.payment_status,
        Bill.generated_at,
        Patient.name.label("patient_name"),
        Patient.patient_code
    ).join(Patient, Bill.patient_id == Patient.id)\
     .filter(Bill.payment_status.in_(["Pending", "Partially Paid"]))\
     .order_by(Bill.generated_at.desc()).limit(5).all()

    pending_payments = []
    for pb in pending_bills_query:
        paid = db.query(func.sum(Payment.amount)).filter(Payment.bill_id == pb.id).scalar() or Decimal("0.00")
        balance = Decimal(str(pb.total_amount)) - Decimal(str(paid))
        pending_payments.append({
            "id": pb.id,
            "patient_name": pb.patient_name,
            "patient_code": pb.patient_code,
            "total_amount": float(pb.total_amount),
            "paid_amount": float(paid),
            "balance_amount": float(balance),
            "payment_status": pb.payment_status,
            "generated_at": pb.generated_at.strftime("%Y-%m-%d") if pb.generated_at else None
        })

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "today_appointments": today_appointments,
        "doctor_today_appointments": doctor_today_appointments,
        "available_rooms": available_rooms,
        "occupied_rooms": occupied_rooms,
        "pending_bills": pending_bills,
        "total_revenue": float(total_revenue),
        "total_collected": float(total_collected),
        "total_outstanding": float(total_outstanding),
        "recent_appointments": recent_appointments,
        "recent_patients": recent_patients,
        "pending_payments": pending_payments
    }


@router.get("/charts")
def get_dashboard_charts(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 1. Monthly Patient Registrations
    patients_by_month_raw = db.execute(text("""
        SELECT DATE_FORMAT(created_at, '%b %Y') AS month_label,
               DATE_FORMAT(created_at, '%Y-%m') AS sort_key,
               COUNT(id) AS patient_count
        FROM patients
        GROUP BY sort_key, month_label
        ORDER BY sort_key ASC
        LIMIT 6
    """)).fetchall()

    monthly_patients = [
        {"month": r[0] if r[0] else "Sep 2026", "patients": int(r[2])}
        for r in patients_by_month_raw
    ]
    if not monthly_patients:
        monthly_patients = [{"month": "Sep 2026", "patients": 20}]

    # 2. Appointments by Department (SQL JOIN + GROUP BY)
    appts_by_dept_raw = db.execute(text("""
        SELECT d.department_name, COUNT(a.id) AS appointment_count
        FROM departments d
        LEFT JOIN doctors doc ON d.id = doc.department_id
        LEFT JOIN appointments a ON doc.id = a.doctor_id
        GROUP BY d.id, d.department_name
        ORDER BY appointment_count DESC
    """)).fetchall()

    appointments_by_dept = [
        {"department": r[0], "count": int(r[1])}
        for r in appts_by_dept_raw
    ]

    # 3. Monthly Revenue Trend (From hospital_revenue_view or bills/payments)
    revenue_trend_raw = db.execute(text("""
        SELECT 
            DATE_FORMAT(b.generated_at, '%b %Y') AS month_label,
            DATE_FORMAT(b.generated_at, '%Y-%m') AS sort_key,
            SUM(b.total_amount) AS billed,
            COALESCE((
                SELECT SUM(p.amount) 
                FROM payments p 
                WHERE DATE_FORMAT(p.payment_date, '%Y-%m') = DATE_FORMAT(b.generated_at, '%Y-%m')
            ), 0.00) AS collected
        FROM bills b
        GROUP BY sort_key, month_label
        ORDER BY sort_key ASC
        LIMIT 6
    """)).fetchall()

    monthly_revenue = [
        {"month": r[0], "billed": float(r[2]), "collected": float(r[3])}
        for r in revenue_trend_raw
    ]

    # 4. Room Occupancy by Room Type
    room_occupancy_raw = db.execute(text("""
        SELECT 
            room_type,
            SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
            SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) AS occupied,
            SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance
        FROM rooms
        GROUP BY room_type
    """)).fetchall()

    room_occupancy = [
        {
            "type": r[0],
            "available": int(r[1]),
            "occupied": int(r[2]),
            "maintenance": int(r[3])
        }
        for r in room_occupancy_raw
    ]

    return {
        "monthly_patients": monthly_patients,
        "appointments_by_dept": appointments_by_dept,
        "monthly_revenue": monthly_revenue,
        "room_occupancy": room_occupancy
    }
