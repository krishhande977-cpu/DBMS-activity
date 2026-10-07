from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import date, time, datetime
from decimal import Decimal


# ----------------------------------------------------
# Auth & User Schemas
# ----------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    doctor_name: Optional[str] = None


class DoctorLoginRequest(BaseModel):
    doctor_name: str
    password: Optional[str] = "Doctor@123"
    specialization: Optional[str] = "General Medicine"
    department_id: Optional[int] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "RECEPTIONIST"
    phone: Optional[str] = None
    status: str = "ACTIVE"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None
    doctor_id: Optional[int] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Department Schemas
# ----------------------------------------------------
class DepartmentBase(BaseModel):
    department_name: str
    description: Optional[str] = None
    location: str


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    department_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None


class DepartmentResponse(DepartmentBase):
    id: int
    doctor_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Doctor Schemas
# ----------------------------------------------------
class DoctorBase(BaseModel):
    doctor_code: Optional[str] = None
    name: str
    specialization: str
    department_id: int
    phone: Optional[str] = None
    email: EmailStr
    qualification: str
    experience: int = 0
    consultation_fee: Decimal = Decimal("500.00")
    availability_status: str = "AVAILABLE"


class DoctorCreate(DoctorBase):
    user_id: Optional[int] = None
    password: Optional[str] = None  # If provided, creates login account


class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    department_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    qualification: Optional[str] = None
    experience: Optional[int] = None
    consultation_fee: Optional[Decimal] = None
    availability_status: Optional[str] = None


class DoctorResponse(DoctorBase):
    id: int
    user_id: Optional[int] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Patient Schemas
# ----------------------------------------------------
class PatientBase(BaseModel):
    patient_code: Optional[str] = None
    name: str
    date_of_birth: date
    gender: str
    blood_group: str
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None


class PatientResponse(PatientBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Appointment Schemas
# ----------------------------------------------------
class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: date
    appointment_time: time
    appointment_type: str = "General Checkup"
    reason: Optional[str] = None
    status: str = "Scheduled"


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    appointment_type: Optional[str] = None
    reason: Optional[str] = None
    status: Optional[str] = None
    doctor_id: Optional[int] = None


class AppointmentStatusUpdate(BaseModel):
    status: str


class AppointmentResponse(AppointmentBase):
    id: int
    created_at: Optional[datetime] = None
    patient_name: Optional[str] = None
    patient_code: Optional[str] = None
    doctor_name: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Prescription Schemas
# ----------------------------------------------------
class PrescriptionItemCreate(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None


class PrescriptionCreate(PrescriptionItemCreate):
    medical_record_id: int
    patient_id: int
    doctor_id: int


class PrescriptionResponse(PrescriptionItemCreate):
    id: int
    medical_record_id: int
    patient_id: int
    doctor_id: int
    patient_name: Optional[str] = None
    patient_code: Optional[str] = None
    doctor_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Medical Record Schemas
# ----------------------------------------------------
class MedicalRecordBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    diagnosis: str
    symptoms: str
    treatment_notes: Optional[str] = None
    follow_up_date: Optional[date] = None


class MedicalRecordCreate(MedicalRecordBase):
    prescriptions: Optional[List[PrescriptionItemCreate]] = []


class MedicalRecordResponse(MedicalRecordBase):
    id: int
    created_at: Optional[datetime] = None
    patient_name: Optional[str] = None
    patient_code: Optional[str] = None
    doctor_name: Optional[str] = None
    prescriptions: List[PrescriptionResponse] = []

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Room Schemas
# ----------------------------------------------------
class RoomBase(BaseModel):
    room_number: str
    room_type: str = "General"
    floor: int = 1
    status: str = "Available"
    daily_charge: Decimal = Decimal("500.00")


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    floor: Optional[int] = None
    status: Optional[str] = None
    daily_charge: Optional[Decimal] = None


class RoomResponse(RoomBase):
    id: int
    current_patient_name: Optional[str] = None
    current_admission_id: Optional[int] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Admission Schemas
# ----------------------------------------------------
class AdmissionBase(BaseModel):
    patient_id: int
    doctor_id: int
    room_id: int
    admission_date: datetime
    reason: str


class AdmissionCreate(AdmissionBase):
    pass


class AdmissionDischarge(BaseModel):
    discharge_date: Optional[datetime] = None
    generate_bill: bool = True


class AdmissionResponse(AdmissionBase):
    id: int
    discharge_date: Optional[datetime] = None
    status: str
    patient_name: Optional[str] = None
    patient_code: Optional[str] = None
    doctor_name: Optional[str] = None
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    daily_charge: Optional[Decimal] = None
    calculated_days: Optional[int] = None
    calculated_room_charge: Optional[Decimal] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Bill & Payment Schemas
# ----------------------------------------------------
class BillBase(BaseModel):
    patient_id: int
    appointment_id: Optional[int] = None
    admission_id: Optional[int] = None
    consultation_charge: Decimal = Decimal("0.00")
    room_charge: Decimal = Decimal("0.00")
    medicine_charge: Decimal = Decimal("0.00")
    test_charge: Decimal = Decimal("0.00")
    other_charge: Decimal = Decimal("0.00")


class BillCreate(BillBase):
    pass


class BillUpdate(BaseModel):
    consultation_charge: Optional[Decimal] = None
    room_charge: Optional[Decimal] = None
    medicine_charge: Optional[Decimal] = None
    test_charge: Optional[Decimal] = None
    other_charge: Optional[Decimal] = None
    payment_status: Optional[str] = None


class PaymentBase(BaseModel):
    bill_id: int
    amount: Decimal
    payment_method: str = "Cash"
    transaction_reference: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    id: int
    payment_date: Optional[datetime] = None
    patient_name: Optional[str] = None
    patient_code: Optional[str] = None

    class Config:
        from_attributes = True


class BillResponse(BillBase):
    id: int
    total_amount: Decimal
    payment_status: str
    generated_at: Optional[datetime] = None
    patient_name: Optional[str] = None
    patient_code: Optional[str] = None
    patient_phone: Optional[str] = None
    paid_amount: Decimal = Decimal("0.00")
    balance_amount: Decimal = Decimal("0.00")
    payments: List[PaymentResponse] = []

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Staff Schemas
# ----------------------------------------------------
class StaffBase(BaseModel):
    name: str
    role: str
    department_id: Optional[int] = None
    phone: str
    email: EmailStr
    salary: Decimal = Decimal("0.00")
    joining_date: date
    status: str = "ACTIVE"


class StaffCreate(StaffBase):
    pass


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    salary: Optional[Decimal] = None
    joining_date: Optional[date] = None
    status: Optional[str] = None


class StaffResponse(StaffBase):
    id: int
    department_name: Optional[str] = None

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Patient Detailed Profile View
# ----------------------------------------------------
class PatientDetailResponse(PatientResponse):
    appointments: List[AppointmentResponse] = []
    medical_records: List[MedicalRecordResponse] = []
    prescriptions: List[PrescriptionResponse] = []
    admissions: List[AdmissionResponse] = []
    bills: List[BillResponse] = []


# ----------------------------------------------------
# Dashboard & Reports Schemas
# ----------------------------------------------------
class DashboardStats(BaseModel):
    total_patients: int
    total_doctors: int
    today_appointments: int
    available_rooms: int
    occupied_rooms: int
    pending_bills: int
    total_revenue: Decimal
    total_collected: Decimal
    total_outstanding: Decimal
