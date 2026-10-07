from sqlalchemy import (
    Column, Integer, String, Text, Date, Time, DateTime, Numeric,
    ForeignKey, Enum, TIMESTAMP
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("ADMIN", "DOCTOR", "RECEPTIONIST"), default="RECEPTIONIST", nullable=False)
    phone = Column(String(20), nullable=True)
    status = Column(Enum("ACTIVE", "INACTIVE"), default="ACTIVE", nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    department_name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    location = Column(String(100), nullable=False)

    doctors = relationship("Doctor", back_populates="department")
    staff_members = relationship("Staff", back_populates="department")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    doctor_code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    specialization = Column(String(100), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(150), unique=True, nullable=False)
    qualification = Column(String(150), nullable=False)
    experience = Column(Integer, default=0, nullable=False)
    consultation_fee = Column(Numeric(10, 2), default=0.00, nullable=False)
    availability_status = Column(Enum("AVAILABLE", "BUSY", "ON_LEAVE"), default="AVAILABLE", nullable=False)

    user = relationship("User", back_populates="doctor_profile")
    department = relationship("Department", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    medical_records = relationship("MedicalRecord", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    admissions = relationship("Admission", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum("MALE", "FEMALE", "OTHER"), nullable=False)
    blood_group = Column(String(10), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(150), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(150), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan")
    bills = relationship("Bill", back_populates="patient", cascade="all, delete-orphan")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    appointment_type = Column(
        Enum("General Checkup", "Follow-up", "Consultation", "Emergency", "Routine"),
        default="General Checkup",
        nullable=False
    )
    reason = Column(Text, nullable=True)
    status = Column(
        Enum("Scheduled", "Confirmed", "Completed", "Cancelled", "No Show"),
        default="Scheduled",
        nullable=False
    )
    created_at = Column(TIMESTAMP, server_default=func.now())

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    medical_record = relationship("MedicalRecord", back_populates="appointment", uselist=False)
    bill = relationship("Bill", back_populates="appointment", uselist=False)


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    diagnosis = Column(String(255), nullable=False)
    symptoms = Column(Text, nullable=False)
    treatment_notes = Column(Text, nullable=True)
    follow_up_date = Column(Date, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="medical_records")
    appointment = relationship("Appointment", back_populates="medical_record")
    prescriptions = relationship("Prescription", back_populates="medical_record", cascade="all, delete-orphan")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    medicine_name = Column(String(150), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)
    duration = Column(String(100), nullable=False)
    instructions = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    medical_record = relationship("MedicalRecord", back_populates="prescriptions")
    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_number = Column(String(20), unique=True, nullable=False)
    room_type = Column(Enum("General", "Semi-Private", "Private", "ICU"), default="General", nullable=False)
    floor = Column(Integer, default=1, nullable=False)
    status = Column(Enum("Available", "Occupied", "Maintenance"), default="Available", nullable=False)
    daily_charge = Column(Numeric(10, 2), default=500.00, nullable=False)

    admissions = relationship("Admission", back_populates="room")


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False)
    admission_date = Column(DateTime, nullable=False)
    discharge_date = Column(DateTime, nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(Enum("Active", "Discharged"), default="Active", nullable=False)

    patient = relationship("Patient", back_populates="admissions")
    doctor = relationship("Doctor", back_populates="admissions")
    room = relationship("Room", back_populates="admissions")
    bill = relationship("Bill", back_populates="admission", uselist=False)


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="SET NULL"), nullable=True)
    admission_id = Column(Integer, ForeignKey("admissions.id", ondelete="SET NULL"), nullable=True)
    consultation_charge = Column(Numeric(10, 2), default=0.00, nullable=False)
    room_charge = Column(Numeric(10, 2), default=0.00, nullable=False)
    medicine_charge = Column(Numeric(10, 2), default=0.00, nullable=False)
    test_charge = Column(Numeric(10, 2), default=0.00, nullable=False)
    other_charge = Column(Numeric(10, 2), default=0.00, nullable=False)
    total_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    payment_status = Column(Enum("Pending", "Partially Paid", "Paid"), default="Pending", nullable=False)
    generated_at = Column(TIMESTAMP, server_default=func.now())

    patient = relationship("Patient", back_populates="bills")
    appointment = relationship("Appointment", back_populates="bill")
    admission = relationship("Admission", back_populates="bill")
    payments = relationship("Payment", back_populates="bill", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bill_id = Column(Integer, ForeignKey("bills.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(Enum("Cash", "Card", "UPI"), default="Cash", nullable=False)
    transaction_reference = Column(String(100), nullable=True)
    payment_date = Column(TIMESTAMP, server_default=func.now())

    bill = relationship("Bill", back_populates="payments")


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    role = Column(String(100), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    phone = Column(String(20), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    salary = Column(Numeric(10, 2), default=0.00, nullable=False)
    joining_date = Column(Date, nullable=False)
    status = Column(Enum("ACTIVE", "ON_LEAVE", "RESIGNED"), default="ACTIVE", nullable=False)

    department = relationship("Department", back_populates="staff_members")
