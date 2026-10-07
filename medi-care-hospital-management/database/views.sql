-- =======================================================
-- MediCare - Hospital Management System
-- Database Views Definition (MySQL / MariaDB)
-- Database Name: medicare_hospital
-- =======================================================

USE medicare_hospital;

-- Drop existing views
DROP VIEW IF EXISTS patient_appointment_view;
DROP VIEW IF EXISTS doctor_schedule_view;
DROP VIEW IF EXISTS hospital_revenue_view;
DROP VIEW IF EXISTS room_occupancy_view;

-- -------------------------------------------------------
-- 1. Patient Appointment View
-- Combines patient, doctor, department and appointment data
-- -------------------------------------------------------
CREATE OR REPLACE VIEW patient_appointment_view AS
SELECT 
    a.id AS appointment_id,
    p.id AS patient_id,
    p.patient_code,
    p.name AS patient_name,
    p.phone AS patient_phone,
    d.id AS doctor_id,
    d.doctor_code,
    d.name AS doctor_name,
    dept.department_name AS department,
    a.appointment_date,
    a.appointment_time,
    a.appointment_type,
    a.reason,
    a.status AS appointment_status,
    a.created_at
FROM appointments a
INNER JOIN patients p ON a.patient_id = p.id
INNER JOIN doctors d ON a.doctor_id = d.id
INNER JOIN departments dept ON d.department_id = dept.id;

-- -------------------------------------------------------
-- 2. Doctor Schedule View
-- Shows doctor schedules and their appointments
-- -------------------------------------------------------
CREATE OR REPLACE VIEW doctor_schedule_view AS
SELECT 
    d.id AS doctor_id,
    d.doctor_code,
    d.name AS doctor_name,
    d.specialization,
    d.availability_status,
    dept.department_name,
    a.id AS appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.appointment_type,
    a.status AS appointment_status,
    p.patient_code,
    p.name AS patient_name,
    p.phone AS patient_phone
FROM doctors d
INNER JOIN departments dept ON d.department_id = dept.id
LEFT JOIN appointments a ON d.id = a.doctor_id
LEFT JOIN patients p ON a.patient_id = p.id;

-- -------------------------------------------------------
-- 3. Hospital Revenue View
-- Demonstrates SQL GROUP BY, Aggregates, and Subqueries
-- -------------------------------------------------------
CREATE OR REPLACE VIEW hospital_revenue_view AS
SELECT 
    DATE_FORMAT(b.generated_at, '%Y-%m') AS billing_month,
    COUNT(b.id) AS total_invoices,
    SUM(b.consultation_charge) AS total_consultation_revenue,
    SUM(b.room_charge) AS total_room_revenue,
    SUM(b.medicine_charge) AS total_medicine_revenue,
    SUM(b.test_charge) AS total_test_revenue,
    SUM(b.other_charge) AS total_other_revenue,
    SUM(b.total_amount) AS total_billed_amount,
    COALESCE((
        SELECT SUM(p.amount) 
        FROM payments p 
        WHERE DATE_FORMAT(p.payment_date, '%Y-%m') = DATE_FORMAT(b.generated_at, '%Y-%m')
    ), 0.00) AS total_collected_amount,
    (SUM(b.total_amount) - COALESCE((
        SELECT SUM(p.amount) 
        FROM payments p 
        WHERE DATE_FORMAT(p.payment_date, '%Y-%m') = DATE_FORMAT(b.generated_at, '%Y-%m')
    ), 0.00)) AS total_outstanding_amount
FROM bills b
GROUP BY DATE_FORMAT(b.generated_at, '%Y-%m');

-- -------------------------------------------------------
-- 4. Room Occupancy View
-- Shows room number, room type, patient and occupancy status
-- -------------------------------------------------------
CREATE OR REPLACE VIEW room_occupancy_view AS
SELECT 
    r.id AS room_id,
    r.room_number,
    r.room_type,
    r.floor,
    r.status AS room_status,
    r.daily_charge,
    adm.id AS admission_id,
    p.id AS patient_id,
    p.patient_code,
    p.name AS patient_name,
    p.phone AS patient_phone,
    d.name AS attending_doctor,
    adm.admission_date,
    adm.discharge_date,
    adm.status AS admission_status
FROM rooms r
LEFT JOIN admissions adm ON r.id = adm.room_id AND adm.status = 'Active'
LEFT JOIN patients p ON adm.patient_id = p.id
LEFT JOIN doctors d ON adm.doctor_id = d.id;
