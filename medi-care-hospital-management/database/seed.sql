-- =======================================================
-- MediCare - Hospital Management System
-- Seed Demo Data
-- Database Name: medicare_hospital
-- =======================================================

USE medicare_hospital;

-- Disable foreign key checks during seeding
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE payments;
TRUNCATE TABLE bills;
TRUNCATE TABLE admissions;
TRUNCATE TABLE rooms;
TRUNCATE TABLE prescriptions;
TRUNCATE TABLE medical_records;
TRUNCATE TABLE appointments;
TRUNCATE TABLE patients;
TRUNCATE TABLE staff;
TRUNCATE TABLE doctors;
TRUNCATE TABLE departments;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------
-- 1. Insert Users (Admin, Doctor, Receptionist + other Doctors)
-- Passwords:
-- Admin: Admin@123
-- Doctor: Doctor@123
-- Receptionist: Reception@123
-- -------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, phone, status) VALUES
(1, 'System Administrator', 'admin@medicare.com', '$2b$12$8UQsmvTTbMY6iSfZIQUWxuq6pg9xFP3irim0zucRSbPjIcvVGiwaK', 'ADMIN', '+91 9876543210', 'ACTIVE'),
(2, 'Dr. Rajesh Sharma', 'doctor@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543211', 'ACTIVE'),
(3, 'Sarah Jenkins', 'reception@medicare.com', '$2b$12$tFKYJVuXnlU7xD2hpa2SmeXWa8rjiqFVt8Fkb22Z/Ag242qqtgybG', 'RECEPTIONIST', '+91 9876543212', 'ACTIVE'),
(4, 'Dr. Priya Patel', 'priya.patel@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543213', 'ACTIVE'),
(5, 'Dr. Amit Verma', 'amit.verma@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543214', 'ACTIVE'),
(6, 'Dr. Sunita Rao', 'sunita.rao@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543215', 'ACTIVE'),
(7, 'Dr. Vikram Malhotra', 'vikram.malhotra@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543216', 'ACTIVE'),
(8, 'Dr. Ananya Sen', 'ananya.sen@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543217', 'ACTIVE'),
(9, 'Dr. Rohan Mehta', 'rohan.mehta@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543218', 'ACTIVE'),
(10, 'Dr. Neha Kapoor', 'neha.kapoor@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543219', 'ACTIVE'),
(11, 'Dr. Siddharth Joshi', 'siddharth.joshi@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543220', 'ACTIVE'),
(12, 'Dr. Kavita Nair', 'kavita.nair@medicare.com', '$2b$12$k4LjU1phaKxto3ScRpTSSuFyxwlxQ8r89EgqiFw4gcF1886AOXGmm', 'DOCTOR', '+91 9876543221', 'ACTIVE');

-- -------------------------------------------------------
-- 2. Insert Departments (6 Departments)
-- -------------------------------------------------------
INSERT INTO departments (id, department_name, description, location) VALUES
(1, 'Cardiology', 'Comprehensive diagnostic and interventional cardiac care, cath lab, and cardiology intensive care.', 'Wing A - 3rd Floor'),
(2, 'Neurology', 'Advanced brain and spine disorder treatments, stroke center, and neuro-rehabilitation.', 'Wing B - 4th Floor'),
(3, 'Orthopedics', 'Musculoskeletal care, joint replacement, sports injury treatment, and trauma surgery.', 'Wing A - 2nd Floor'),
(4, 'Pediatrics', 'Comprehensive child healthcare, neonatal ICU, immunizations, and developmental medicine.', 'Wing C - 1st Floor'),
(5, 'Oncology', 'Medical and surgical cancer care, chemotherapy suites, and oncology consultation.', 'Wing B - 5th Floor'),
(6, 'General Medicine', 'Primary healthcare, internal medicine, fever clinics, and general health screenings.', 'Wing A - Ground Floor');

-- -------------------------------------------------------
-- 3. Insert Doctors (10 Doctors)
-- -------------------------------------------------------
INSERT INTO doctors (id, user_id, doctor_code, name, specialization, department_id, phone, email, qualification, experience, consultation_fee, availability_status) VALUES
(1, 2, 'DOC-001', 'Dr. Rajesh Sharma', 'Interventional Cardiologist', 1, '+91 9876543211', 'doctor@medicare.com', 'MBBS, MD, DM (Cardiology)', 14, 800.00, 'AVAILABLE'),
(2, 4, 'DOC-002', 'Dr. Priya Patel', 'Neurologist', 2, '+91 9876543213', 'priya.patel@medicare.com', 'MBBS, MD, DM (Neurology)', 11, 900.00, 'AVAILABLE'),
(3, 5, 'DOC-003', 'Dr. Amit Verma', 'Orthopedic Surgeon', 3, '+91 9876543214', 'amit.verma@medicare.com', 'MBBS, MS (Ortho), M.Ch', 16, 750.00, 'AVAILABLE'),
(4, 6, 'DOC-004', 'Dr. Sunita Rao', 'Pediatrician', 4, '+91 9876543215', 'sunita.rao@medicare.com', 'MBBS, DCH, DNB (Pediatrics)', 9, 600.00, 'AVAILABLE'),
(5, 7, 'DOC-005', 'Dr. Vikram Malhotra', 'Medical Oncologist', 5, '+91 9876543216', 'vikram.malhotra@medicare.com', 'MBBS, MD, DM (Medical Oncology)', 18, 1200.00, 'AVAILABLE'),
(6, 8, 'DOC-006', 'Dr. Ananya Sen', 'General Physician', 6, '+91 9876543217', 'ananya.sen@medicare.com', 'MBBS, MD (General Medicine)', 8, 500.00, 'AVAILABLE'),
(7, 9, 'DOC-007', 'Dr. Rohan Mehta', 'Cardiac Electrophysiologist', 1, '+91 9876543218', 'rohan.mehta@medicare.com', 'MBBS, MD, Fellowship in EP', 12, 850.00, 'AVAILABLE'),
(8, 10, 'DOC-008', 'Dr. Neha Kapoor', 'Neurosurgeon', 2, '+91 9876543219', 'neha.kapoor@medicare.com', 'MBBS, MS, M.Ch (Neurosurgery)', 15, 1100.00, 'AVAILABLE'),
(9, 11, 'DOC-009', 'Dr. Siddharth Joshi', 'Sports Medicine & Joint Replacement', 3, '+91 9876543220', 'siddharth.joshi@medicare.com', 'MBBS, MS (Orthopedics)', 10, 700.00, 'AVAILABLE'),
(10, 12, 'DOC-010', 'Dr. Kavita Nair', 'Consultant Physician', 6, '+91 9876543221', 'kavita.nair@medicare.com', 'MBBS, DNB (Internal Medicine)', 7, 500.00, 'AVAILABLE');

-- -------------------------------------------------------
-- 4. Insert Patients (20 Patients)
-- -------------------------------------------------------
INSERT INTO patients (id, patient_code, name, date_of_birth, gender, blood_group, phone, email, address, emergency_contact, emergency_phone) VALUES
(1, 'PAT-0001', 'Aarav Gupta', '1988-04-12', 'MALE', 'O+', '+91 9123456780', 'aarav.gupta@example.com', 'Flat 402, Lotus Greens, Sector 45, Gurgaon', 'Sunita Gupta (Wife)', '+91 9123456781'),
(2, 'PAT-0002', 'Meera Iyer', '1995-09-24', 'FEMALE', 'B+', '+91 9234567891', 'meera.iyer@example.com', '12B, Palm Meadows, Whitefield, Bangalore', 'Karthik Iyer (Brother)', '+91 9234567892'),
(3, 'PAT-0003', 'Ramesh Chand', '1962-11-05', 'MALE', 'A+', '+91 9345678902', 'ramesh.chand@example.com', 'C-48, Malviya Nagar, New Delhi', 'Vipin Chand (Son)', '+91 9345678903'),
(4, 'PAT-0004', 'Sneha Deshmukh', '2001-02-18', 'FEMALE', 'AB+', '+91 9456789013', 'sneha.d@example.com', '88 Shivaji Park, Dadar West, Mumbai', 'Prakash Deshmukh (Father)', '+91 9456789014'),
(5, 'PAT-0005', 'Karan Singhania', '1984-07-30', 'MALE', 'B-', '+91 9567890124', 'karan.s@example.com', 'Green Glen Layout, Bellandur, Bangalore', 'Ritu Singhania (Wife)', '+91 9567890125'),
(6, 'PAT-0006', 'Pooja Reddy', '1992-12-14', 'FEMALE', 'O-', '+91 9678901235', 'pooja.reddy@example.com', 'Plot 104, Jubilee Hills, Hyderabad', 'Suresh Reddy (Husband)', '+91 9678901236'),
(7, 'PAT-0007', 'Harish Nair', '1975-06-08', 'MALE', 'A-', '+91 9789012346', 'harish.nair@example.com', 'TC 24/110, Kowdiar, Thiruvananthapuram', 'Deepa Nair (Wife)', '+91 9789012347'),
(8, 'PAT-0008', 'Ananya Bhattacharya', '2016-03-22', 'FEMALE', 'B+', '+91 9890123457', 'tapan.bhatt@example.com', 'Block CD, Salt Lake City, Kolkata', 'Tapan Bhattacharya (Father)', '+91 9890123458'),
(9, 'PAT-0009', 'Vijay Kumar Verma', '1968-08-19', 'MALE', 'O+', '+91 9901234568', 'vk.verma@example.com', '15 Ashok Nagar, Kanpur, UP', 'Manish Verma (Son)', '+91 9901234569'),
(10, 'PAT-0010', 'Deepika Sharma', '1999-10-10', 'FEMALE', 'AB-', '+91 9012345679', 'deepika.s@example.com', 'Sector 17-C, Chandigarh', 'Mohit Sharma (Brother)', '+91 9012345680'),
(11, 'PAT-0011', 'Tanmay Sen', '1980-01-25', 'MALE', 'A+', '+91 9123987654', 'tanmay.sen@example.com', 'Lake Gardens, South Kolkata', 'Rupa Sen (Wife)', '+91 9123987655'),
(12, 'PAT-0012', 'Bhavna Kulkarni', '1987-05-15', 'FEMALE', 'O+', '+91 9234876543', 'bhavna.k@example.com', 'Kothrud, Pune, Maharashtra', 'Anand Kulkarni (Husband)', '+91 9234876544'),
(13, 'PAT-0013', 'Arjun Saxena', '2005-09-02', 'MALE', 'B+', '+91 9345765432', 'arjun.saxena@example.com', 'Civil Lines, Jaipur, Rajasthan', 'Rajeev Saxena (Father)', '+91 9345765433'),
(14, 'PAT-0014', 'Geeta Rani', '1958-04-16', 'FEMALE', 'A+', '+91 9456654321', 'geeta.rani@example.com', 'Model Town, Ludhiana, Punjab', 'Davinder Singh (Son)', '+91 9456654322'),
(15, 'PAT-0015', 'Naveen Choudhary', '1991-11-28', 'MALE', 'O+', '+91 9567543210', 'naveen.c@example.com', 'Vasant Kunj, New Delhi', 'Pooja Choudhary (Wife)', '+91 9567543211'),
(16, 'PAT-0016', 'Divya Menon', '2019-08-05', 'FEMALE', 'B+', '+91 9678432109', 'vinod.menon@example.com', 'Panampilly Nagar, Kochi, Kerala', 'Vinod Menon (Father)', '+91 9678432110'),
(17, 'PAT-0017', 'Sanjay Rathore', '1972-03-14', 'MALE', 'AB+', '+91 9789321098', 'sanjay.rathore@example.com', 'Rani Bazar, Bikaner, Rajasthan', 'Kiran Rathore (Wife)', '+91 9789321099'),
(18, 'PAT-0018', 'Kavita Chawla', '1983-07-21', 'FEMALE', 'A-', '+91 9890210987', 'kavita.chawla@example.com', 'Rajouri Garden, New Delhi', 'Rohit Chawla (Husband)', '+91 9890210988'),
(19, 'PAT-0019', 'Farhan Siddiqui', '1994-06-30', 'MALE', 'O-', '+91 9901109876', 'farhan.s@example.com', 'Hazratganj, Lucknow, UP', 'Zoya Siddiqui (Sister)', '+91 9901109877'),
(20, 'PAT-0020', 'Ritu Aggarwal', '1990-12-03', 'FEMALE', 'B+', '+91 9012098765', 'ritu.aggarwal@example.com', 'Sector 14, Noida, UP', 'Amit Aggarwal (Husband)', '+91 9012098766');

-- -------------------------------------------------------
-- 5. Insert Rooms (15 Rooms)
-- -------------------------------------------------------
INSERT INTO rooms (id, room_number, room_type, floor, status, daily_charge) VALUES
(1, '101', 'General', 1, 'Available', 600.00),
(2, '102', 'General', 1, 'Occupied', 600.00),
(3, '103', 'General', 1, 'Available', 600.00),
(4, '104', 'Semi-Private', 1, 'Available', 1200.00),
(5, '105', 'Semi-Private', 1, 'Occupied', 1200.00),
(6, '201', 'Semi-Private', 2, 'Available', 1200.00),
(7, '202', 'Private', 2, 'Available', 2500.00),
(8, '203', 'Private', 2, 'Occupied', 2500.00),
(9, '204', 'Private', 2, 'Maintenance', 2500.00),
(10, '205', 'Private', 2, 'Available', 2500.00),
(11, '301', 'ICU', 3, 'Occupied', 5000.00),
(12, '302', 'ICU', 3, 'Available', 5000.00),
(13, '303', 'ICU', 3, 'Occupied', 5000.00),
(14, '304', 'Semi-Private', 3, 'Available', 1200.00),
(15, '305', 'General', 3, 'Available', 600.00);

-- -------------------------------------------------------
-- 6. Insert Admissions (5 Admissions: 3 Active, 2 Discharged)
-- -------------------------------------------------------
INSERT INTO admissions (id, patient_id, doctor_id, room_id, admission_date, discharge_date, reason, status) VALUES
(1, 1, 1, 11, '2026-09-24 10:30:00', NULL, 'Acute myocardial infarction observation and cardiac stabilization', 'Active'),
(2, 3, 2, 5, '2026-09-25 14:15:00', NULL, 'Transient ischemic attack (TIA) monitoring and therapy', 'Active'),
(3, 5, 3, 2, '2026-09-26 09:00:00', NULL, 'Post-operative care for arthroscopic knee ligament reconstruction', 'Active'),
(4, 9, 5, 8, '2026-09-20 11:00:00', '2026-09-25 16:00:00', 'Chemotherapy cycle 3 infusion and post-infusion observation', 'Discharged'),
(5, 7, 6, 13, '2026-09-22 08:00:00', NULL, 'Severe dengue with thrombocytopenia monitoring in ICU', 'Active');

-- -------------------------------------------------------
-- 7. Insert Appointments (15 Appointments)
-- -------------------------------------------------------
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, appointment_type, reason, status) VALUES
(1, 1, 1, '2026-09-24', '10:00:00', 'Emergency', 'Severe chest tightness and shortness of breath', 'Completed'),
(2, 2, 6, '2026-09-28', '09:30:00', 'General Checkup', 'Persistent mild fever and fatigue for 4 days', 'Completed'),
(3, 3, 2, '2026-09-25', '11:00:00', 'Consultation', 'Frequent episodes of dizziness and tingling numbness in right arm', 'Completed'),
(4, 4, 3, '2026-09-29', '10:00:00', 'Consultation', 'Persistent lower back pain radiating to left leg', 'Scheduled'),
(5, 5, 3, '2026-09-26', '08:30:00', 'Follow-up', 'Pre-surgery evaluation for knee arthroscopy', 'Completed'),
(6, 6, 1, '2026-09-29', '11:30:00', 'Routine', 'Hypertension follow up and ECG review', 'Scheduled'),
(7, 7, 6, '2026-09-22', '08:00:00', 'Emergency', 'High grade fever with severe body aches and low platelet count', 'Completed'),
(8, 8, 4, '2026-09-29', '14:00:00', 'General Checkup', 'Annual pediatric developmental checkup and vaccination', 'Scheduled'),
(9, 9, 5, '2026-09-20', '10:00:00', 'Consultation', 'Oncology review and round 3 chemotherapy planning', 'Completed'),
(10, 10, 2, '2026-09-30', '15:00:00', 'Consultation', 'Chronic migraine headaches with visual aura', 'Scheduled'),
(11, 11, 6, '2026-09-28', '11:00:00', 'Routine', 'Diabetic profile test review and metformin dose titration', 'Completed'),
(12, 12, 1, '2026-09-30', '10:00:00', 'Consultation', 'Palpitations during light aerobic exercise', 'Scheduled'),
(13, 13, 3, '2026-09-27', '16:00:00', 'Emergency', 'Acute ankle twist during football match', 'Completed'),
(14, 14, 2, '2026-09-29', '12:00:00', 'Follow-up', 'Parkinsonism tremors and mobility evaluation', 'Confirmed'),
(15, 15, 6, '2026-09-28', '14:30:00', 'Routine', 'Pre-employment comprehensive medical examination', 'Completed');

-- -------------------------------------------------------
-- 8. Insert Medical Records (10 Records)
-- -------------------------------------------------------
INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id, diagnosis, symptoms, treatment_notes, follow_up_date) VALUES
(1, 1, 1, 1, 'Acute Coronary Syndrome / NSTEMI', 'Crushing retrosternal chest pain, diaphoresis, dyspnea on exertion', 'Loaded with dual antiplatelets. Admitted to cardiac ICU for continuous telemetry and urgent angiogram.', '2026-10-05'),
(2, 2, 6, 2, 'Viral Upper Respiratory Tract Infection', 'Mild dry cough, low grade fever (99.8F), sore throat, fatigue', 'Advised adequate rest, warm saline gargles, hydration and supportive medication. No antibiotics required.', '2026-10-02'),
(3, 3, 2, 3, 'Transient Ischemic Attack (Left Carotid Territory)', 'Transient right sided upper extremity weakness, slurred speech lasting 20 mins', 'Urgent MRI Brain and Carotid Doppler performed. Started on antiplatelet and high-intensity statin.', '2026-10-08'),
(4, 5, 3, 5, 'Right Knee Anterior Cruciate Ligament (ACL) Tear', 'Right knee instability, clicking sensation, difficulty bearing weight', 'Arthroscopic ACL reconstruction planned and scheduled. Pre-op labs reviewed and found normal.', '2026-10-12'),
(5, 7, 6, 7, 'Dengue Fever with Severe Thrombocytopenia', 'Sudden high fever (103F), retro-orbital eye pain, petechial rash, platelet count 42,000/mcL', 'Patient admitted to ICU. Strict fluid management protocol initiated, frequent platelet monitoring.', '2026-10-01'),
(6, 9, 5, 9, 'Colorectal Carcinoma Stage III (Post Resection)', 'Mild nausea, abdominal bloating, fatigue following cycle 2', 'Tolerating chemotherapy satisfactorily. Routine CBC and CEA markers ordered. Cycle 3 initiated.', '2026-10-15'),
(7, 11, 6, 11, 'Type 2 Diabetes Mellitus with Essential Hypertension', 'Occasional morning headache, increased thirst, HbA1c 7.8%', 'Upgraded Metformin dosage. Advised strict dietary moderation and daily 30-minute brisk walk.', '2026-10-28'),
(8, 13, 3, 13, 'Grade II Lateral Ankle Sprain (Right)', 'Localized edema over anterior talofibular ligament, tenderness, limping', 'Applied crepe bandage and air-stirrup ankle brace. Advised RICE (Rest, Ice, Compression, Elevation) regimen.', '2026-10-04'),
(9, 14, 2, 14, 'Idiopathic Parkinson Disease (Hoehn & Yahr Stage 2)', 'Rest tremor in right hand, mild rigidity in gait, decreased arm swing', 'Titrated Levodopa/Carbidopa dosage. Referred to neuro-physiotherapy for balance and gait training.', '2026-10-20'),
(10, 15, 6, 15, 'Healthy Adult - General Health Clearance', 'Asymptomatic, requested routine health screening', 'Blood pressure 118/76 mmHg, BMI 23.2. All baseline parameters within normal limits. Fit for regular duties.', NULL);

-- -------------------------------------------------------
-- 9. Insert Prescriptions (15 Prescriptions)
-- -------------------------------------------------------
INSERT INTO prescriptions (id, medical_record_id, patient_id, doctor_id, medicine_name, dosage, frequency, duration, instructions) VALUES
(1, 1, 1, 1, 'Aspirin (Ecosprin)', '75 mg', 'Once daily', '30 days', 'Take after breakfast with water'),
(2, 1, 1, 1, 'Atorvastatin', '40 mg', 'Once daily (Night)', '30 days', 'Take before sleeping'),
(3, 1, 1, 1, 'Metoprolol Succinate', '25 mg', 'Once daily', '15 days', 'Monitor pulse rate regularly'),
(4, 2, 2, 6, 'Paracetamol', '650 mg', 'Thrice daily if fever > 100F', '3 days', 'Take after food'),
(5, 2, 2, 6, 'Cetirizine', '10 mg', 'Once daily at bedtime', '5 days', 'May cause mild drowsiness'),
(6, 3, 3, 2, 'Clopidogrel', '75 mg', 'Once daily', '30 days', 'Take at same time each day'),
(7, 3, 3, 2, 'Rosuvastatin', '20 mg', 'Once daily (Night)', '30 days', 'Avoid grapefruit juice'),
(8, 4, 5, 3, 'Aceclofenac + Paracetamol', '100 mg / 325 mg', 'Twice daily', '5 days', 'Take strictly after meals'),
(9, 4, 5, 3, 'Pantoprazole', '40 mg', 'Once daily', '5 days', 'Take on empty stomach 30 mins before breakfast'),
(10, 5, 7, 6, 'Paracetamol Infusion', '1000 mg / 100ml', 'IV every 6 hours PRN', '3 days', 'For temperature above 101F'),
(11, 6, 9, 5, 'Ondansetron', '8 mg', 'Twice daily', '5 days', 'Take 30 minutes before food for nausea'),
(12, 7, 11, 6, 'Metformin SR', '1000 mg', 'Twice daily', '60 days', 'Take along with meals'),
(13, 7, 11, 6, 'Telmisartan', '40 mg', 'Once daily (Morning)', '60 days', 'Regular morning dose'),
(14, 8, 13, 3, 'Ibuprofen', '400 mg', 'Twice daily', '4 days', 'Take with milk or meal'),
(15, 9, 14, 2, 'Levodopa + Carbidopa (Syndopa)', '100 mg / 25 mg', 'Thrice daily', '45 days', 'Take 1 hour before or 2 hours after high-protein meals');

-- -------------------------------------------------------
-- 10. Insert Bills (10 Bills)
-- -------------------------------------------------------
INSERT INTO bills (id, patient_id, appointment_id, admission_id, consultation_charge, room_charge, medicine_charge, test_charge, other_charge, total_amount, payment_status, generated_at) VALUES
(1, 1, 1, 1, 800.00, 20000.00, 3500.00, 4200.00, 1500.00, 30000.00, 'Partially Paid', '2026-09-24 16:00:00'),
(2, 2, 2, NULL, 500.00, 0.00, 350.00, 400.00, 0.00, 1250.00, 'Paid', '2026-09-28 10:15:00'),
(3, 3, 3, 2, 900.00, 3600.00, 1200.00, 5500.00, 800.00, 12000.00, 'Partially Paid', '2026-09-25 15:30:00'),
(4, 5, 5, 3, 750.00, 1800.00, 2100.00, 3200.00, 1150.00, 9000.00, 'Pending', '2026-09-26 12:00:00'),
(5, 7, 7, 5, 500.00, 25000.00, 4500.00, 6800.00, 2200.00, 39000.00, 'Partially Paid', '2026-09-22 14:00:00'),
(6, 9, 9, 4, 1200.00, 12500.00, 18500.00, 4800.00, 3000.00, 40000.00, 'Paid', '2026-09-25 16:30:00'),
(7, 11, 11, NULL, 500.00, 0.00, 850.00, 1200.00, 0.00, 2550.00, 'Paid', '2026-09-28 11:45:00'),
(8, 13, 13, NULL, 700.00, 0.00, 450.00, 950.00, 300.00, 2400.00, 'Paid', '2026-09-27 16:45:00'),
(9, 14, 14, NULL, 1100.00, 0.00, 1800.00, 0.00, 0.00, 2900.00, 'Pending', '2026-09-29 12:45:00'),
(10, 15, 15, NULL, 500.00, 0.00, 0.00, 2000.00, 500.00, 3000.00, 'Paid', '2026-09-28 15:00:00');

-- -------------------------------------------------------
-- 11. Insert Payments (10 Payments)
-- -------------------------------------------------------
INSERT INTO payments (id, bill_id, amount, payment_method, transaction_reference, payment_date) VALUES
(1, 1, 15000.00, 'Card', 'TXN-CARD-984123', '2026-09-24 16:30:00'),
(2, 2, 1250.00, 'UPI', 'UPI-REF-23849102', '2026-09-28 10:20:00'),
(3, 3, 6000.00, 'Card', 'TXN-CARD-552194', '2026-09-25 15:45:00'),
(4, 5, 20000.00, 'UPI', 'UPI-REF-88910234', '2026-09-22 15:10:00'),
(5, 6, 20000.00, 'Card', 'TXN-CARD-119284', '2026-09-25 16:45:00'),
(6, 6, 20000.00, 'Cash', 'CASH-REC-001094', '2026-09-25 17:00:00'),
(7, 7, 2550.00, 'UPI', 'UPI-REF-99238401', '2026-09-28 11:50:00'),
(8, 8, 2400.00, 'Cash', 'CASH-REC-001102', '2026-09-27 16:50:00'),
(9, 10, 3000.00, 'UPI', 'UPI-REF-34981023', '2026-09-28 15:10:00'),
(10, 1, 5000.00, 'UPI', 'UPI-REF-44910283', '2026-09-26 11:20:00');

-- -------------------------------------------------------
-- 12. Insert Staff Members (8 Staff Members)
-- -------------------------------------------------------
INSERT INTO staff (id, name, role, department_id, phone, email, salary, joining_date, status) VALUES
(1, 'Sister Mary Joseph', 'Head Nursing Officer', 1, '+91 9811223344', 'mary.joseph@medicare.com', 55000.00, '2021-03-15', 'ACTIVE'),
(2, 'Vikas Saxena', 'Senior Lab Technician', 6, '+91 9822334455', 'vikas.lab@medicare.com', 38000.00, '2022-06-01', 'ACTIVE'),
(3, 'Preeti Deshmukh', 'Chief Pharmacist', 6, '+91 9833445566', 'preeti.pharma@medicare.com', 45000.00, '2020-01-10', 'ACTIVE'),
(4, 'Deepak Soni', 'Radiology Technician', 3, '+91 9844556677', 'deepak.radio@medicare.com', 40000.00, '2023-02-20', 'ACTIVE'),
(5, 'Anjali Kurup', 'ICU Staff Nurse', 1, '+91 9855667788', 'anjali.nurse@medicare.com', 42000.00, '2022-11-05', 'ACTIVE'),
(6, 'Rakesh Tiwari', 'Emergency Medical Technician', 6, '+91 9866778899', 'rakesh.emt@medicare.com', 36000.00, '2023-08-12', 'ACTIVE'),
(7, 'Sunil Yadav', 'Operation Theatre Assistant', 3, '+91 9877889900', 'sunil.ot@medicare.com', 32000.00, '2021-09-18', 'ACTIVE'),
(8, 'Kavita Joshi', 'Patient Care Coordinator', 4, '+91 9888990011', 'kavita.coord@medicare.com', 34000.00, '2024-01-15', 'ACTIVE');
