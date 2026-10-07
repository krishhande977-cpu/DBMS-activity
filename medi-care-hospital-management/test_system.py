import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=" * 60)
    print("MEDICARE HOSPITAL MANAGEMENT SYSTEM - AUTOMATED VERIFICATION")
    print("=" * 60)

    # 1. Health Check
    print("\n[1] Testing /api/health...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("    [PASS] Health check OK:", r.json())

    # 2. Authentication: Admin Login
    print("\n[2] Testing Admin Login (admin@medicare.com)...")
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@medicare.com", "password": "Admin@123"})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    admin_token = r.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("    [PASS] Admin token obtained. Role:", r.json()["user"]["role"])

    # 3. Authentication: Doctor Login by Doctor Name
    print("\n[3] Testing Doctor Login with Doctor Name (Dr. Rajesh Sharma)...")
    r = requests.post(f"{BASE_URL}/auth/doctor-login", json={"doctor_name": "Dr. Rajesh Sharma", "password": "Doctor@123"})
    assert r.status_code == 200, f"Doctor name login failed: {r.text}"
    doctor_data = r.json()["user"]
    doctor_token = r.json()["access_token"]
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}
    print(f"    [PASS] Doctor authenticated by Name! Name: {doctor_data['name']}, Doctor ID: {doctor_data['doctor_id']}, Role: {doctor_data['role']}")

    # 4. Authentication: Receptionist Login
    print("\n[4] Testing Receptionist Login (reception@medicare.com)...")
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "reception@medicare.com", "password": "Reception@123"})
    assert r.status_code == 200, f"Receptionist login failed: {r.text}"
    print("    [PASS] Receptionist authenticated. Role:", r.json()["user"]["role"])

    # 5. Dashboard Stats
    print("\n[5] Testing /api/dashboard/stats...")
    r = requests.get(f"{BASE_URL}/dashboard/stats", headers=admin_headers)
    assert r.status_code == 200, f"Dashboard stats failed: {r.text}"
    stats = r.json()
    print(f"    [PASS] Stats: {stats['total_patients']} Patients, {stats['total_doctors']} Doctors, ${stats['total_revenue']} Revenue")

    # 6. Patients CRUD
    print("\n[6] Testing Patient Creation & Retrieval...")
    new_patient = {
        "name": "Test Patient Viva",
        "date_of_birth": "1995-05-15",
        "gender": "FEMALE",
        "blood_group": "AB+",
        "phone": "+91 9998887776",
        "email": "viva.test@example.com",
        "address": "College Campus Hostel",
        "emergency_contact": "Guardian",
        "emergency_phone": "+91 9998887770"
    }
    r = requests.post(f"{BASE_URL}/patients", json=new_patient, headers=admin_headers)
    assert r.status_code == 201, f"Create patient failed: {r.text}"
    created_patient = r.json()
    print(f"    [PASS] Created Patient: {created_patient['name']} with Code: {created_patient['patient_code']}")

    # 7. Double-Booking Prevention Rule
    print("\n[7] Testing Appointment Double-Booking Constraint...")
    # Dr. Rajesh Sharma (ID 1) has an appointment on 2026-09-24 at 10:00:00
    duplicate_slot = {
        "patient_id": created_patient["id"],
        "doctor_id": 1,
        "appointment_date": "2026-09-24",
        "appointment_time": "10:00:00",
        "appointment_type": "Consultation",
        "reason": "Test duplicate collision",
        "status": "Scheduled"
    }
    r = requests.post(f"{BASE_URL}/appointments", json=duplicate_slot, headers=admin_headers)
    assert r.status_code == 409, f"Double-booking prevention failed, expected 409 but got {r.status_code}"
    print(f"    [PASS] Double-booking successfully blocked! Response 409: {r.json()['detail']}")

    # 8. Available Slot Booking (Dynamic unique slot)
    print("\n[8] Testing Booking in an Available Slot...")
    import time
    ts = int(time.time())
    unique_date = f"2027-{((ts // 86400) % 11) + 1:02d}-{((ts // 3600) % 25) + 1:02d}"
    unique_time = f"{((ts // 60) % 8) + 9:02d}:{ts % 60:02d}:00"
    valid_slot = {
        "patient_id": created_patient["id"],
        "doctor_id": 1,
        "appointment_date": unique_date,
        "appointment_time": unique_time,
        "appointment_type": "Consultation",
        "reason": "General checkup",
        "status": "Scheduled"
    }
    r = requests.post(f"{BASE_URL}/appointments", json=valid_slot, headers=admin_headers)
    assert r.status_code == 201, f"Valid appointment failed: {r.text}"
    created_appt = r.json()
    print(f"    [PASS] Appointment booked successfully: ID {created_appt['id']} for {created_appt['appointment_date']} at {created_appt['appointment_time']}")

    # 9. Medical Record & Prescription Filing by Doctor
    print("\n[9] Testing Medical Record & Multiple Prescriptions by Doctor...")
    record_payload = {
        "patient_id": created_patient["id"],
        "doctor_id": 1,
        "appointment_id": created_appt["id"],
        "diagnosis": "Acute Pharyngitis & Seasonal Allergies",
        "symptoms": "Sore throat, sneezing, mild fever",
        "treatment_notes": "Advised warm fluids and hydration",
        "follow_up_date": "2026-10-22",
        "prescriptions": [
            {
                "medicine_name": "Azithromycin",
                "dosage": "500 mg",
                "frequency": "Once daily",
                "duration": "3 days",
                "instructions": "Take before meal"
            },
            {
                "medicine_name": "Levocetirizine",
                "dosage": "5 mg",
                "frequency": "Once daily at night",
                "duration": "5 days",
                "instructions": "May cause mild drowsiness"
            }
        ]
    }
    r = requests.post(f"{BASE_URL}/medical-records", json=record_payload, headers=doctor_headers)
    assert r.status_code == 201, f"Create medical record failed: {r.text}"
    created_mr = r.json()
    print(f"    [PASS] Medical record filed: ID {created_mr['id']} with {len(created_mr['prescriptions'])} prescriptions")

    # 10. Inpatient Admission (Testing Transactional Room Occupancy)
    print("\n[10] Testing Inpatient Admission & Bed State Management...")
    # Find an available room
    r = requests.get(f"{BASE_URL}/rooms?status=Available", headers=admin_headers)
    avail_rooms = r.json()
    assert len(avail_rooms) > 0, "No available rooms found"
    target_room = avail_rooms[0]

    admit_payload = {
        "patient_id": created_patient["id"],
        "doctor_id": 1,
        "room_id": target_room["id"],
        "admission_date": "2026-09-27T10:00:00",
        "reason": "Observation and therapy"
    }
    r = requests.post(f"{BASE_URL}/admissions", json=admit_payload, headers=admin_headers)
    assert r.status_code == 201, f"Admission failed: {r.text}"
    created_adm = r.json()
    print(f"    [PASS] Patient admitted to Room {target_room['room_number']}. Admission ID: {created_adm['id']}")

    # Verify room status transitioned to Occupied
    r = requests.get(f"{BASE_URL}/rooms/{target_room['id']}", headers=admin_headers)
    assert r.json()["status"] == "Occupied", "Room status did not update to Occupied"
    print(f"    [PASS] Transaction Verified: Room {target_room['room_number']} status is now OCCUPIED")

    # 11. Inpatient Discharge (Testing Transactional Room Release & Billing)
    print("\n[11] Testing Patient Discharge & Automatic Bill Generation...")
    discharge_payload = {
        "discharge_date": "2026-09-29T10:00:00",
        "generate_bill": True
    }
    r = requests.put(f"{BASE_URL}/admissions/{created_adm['id']}/discharge", json=discharge_payload, headers=admin_headers)
    assert r.status_code == 200, f"Discharge failed: {r.text}"
    discharged_adm = r.json()
    print(f"    [PASS] Discharged: Stayed {discharged_adm['calculated_days']} days, Room Charge: ${discharged_adm['calculated_room_charge']}")

    # Verify room status transitioned back to Available
    r = requests.get(f"{BASE_URL}/rooms/{target_room['id']}", headers=admin_headers)
    assert r.json()["status"] == "Available", "Room status did not reset to Available"
    print(f"    [PASS] Transaction Verified: Room {target_room['room_number']} status is now AVAILABLE")

    # 12. Billing & Overpayment Prevention Rule
    print("\n[12] Testing Billing & Overpayment Prevention Constraint...")
    # Find the newly generated bill for this admission
    r = requests.get(f"{BASE_URL}/bills?patient_id={created_patient['id']}", headers=admin_headers)
    bills = r.json()
    assert len(bills) > 0, "No bills found for patient"
    active_bill = bills[0]
    balance = float(active_bill["balance_amount"])
    print(f"    [PASS] Invoice #{active_bill['id']} loaded. Total: ${active_bill['total_amount']}, Balance: ${balance}")

    # Attempt payment greater than balance
    overpay = {
        "bill_id": active_bill["id"],
        "amount": balance + 500.0,
        "payment_method": "Card",
        "transaction_reference": "TXN-OVERFLOW"
    }
    r = requests.post(f"{BASE_URL}/payments", json=overpay, headers=admin_headers)
    assert r.status_code == 400, f"Expected 400 for overpayment, got {r.status_code}"
    print(f"    [PASS] Overpayment strictly blocked: {r.json()['detail']}")

    # Process valid partial payment
    partial_pay = {
        "bill_id": active_bill["id"],
        "amount": round(balance / 2, 2),
        "payment_method": "UPI",
        "transaction_reference": "UPI-VIVA-SUCCESS"
    }
    r = requests.post(f"{BASE_URL}/payments", json=partial_pay, headers=admin_headers)
    assert r.status_code == 201, f"Valid payment failed: {r.text}"
    print(f"    [PASS] Payment of ${partial_pay['amount']} recorded successfully!")

    # Verify bill status updated to Partially Paid
    r = requests.get(f"{BASE_URL}/bills/{active_bill['id']}", headers=admin_headers)
    assert r.json()["payment_status"] == "Partially Paid"
    print(f"    [PASS] Bill status automatically updated to: {r.json()['payment_status']}")

    # 13. Reports from SQL Views
    print("\n[13] Testing Database View: hospital_revenue_view...")
    r = requests.get(f"{BASE_URL}/reports/revenue", headers=admin_headers)
    assert r.status_code == 200, f"Revenue report failed: {r.text}"
    rev_data = r.json()
    print(f"    [PASS] Revenue View OK: {len(rev_data['monthly_breakdown'])} monthly periods aggregated")

    print("\n[14] Testing Database View: room_occupancy_view...")
    r = requests.get(f"{BASE_URL}/reports/room-occupancy", headers=admin_headers)
    assert r.status_code == 200, f"Room occupancy report failed: {r.text}"
    occ_data = r.json()
    print(f"    [PASS] Room Occupancy View OK: {occ_data['summary']['total_rooms']} rooms tracked, {occ_data['summary']['occupancy_rate_percent']}% occupancy rate")

    print("\n" + "=" * 60)
    print("ALL 14 INTEGRATION & DBMS CONSTRAINT TESTS PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
