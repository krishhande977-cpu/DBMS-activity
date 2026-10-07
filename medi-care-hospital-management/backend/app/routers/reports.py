from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from datetime import date
from app.database.connection import get_db
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/patients")
def get_patient_report(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # SQL Aggregate: Registrations by Blood Group
    blood_groups = db.execute(text("""
        SELECT blood_group, COUNT(id) AS count
        FROM patients
        GROUP BY blood_group
        ORDER BY count DESC
    """)).fetchall()

    # SQL Aggregate: Registrations by Gender
    genders = db.execute(text("""
        SELECT gender, COUNT(id) AS count
        FROM patients
        GROUP BY gender
    """)).fetchall()

    # SQL Aggregate: Registrations by Month
    monthly = db.execute(text("""
        SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(id) AS count
        FROM patients
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    """)).fetchall()

    # Detailed list
    details = db.execute(text("""
        SELECT id, patient_code, name, date_of_birth, gender, blood_group, phone, created_at
        FROM patients
        ORDER BY id DESC
    """)).fetchall()

    return {
        "by_blood_group": [{"blood_group": r[0], "count": int(r[1])} for r in blood_groups],
        "by_gender": [{"gender": r[0], "count": int(r[1])} for r in genders],
        "by_month": [{"month": r[0] if r[0] else "Sep 2026", "count": int(r[1])} for r in monthly],
        "total_patients": len(details),
        "data": [
            {
                "id": r[0],
                "patient_code": r[1],
                "name": r[2],
                "date_of_birth": str(r[3]),
                "gender": r[4],
                "blood_group": r[5],
                "phone": r[6],
                "created_at": str(r[7])
            }
            for r in details
        ]
    }


@router.get("/appointments")
def get_appointment_report(
    doctor_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Uses SQL View: patient_appointment_view
    view_data = db.execute(text("""
        SELECT appointment_id, patient_code, patient_name, doctor_name, department,
               appointment_date, appointment_time, appointment_type, appointment_status
        FROM patient_appointment_view
        ORDER BY appointment_date DESC, appointment_time DESC
    """)).fetchall()

    by_status = db.execute(text("""
        SELECT status, COUNT(id) AS count
        FROM appointments
        GROUP BY status
    """)).fetchall()

    by_type = db.execute(text("""
        SELECT appointment_type, COUNT(id) AS count
        FROM appointments
        GROUP BY appointment_type
    """)).fetchall()

    return {
        "by_status": [{"status": r[0], "count": int(r[1])} for r in by_status],
        "by_type": [{"type": r[0], "count": int(r[1])} for r in by_type],
        "total_appointments": len(view_data),
        "data": [
            {
                "id": r[0],
                "patient_code": r[1],
                "patient_name": r[2],
                "doctor_name": r[3],
                "department": r[4],
                "appointment_date": str(r[5]),
                "appointment_time": str(r[6]),
                "appointment_type": r[7],
                "status": r[8]
            }
            for r in view_data
        ]
    }


@router.get("/departments")
def get_department_report(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # SQL Multi-table Aggregation with JOIN & GROUP BY
    rows = db.execute(text("""
        SELECT 
            d.id,
            d.department_name,
            d.location,
            COUNT(DISTINCT doc.id) AS total_doctors,
            COUNT(DISTINCT a.id) AS total_appointments,
            COUNT(DISTINCT s.id) AS total_staff
        FROM departments d
        LEFT JOIN doctors doc ON d.id = doc.department_id
        LEFT JOIN appointments a ON doc.id = a.doctor_id
        LEFT JOIN staff s ON d.id = s.department_id
        GROUP BY d.id, d.department_name, d.location
        ORDER BY total_appointments DESC
    """)).fetchall()

    return {
        "data": [
            {
                "id": r[0],
                "department_name": r[1],
                "location": r[2],
                "total_doctors": int(r[3]),
                "total_appointments": int(r[4]),
                "total_staff": int(r[5])
            }
            for r in rows
        ]
    }


@router.get("/revenue")
def get_revenue_report(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Uses SQL View: hospital_revenue_view
    view_data = db.execute(text("""
        SELECT 
            billing_month,
            total_invoices,
            total_consultation_revenue,
            total_room_revenue,
            total_medicine_revenue,
            total_test_revenue,
            total_other_revenue,
            total_billed_amount,
            total_collected_amount,
            total_outstanding_amount
        FROM hospital_revenue_view
        ORDER BY billing_month DESC
    """)).fetchall()

    # Overall totals
    totals_row = db.execute(text("""
        SELECT 
            COUNT(id) AS total_bills,
            COALESCE(SUM(consultation_charge), 0),
            COALESCE(SUM(room_charge), 0),
            COALESCE(SUM(medicine_charge), 0),
            COALESCE(SUM(test_charge), 0),
            COALESCE(SUM(other_charge), 0),
            COALESCE(SUM(total_amount), 0)
        FROM bills
    """)).fetchone()

    collected_total = db.execute(text("SELECT COALESCE(SUM(amount), 0) FROM payments")).scalar() or 0

    return {
        "monthly_breakdown": [
            {
                "billing_month": r[0],
                "total_invoices": int(r[1]),
                "consultation_revenue": float(r[2]),
                "room_revenue": float(r[3]),
                "medicine_revenue": float(r[4]),
                "test_revenue": float(r[5]),
                "other_revenue": float(r[6]),
                "billed_amount": float(r[7]),
                "collected_amount": float(r[8]),
                "outstanding_amount": float(r[9])
            }
            for r in view_data
        ],
        "summary": {
            "total_bills": int(totals_row[0]) if totals_row else 0,
            "total_consultation": float(totals_row[1]) if totals_row else 0,
            "total_room": float(totals_row[2]) if totals_row else 0,
            "total_medicine": float(totals_row[3]) if totals_row else 0,
            "total_tests": float(totals_row[4]) if totals_row else 0,
            "total_other": float(totals_row[5]) if totals_row else 0,
            "total_billed": float(totals_row[6]) if totals_row else 0,
            "total_collected": float(collected_total),
            "total_outstanding": float(totals_row[6]) - float(collected_total) if totals_row else 0
        }
    }


@router.get("/room-occupancy")
def get_room_occupancy_report(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Uses SQL View: room_occupancy_view
    view_data = db.execute(text("""
        SELECT 
            room_id, room_number, room_type, floor, room_status, daily_charge,
            patient_name, patient_code, attending_doctor, admission_date, admission_status
        FROM room_occupancy_view
        ORDER BY floor ASC, room_number ASC
    """)).fetchall()

    summary_raw = db.execute(text("""
        SELECT 
            COUNT(id) AS total_rooms,
            SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
            SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) AS occupied,
            SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance
        FROM rooms
    """)).fetchone()

    total_rooms = int(summary_raw[0]) if summary_raw else 0
    occupied = int(summary_raw[2]) if summary_raw else 0
    occupancy_rate = round((occupied / total_rooms * 100), 1) if total_rooms > 0 else 0

    return {
        "summary": {
            "total_rooms": total_rooms,
            "available_rooms": int(summary_raw[1]) if summary_raw else 0,
            "occupied_rooms": occupied,
            "maintenance_rooms": int(summary_raw[3]) if summary_raw else 0,
            "occupancy_rate_percent": occupancy_rate
        },
        "rooms": [
            {
                "room_id": r[0],
                "room_number": r[1],
                "room_type": r[2],
                "floor": r[3],
                "status": r[4],
                "daily_charge": float(r[5]),
                "patient_name": r[6],
                "patient_code": r[7],
                "attending_doctor": r[8],
                "admission_date": str(r[9]) if r[9] else None,
                "admission_status": r[10]
            }
            for r in view_data
        ]
    }


@router.get("/payments")
def get_payment_report(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    by_method = db.execute(text("""
        SELECT payment_method, COUNT(id) AS count, SUM(amount) AS total_amount
        FROM payments
        GROUP BY payment_method
    """)).fetchall()

    by_date = db.execute(text("""
        SELECT DATE_FORMAT(payment_date, '%Y-%m-%d') AS p_date, COUNT(id) AS count, SUM(amount) AS total_amount
        FROM payments
        GROUP BY DATE_FORMAT(payment_date, '%Y-%m-%d')
        ORDER BY p_date DESC
    """)).fetchall()

    details = db.execute(text("""
        SELECT p.id, p.bill_id, p.amount, p.payment_method, p.transaction_reference, p.payment_date,
               pt.name AS patient_name, pt.patient_code
        FROM payments p
        JOIN bills b ON p.bill_id = b.id
        JOIN patients pt ON b.patient_id = pt.id
        ORDER BY p.payment_date DESC
    """)).fetchall()

    return {
        "by_method": [{"method": r[0], "count": int(r[1]), "total": float(r[2])} for r in by_method],
        "by_date": [{"date": r[0], "count": int(r[1]), "total": float(r[2])} for r in by_date],
        "total_payments_count": len(details),
        "total_collected": sum(float(r[2]) for r in details),
        "data": [
            {
                "id": r[0],
                "bill_id": r[1],
                "amount": float(r[2]),
                "payment_method": r[3],
                "transaction_reference": r[4],
                "payment_date": str(r[5]),
                "patient_name": r[6],
                "patient_code": r[7]
            }
            for r in details
        ]
    }
