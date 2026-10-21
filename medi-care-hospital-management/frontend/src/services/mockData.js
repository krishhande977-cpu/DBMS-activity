// Realistic demo dataset derived directly from database/seed.sql
// Used when backend API / MySQL is offline or when deployed to Vercel

const STORAGE_PREFIX = 'medicare_demo_';

const initialDepartments = [
  { id: 1, department_name: 'Cardiology', description: 'Comprehensive diagnostic and interventional cardiac care, cath lab, and cardiology intensive care.', location: 'Wing A - 3rd Floor' },
  { id: 2, department_name: 'Neurology', description: 'Advanced brain and spine disorder treatments, stroke center, and neuro-rehabilitation.', location: 'Wing B - 4th Floor' },
  { id: 3, department_name: 'Orthopedics', description: 'Musculoskeletal care, joint replacement, sports injury treatment, and trauma surgery.', location: 'Wing A - 2nd Floor' },
  { id: 4, department_name: 'Pediatrics', description: 'Comprehensive child healthcare, neonatal ICU, immunizations, and developmental medicine.', location: 'Wing C - 1st Floor' },
  { id: 5, department_name: 'Oncology', description: 'Medical and surgical cancer care, chemotherapy suites, and oncology consultation.', location: 'Wing B - 5th Floor' },
  { id: 6, department_name: 'General Medicine', description: 'Primary healthcare, internal medicine, fever clinics, and general health screenings.', location: 'Wing A - Ground Floor' }
];

const initialDoctors = [
  { id: 1, doctor_code: 'DOC-001', name: 'Dr. Rajesh Sharma', specialization: 'Interventional Cardiologist', department_id: 1, department_name: 'Cardiology', phone: '+91 9876543211', email: 'doctor@medicare.com', qualification: 'MBBS, MD, DM (Cardiology)', experience: 14, consultation_fee: 800.00, availability_status: 'AVAILABLE' },
  { id: 2, doctor_code: 'DOC-002', name: 'Dr. Priya Patel', specialization: 'Neurologist', department_id: 2, department_name: 'Neurology', phone: '+91 9876543213', email: 'priya.patel@medicare.com', qualification: 'MBBS, MD, DM (Neurology)', experience: 11, consultation_fee: 900.00, availability_status: 'AVAILABLE' },
  { id: 3, doctor_code: 'DOC-003', name: 'Dr. Amit Verma', specialization: 'Orthopedic Surgeon', department_id: 3, department_name: 'Orthopedics', phone: '+91 9876543214', email: 'amit.verma@medicare.com', qualification: 'MBBS, MS (Ortho), M.Ch', experience: 16, consultation_fee: 750.00, availability_status: 'AVAILABLE' },
  { id: 4, doctor_code: 'DOC-004', name: 'Dr. Sunita Rao', specialization: 'Pediatrician', department_id: 4, department_name: 'Pediatrics', phone: '+91 9876543215', email: 'sunita.rao@medicare.com', qualification: 'MBBS, DCH, DNB (Pediatrics)', experience: 9, consultation_fee: 600.00, availability_status: 'AVAILABLE' },
  { id: 5, doctor_code: 'DOC-005', name: 'Dr. Vikram Malhotra', specialization: 'Medical Oncologist', department_id: 5, department_name: 'Oncology', phone: '+91 9876543216', email: 'vikram.malhotra@medicare.com', qualification: 'MBBS, MD, DM (Medical Oncology)', experience: 18, consultation_fee: 1200.00, availability_status: 'AVAILABLE' },
  { id: 6, doctor_code: 'DOC-006', name: 'Dr. Ananya Sen', specialization: 'General Physician', department_id: 6, department_name: 'General Medicine', phone: '+91 9876543217', email: 'ananya.sen@medicare.com', qualification: 'MBBS, MD (General Medicine)', experience: 8, consultation_fee: 500.00, availability_status: 'AVAILABLE' },
  { id: 7, doctor_code: 'DOC-007', name: 'Dr. Rohan Mehta', specialization: 'Cardiac Electrophysiologist', department_id: 1, department_name: 'Cardiology', phone: '+91 9876543218', email: 'rohan.mehta@medicare.com', qualification: 'MBBS, MD, Fellowship in EP', experience: 12, consultation_fee: 850.00, availability_status: 'AVAILABLE' },
  { id: 8, doctor_code: 'DOC-008', name: 'Dr. Neha Kapoor', specialization: 'Neurosurgeon', department_id: 2, department_name: 'Neurology', phone: '+91 9876543219', email: 'neha.kapoor@medicare.com', qualification: 'MBBS, MS, M.Ch (Neurosurgery)', experience: 15, consultation_fee: 1100.00, availability_status: 'AVAILABLE' },
  { id: 9, doctor_code: 'DOC-009', name: 'Dr. Siddharth Joshi', specialization: 'Sports Medicine & Joint Replacement', department_id: 3, department_name: 'Orthopedics', phone: '+91 9876543220', email: 'siddharth.joshi@medicare.com', qualification: 'MBBS, MS (Orthopedics)', experience: 10, consultation_fee: 700.00, availability_status: 'AVAILABLE' },
  { id: 10, doctor_code: 'DOC-010', name: 'Dr. Kavita Nair', specialization: 'Consultant Physician', department_id: 6, department_name: 'General Medicine', phone: '+91 9876543221', email: 'kavita.nair@medicare.com', qualification: 'MBBS, DNB (Internal Medicine)', experience: 7, consultation_fee: 500.00, availability_status: 'AVAILABLE' }
];

const initialPatients = [
  { id: 1, patient_code: 'PAT-0001', name: 'Aarav Gupta', date_of_birth: '1988-04-12', gender: 'MALE', blood_group: 'O+', phone: '+91 9123456780', email: 'aarav.gupta@example.com', address: 'Flat 402, Lotus Greens, Sector 45, Gurgaon', emergency_contact: 'Sunita Gupta (Wife)', emergency_phone: '+91 9123456781', created_at: '2026-09-01 10:00:00' },
  { id: 2, patient_code: 'PAT-0002', name: 'Meera Iyer', date_of_birth: '1995-09-24', gender: 'FEMALE', blood_group: 'B+', phone: '+91 9234567891', email: 'meera.iyer@example.com', address: '12B, Palm Meadows, Whitefield, Bangalore', emergency_contact: 'Karthik Iyer (Brother)', emergency_phone: '+91 9234567892', created_at: '2026-09-02 11:30:00' },
  { id: 3, patient_code: 'PAT-0003', name: 'Ramesh Chand', date_of_birth: '1962-11-05', gender: 'MALE', blood_group: 'A+', phone: '+91 9345678902', email: 'ramesh.chand@example.com', address: 'C-48, Malviya Nagar, New Delhi', emergency_contact: 'Vipin Chand (Son)', emergency_phone: '+91 9345678903', created_at: '2026-09-03 14:15:00' },
  { id: 4, patient_code: 'PAT-0004', name: 'Sneha Deshmukh', date_of_birth: '2001-02-18', gender: 'FEMALE', blood_group: 'AB+', phone: '+91 9456789013', email: 'sneha.d@example.com', address: '88 Shivaji Park, Dadar West, Mumbai', emergency_contact: 'Prakash Deshmukh (Father)', emergency_phone: '+91 9456789014', created_at: '2026-09-04 09:45:00' },
  { id: 5, patient_code: 'PAT-0005', name: 'Karan Singhania', date_of_birth: '1984-07-30', gender: 'MALE', blood_group: 'B-', phone: '+91 9567890124', email: 'karan.s@example.com', address: 'Green Glen Layout, Bellandur, Bangalore', emergency_contact: 'Ritu Singhania (Wife)', emergency_phone: '+91 9567890125', created_at: '2026-09-05 16:00:00' },
  { id: 6, patient_code: 'PAT-0006', name: 'Pooja Reddy', date_of_birth: '1992-12-14', gender: 'FEMALE', blood_group: 'O-', phone: '+91 9678901235', email: 'pooja.reddy@example.com', address: 'Plot 104, Jubilee Hills, Hyderabad', emergency_contact: 'Suresh Reddy (Husband)', emergency_phone: '+91 9678901236', created_at: '2026-09-06 12:20:00' },
  { id: 7, patient_code: 'PAT-0007', name: 'Harish Nair', date_of_birth: '1975-06-08', gender: 'MALE', blood_group: 'A-', phone: '+91 9789012346', email: 'harish.nair@example.com', address: 'TC 24/110, Kowdiar, Thiruvananthapuram', emergency_contact: 'Deepa Nair (Wife)', emergency_phone: '+91 9789012347', created_at: '2026-09-07 10:10:00' },
  { id: 8, patient_code: 'PAT-0008', name: 'Ananya Bhattacharya', date_of_birth: '2016-03-22', gender: 'FEMALE', blood_group: 'B+', phone: '+91 9890123457', email: 'tapan.bhatt@example.com', address: 'Block CD, Salt Lake City, Kolkata', emergency_contact: 'Tapan Bhattacharya (Father)', emergency_phone: '+91 9890123458', created_at: '2026-09-08 15:30:00' },
  { id: 9, patient_code: 'PAT-0009', name: 'Vijay Kumar Verma', date_of_birth: '1968-08-19', gender: 'MALE', blood_group: 'O+', phone: '+91 9901234568', email: 'vk.verma@example.com', address: '15 Ashok Nagar, Kanpur, UP', emergency_contact: 'Manish Verma (Son)', emergency_phone: '+91 9901234569', created_at: '2026-09-09 11:00:00' },
  { id: 10, patient_code: 'PAT-0010', name: 'Deepika Sharma', date_of_birth: '1999-10-10', gender: 'FEMALE', blood_group: 'AB-', phone: '+91 9012345679', email: 'deepika.s@example.com', address: 'Sector 17-C, Chandigarh', emergency_contact: 'Mohit Sharma (Brother)', emergency_phone: '+91 9012345680', created_at: '2026-09-10 13:40:00' }
];

const initialRooms = [
  { id: 1, room_number: '101', room_type: 'General', floor: 1, status: 'Available', daily_charge: 600.00 },
  { id: 2, room_number: '102', room_type: 'General', floor: 1, status: 'Occupied', daily_charge: 600.00 },
  { id: 3, room_number: '103', room_type: 'General', floor: 1, status: 'Available', daily_charge: 600.00 },
  { id: 4, room_number: '104', room_type: 'Semi-Private', floor: 1, status: 'Available', daily_charge: 1200.00 },
  { id: 5, room_number: '105', room_type: 'Semi-Private', floor: 1, status: 'Occupied', daily_charge: 1200.00 },
  { id: 6, room_number: '201', room_type: 'Semi-Private', floor: 2, status: 'Available', daily_charge: 1200.00 },
  { id: 7, room_number: '202', room_type: 'Private', floor: 2, status: 'Available', daily_charge: 2500.00 },
  { id: 8, room_number: '203', room_type: 'Private', floor: 2, status: 'Occupied', daily_charge: 2500.00 },
  { id: 9, room_number: '204', room_type: 'Private', floor: 2, status: 'Maintenance', daily_charge: 2500.00 },
  { id: 10, room_number: '205', room_type: 'Private', floor: 2, status: 'Available', daily_charge: 2500.00 },
  { id: 11, room_number: '301', room_type: 'ICU', floor: 3, status: 'Occupied', daily_charge: 5000.00 },
  { id: 12, room_number: '302', room_type: 'ICU', floor: 3, status: 'Available', daily_charge: 5000.00 },
  { id: 13, room_number: '303', room_type: 'ICU', floor: 3, status: 'Occupied', daily_charge: 5000.00 },
  { id: 14, room_number: '304', room_type: 'Semi-Private', floor: 3, status: 'Available', daily_charge: 1200.00 },
  { id: 15, room_number: '305', room_type: 'General', floor: 3, status: 'Available', daily_charge: 600.00 }
];

const initialAppointments = [
  { id: 1, patient_id: 1, patient_name: 'Aarav Gupta', patient_code: 'PAT-0001', doctor_id: 1, doctor_name: 'Dr. Rajesh Sharma', department_name: 'Cardiology', appointment_date: '2026-09-24', appointment_time: '10:00:00', appointment_type: 'Emergency', reason: 'Severe chest tightness and shortness of breath', status: 'Completed' },
  { id: 2, patient_id: 2, patient_name: 'Meera Iyer', patient_code: 'PAT-0002', doctor_id: 6, doctor_name: 'Dr. Ananya Sen', department_name: 'General Medicine', appointment_date: '2026-09-28', appointment_time: '09:30:00', appointment_type: 'General Checkup', reason: 'Persistent mild fever and fatigue for 4 days', status: 'Completed' },
  { id: 3, patient_id: 3, patient_name: 'Ramesh Chand', patient_code: 'PAT-0003', doctor_id: 2, doctor_name: 'Dr. Priya Patel', department_name: 'Neurology', appointment_date: '2026-09-25', appointment_time: '11:00:00', appointment_type: 'Consultation', reason: 'Frequent dizziness and tingling in right arm', status: 'Completed' },
  { id: 4, patient_id: 4, patient_name: 'Sneha Deshmukh', patient_code: 'PAT-0004', doctor_id: 3, doctor_name: 'Dr. Amit Verma', department_name: 'Orthopedics', appointment_date: '2026-09-29', appointment_time: '10:00:00', appointment_type: 'Consultation', reason: 'Persistent lower back pain radiating to left leg', status: 'Scheduled' },
  { id: 5, patient_id: 5, patient_name: 'Karan Singhania', patient_code: 'PAT-0005', doctor_id: 3, doctor_name: 'Dr. Amit Verma', department_name: 'Orthopedics', appointment_date: '2026-09-26', appointment_time: '08:30:00', appointment_type: 'Follow-up', reason: 'Pre-surgery evaluation for knee arthroscopy', status: 'Completed' },
  { id: 6, patient_id: 6, patient_name: 'Pooja Reddy', patient_code: 'PAT-0006', doctor_id: 1, doctor_name: 'Dr. Rajesh Sharma', department_name: 'Cardiology', appointment_date: '2026-09-29', appointment_time: '11:30:00', appointment_type: 'Routine', reason: 'Hypertension follow up and ECG review', status: 'Scheduled' },
  { id: 7, patient_id: 7, patient_name: 'Harish Nair', patient_code: 'PAT-0007', doctor_id: 6, doctor_name: 'Dr. Ananya Sen', department_name: 'General Medicine', appointment_date: '2026-09-22', appointment_time: '08:00:00', appointment_type: 'Emergency', reason: 'High grade fever with severe body aches', status: 'Completed' }
];

const initialAdmissions = [
  { id: 1, patient_id: 1, patient_name: 'Aarav Gupta', patient_code: 'PAT-0001', doctor_id: 1, doctor_name: 'Dr. Rajesh Sharma', room_id: 11, room_number: '301', room_type: 'ICU', admission_date: '2026-09-24 10:30:00', discharge_date: null, reason: 'Acute myocardial infarction observation', status: 'Active' },
  { id: 2, patient_id: 3, patient_name: 'Ramesh Chand', patient_code: 'PAT-0003', doctor_id: 2, doctor_name: 'Dr. Priya Patel', room_id: 5, room_number: '105', room_type: 'Semi-Private', admission_date: '2026-09-25 14:15:00', discharge_date: null, reason: 'Transient ischemic attack (TIA) monitoring', status: 'Active' },
  { id: 3, patient_id: 5, patient_name: 'Karan Singhania', patient_code: 'PAT-0005', doctor_id: 3, doctor_name: 'Dr. Amit Verma', room_id: 2, room_number: '102', room_type: 'General', admission_date: '2026-09-26 09:00:00', discharge_date: null, reason: 'Post-operative care for arthroscopic knee reconstruction', status: 'Active' },
  { id: 4, patient_id: 9, patient_name: 'Vijay Kumar Verma', patient_code: 'PAT-0009', doctor_id: 5, doctor_name: 'Dr. Vikram Malhotra', room_id: 8, room_number: '203', room_type: 'Private', admission_date: '2026-09-20 11:00:00', discharge_date: '2026-09-25 16:00:00', reason: 'Chemotherapy cycle 3 infusion observation', status: 'Discharged' }
];

const initialBills = [
  { id: 1, patient_id: 1, patient_name: 'Aarav Gupta', patient_code: 'PAT-0001', consultation_charge: 800, room_charge: 20000, medicine_charge: 3500, test_charge: 4200, other_charge: 1500, total_amount: 30000, paid_amount: 20000, balance_amount: 10000, payment_status: 'Partially Paid', generated_at: '2026-09-24 16:00:00' },
  { id: 2, patient_id: 2, patient_name: 'Meera Iyer', patient_code: 'PAT-0002', consultation_charge: 500, room_charge: 0, medicine_charge: 350, test_charge: 400, other_charge: 0, total_amount: 1250, paid_amount: 1250, balance_amount: 0, payment_status: 'Paid', generated_at: '2026-09-28 10:15:00' },
  { id: 3, patient_id: 3, patient_name: 'Ramesh Chand', patient_code: 'PAT-0003', consultation_charge: 900, room_charge: 3600, medicine_charge: 1200, test_charge: 5500, other_charge: 800, total_amount: 12000, paid_amount: 6000, balance_amount: 6000, payment_status: 'Partially Paid', generated_at: '2026-09-25 15:30:00' },
  { id: 4, patient_id: 5, patient_name: 'Karan Singhania', patient_code: 'PAT-0005', consultation_charge: 750, room_charge: 1800, medicine_charge: 2100, test_charge: 3200, other_charge: 1150, total_amount: 9000, paid_amount: 0, balance_amount: 9000, payment_status: 'Pending', generated_at: '2026-09-26 12:00:00' },
  { id: 5, patient_id: 7, patient_name: 'Harish Nair', patient_code: 'PAT-0007', consultation_charge: 500, room_charge: 25000, medicine_charge: 4500, test_charge: 6800, other_charge: 2200, total_amount: 39000, paid_amount: 20000, balance_amount: 19000, payment_status: 'Partially Paid', generated_at: '2026-09-22 14:00:00' }
];

const initialPayments = [
  { id: 1, bill_id: 1, patient_name: 'Aarav Gupta', amount: 15000, payment_method: 'Card', transaction_reference: 'TXN-CARD-984123', payment_date: '2026-09-24 16:30:00' },
  { id: 2, bill_id: 2, patient_name: 'Meera Iyer', amount: 1250, payment_method: 'UPI', transaction_reference: 'UPI-REF-23849102', payment_date: '2026-09-28 10:20:00' },
  { id: 3, bill_id: 3, patient_name: 'Ramesh Chand', amount: 6000, payment_method: 'Card', transaction_reference: 'TXN-CARD-552194', payment_date: '2026-09-25 15:45:00' },
  { id: 4, bill_id: 5, patient_name: 'Harish Nair', amount: 20000, payment_method: 'UPI', transaction_reference: 'UPI-REF-88910234', payment_date: '2026-09-22 15:10:00' }
];

const initialMedicalRecords = [
  { id: 1, patient_id: 1, patient_name: 'Aarav Gupta', patient_code: 'PAT-0001', doctor_id: 1, doctor_name: 'Dr. Rajesh Sharma', diagnosis: 'Acute Coronary Syndrome / NSTEMI', symptoms: 'Crushing retrosternal chest pain, diaphoresis, dyspnea', treatment_notes: 'Admitted to cardiac ICU for telemetry and urgent angiogram.', follow_up_date: '2026-10-05', created_at: '2026-09-24 10:45:00' },
  { id: 2, patient_id: 2, patient_name: 'Meera Iyer', patient_code: 'PAT-0002', doctor_id: 6, doctor_name: 'Dr. Ananya Sen', diagnosis: 'Viral Upper Respiratory Tract Infection', symptoms: 'Mild dry cough, low grade fever (99.8F), sore throat', treatment_notes: 'Adequate rest, warm saline gargles, hydration and supportive medication.', follow_up_date: '2026-10-02', created_at: '2026-09-28 10:00:00' },
  { id: 3, patient_id: 3, patient_name: 'Ramesh Chand', patient_code: 'PAT-0003', doctor_id: 2, doctor_name: 'Dr. Priya Patel', diagnosis: 'Transient Ischemic Attack (Left Carotid)', symptoms: 'Right upper extremity weakness, slurred speech lasting 20 mins', treatment_notes: 'Urgent MRI Brain and Carotid Doppler performed. Started on antiplatelet.', follow_up_date: '2026-10-08', created_at: '2026-09-25 11:30:00' }
];

const initialPrescriptions = [
  { id: 1, medical_record_id: 1, patient_id: 1, patient_name: 'Aarav Gupta', doctor_id: 1, doctor_name: 'Dr. Rajesh Sharma', medicine_name: 'Aspirin (Ecosprin)', dosage: '75 mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take after breakfast with water' },
  { id: 2, medical_record_id: 1, patient_id: 1, patient_name: 'Aarav Gupta', doctor_id: 1, doctor_name: 'Dr. Rajesh Sharma', medicine_name: 'Atorvastatin', dosage: '40 mg', frequency: 'Once daily (Night)', duration: '30 days', instructions: 'Take before sleeping' },
  { id: 3, medical_record_id: 2, patient_id: 2, patient_name: 'Meera Iyer', doctor_id: 6, doctor_name: 'Dr. Ananya Sen', medicine_name: 'Paracetamol', dosage: '650 mg', frequency: 'Thrice daily if fever > 100F', duration: '3 days', instructions: 'Take after food' }
];

const initialStaff = [
  { id: 1, name: 'Sister Mary Joseph', role: 'Head Nursing Officer', department_id: 1, department_name: 'Cardiology', phone: '+91 9811223344', email: 'mary.joseph@medicare.com', salary: 55000, joining_date: '2021-03-15', status: 'ACTIVE' },
  { id: 2, name: 'Vikas Saxena', role: 'Senior Lab Technician', department_id: 6, department_name: 'General Medicine', phone: '+91 9822334455', email: 'vikas.lab@medicare.com', salary: 38000, joining_date: '2022-06-01', status: 'ACTIVE' },
  { id: 3, name: 'Preeti Deshmukh', role: 'Chief Pharmacist', department_id: 6, department_name: 'General Medicine', phone: '+91 9833445566', email: 'preeti.pharma@medicare.com', salary: 45000, joining_date: '2020-01-10', status: 'ACTIVE' },
  { id: 4, name: 'Deepak Soni', role: 'Radiology Technician', department_id: 3, department_name: 'Orthopedics', phone: '+91 9844556677', email: 'deepak.radio@medicare.com', salary: 40000, joining_date: '2023-02-20', status: 'ACTIVE' }
];

// Helper to get from / set to LocalStorage
function getCollection(key, initial) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

function saveCollection(key, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

export const mockStore = {
  getStats: () => {
    const patients = getCollection('patients', initialPatients);
    const doctors = getCollection('doctors', initialDoctors);
    const appts = getCollection('appointments', initialAppointments);
    const rooms = getCollection('rooms', initialRooms);
    const bills = getCollection('bills', initialBills);
    const payments = getCollection('payments', initialPayments);

    const available_rooms = rooms.filter(r => r.status === 'Available').length;
    const occupied_rooms = rooms.filter(r => r.status === 'Occupied').length;
    const total_revenue = bills.reduce((acc, b) => acc + Number(b.total_amount || 0), 0);
    const total_collected = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const total_outstanding = Math.max(0, total_revenue - total_collected);
    const pending_bills = bills.filter(b => b.payment_status === 'Pending' || b.payment_status === 'Partially Paid').length;

    return {
      total_patients: patients.length,
      total_doctors: doctors.length,
      today_appointments: appts.length,
      available_rooms,
      occupied_rooms,
      total_revenue,
      total_collected,
      total_outstanding,
      pending_bills,
      recent_appointments: appts.slice(0, 5),
      pending_payments: bills.filter(b => b.payment_status !== 'Paid').slice(0, 5)
    };
  },

  getCharts: () => {
    return {
      monthly_patients: [
        { month: 'Apr 2026', patients: 12 },
        { month: 'May 2026', patients: 18 },
        { month: 'Jun 2026', patients: 15 },
        { month: 'Jul 2026', patients: 24 },
        { month: 'Aug 2026', patients: 22 },
        { month: 'Sep 2026', patients: 20 }
      ],
      appointments_by_dept: [
        { department: 'Cardiology', count: 18 },
        { department: 'Neurology', count: 14 },
        { department: 'Orthopedics', count: 16 },
        { department: 'Pediatrics', count: 12 },
        { department: 'Oncology', count: 9 },
        { department: 'General Medicine', count: 25 }
      ],
      monthly_revenue: [
        { month: 'Apr 2026', billed: 45000, collected: 41000 },
        { month: 'May 2026', billed: 62000, collected: 55000 },
        { month: 'Jun 2026', billed: 58000, collected: 52000 },
        { month: 'Jul 2026', billed: 79000, collected: 71000 },
        { month: 'Aug 2026', billed: 85000, collected: 76000 },
        { month: 'Sep 2026', billed: 94700, collected: 82500 }
      ],
      room_occupancy: [
        { type: 'General', available: 3, occupied: 1, maintenance: 0 },
        { type: 'Semi-Private', available: 3, occupied: 1, maintenance: 0 },
        { type: 'Private', available: 2, occupied: 1, maintenance: 1 },
        { type: 'ICU', available: 1, occupied: 2, maintenance: 0 }
      ]
    };
  },

  getPatients: (params = {}) => {
    let list = getCollection('patients', initialPatients);
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.patient_code.toLowerCase().includes(q) || p.phone.includes(q));
    }
    if (params.gender) list = list.filter(p => p.gender === params.gender);
    if (params.blood_group) list = list.filter(p => p.blood_group === params.blood_group);
    return { patients: list, total: list.length, skip: params.skip || 0, limit: params.limit || 50 };
  },

  getPatientById: (id) => {
    const list = getCollection('patients', initialPatients);
    const p = list.find(item => String(item.id) === String(id)) || list[0];
    const appts = getCollection('appointments', initialAppointments).filter(a => String(a.patient_id) === String(id));
    const records = getCollection('medical_records', initialMedicalRecords).filter(r => String(r.patient_id) === String(id));
    const bills = getCollection('bills', initialBills).filter(b => String(b.patient_id) === String(id));
    return { ...p, appointments: appts, medical_records: records, bills };
  },

  createPatient: (data) => {
    const list = getCollection('patients', initialPatients);
    const newId = list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
    const newPat = {
      ...data,
      id: newId,
      patient_code: `PAT-${String(newId).padStart(4, '0')}`,
      created_at: new Date().toISOString()
    };
    list.unshift(newPat);
    saveCollection('patients', list);
    return newPat;
  },

  updatePatient: (id, data) => {
    const list = getCollection('patients', initialPatients);
    const idx = list.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      saveCollection('patients', list);
      return list[idx];
    }
    return data;
  },

  deletePatient: (id) => {
    let list = getCollection('patients', initialPatients);
    list = list.filter(p => String(p.id) !== String(id));
    saveCollection('patients', list);
    return true;
  },

  getDoctors: (params = {}) => {
    let list = getCollection('doctors', initialDoctors);
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q));
    }
    if (params.department_id) {
      list = list.filter(d => String(d.department_id) === String(params.department_id));
    }
    return list;
  },

  getDepartments: () => getCollection('departments', initialDepartments),

  getAppointments: (params = {}) => {
    let list = getCollection('appointments', initialAppointments);
    if (params.status) list = list.filter(a => a.status === params.status);
    if (params.doctor_id) list = list.filter(a => String(a.doctor_id) === String(params.doctor_id));
    if (params.appointment_date) list = list.filter(a => a.appointment_date === params.appointment_date);
    return list;
  },

  createAppointment: (data) => {
    const list = getCollection('appointments', initialAppointments);
    const doctors = getCollection('doctors', initialDoctors);
    const patients = getCollection('patients', initialPatients);
    const doc = doctors.find(d => String(d.id) === String(data.doctor_id));
    const pat = patients.find(p => String(p.id) === String(data.patient_id));
    const newAppt = {
      ...data,
      id: list.length ? Math.max(...list.map(a => a.id)) + 1 : 1,
      doctor_name: doc?.name || 'Doctor',
      patient_name: pat?.name || 'Patient',
      patient_code: pat?.patient_code || 'PAT-0001',
      status: data.status || 'Scheduled'
    };
    list.unshift(newAppt);
    saveCollection('appointments', list);
    return newAppt;
  },

  getRooms: (params = {}) => {
    let list = getCollection('rooms', initialRooms);
    if (params.status) list = list.filter(r => r.status === params.status);
    if (params.room_type) list = list.filter(r => r.room_type === params.room_type);
    if (params.floor) list = list.filter(r => Number(r.floor) === Number(params.floor));
    return list;
  },

  getAdmissions: (params = {}) => {
    let list = getCollection('admissions', initialAdmissions);
    if (params.status) list = list.filter(a => a.status === params.status);
    return list;
  },

  getBills: (params = {}) => {
    let list = getCollection('bills', initialBills);
    if (params.payment_status) list = list.filter(b => b.payment_status === params.payment_status);
    return list;
  },

  getPayments: (params = {}) => {
    let list = getCollection('payments', initialPayments);
    if (params.payment_method) list = list.filter(p => p.payment_method === params.payment_method);
    return list;
  },

  getMedicalRecords: () => getCollection('medical_records', initialMedicalRecords),

  getPrescriptions: () => getCollection('prescriptions', initialPrescriptions),

  getStaff: () => getCollection('staff', initialStaff),

  getReports: (type) => {
    const patients = getCollection('patients', initialPatients);
    const rooms = getCollection('rooms', initialRooms);
    const bills = getCollection('bills', initialBills);

    if (type === 'revenue') {
      return {
        total_billed: 94700,
        total_collected: 82500,
        total_outstanding: 12200,
        collection_efficiency: 87.1,
        monthly_trend: [
          { month: 'Apr 2026', billed: 45000, collected: 41000 },
          { month: 'May 2026', billed: 62000, collected: 55000 },
          { month: 'Jun 2026', billed: 58000, collected: 52000 },
          { month: 'Jul 2026', billed: 79000, collected: 71000 },
          { month: 'Aug 2026', billed: 85000, collected: 76000 },
          { month: 'Sep 2026', billed: 94700, collected: 82500 }
        ],
        department_breakdown: [
          { department: 'Cardiology', revenue: 30000, percentage: 31.7 },
          { department: 'Neurology', revenue: 15600, percentage: 16.5 },
          { department: 'Orthopedics', revenue: 19400, percentage: 20.5 },
          { department: 'Pediatrics', revenue: 7800, percentage: 8.2 },
          { department: 'Oncology', revenue: 40000, percentage: 42.2 },
          { department: 'General Medicine', revenue: 11900, percentage: 12.6 }
        ]
      };
    }

    if (type === 'occupancy') {
      return {
        total_rooms: rooms.length,
        available: rooms.filter(r => r.status === 'Available').length,
        occupied: rooms.filter(r => r.status === 'Occupied').length,
        maintenance: rooms.filter(r => r.status === 'Maintenance').length,
        overall_rate: 33.3,
        by_type: [
          { type: 'General', total: 4, occupied: 1, rate: 25.0 },
          { type: 'Semi-Private', total: 4, occupied: 1, rate: 25.0 },
          { type: 'Private', total: 4, occupied: 1, rate: 25.0 },
          { type: 'ICU', total: 3, occupied: 2, rate: 66.7 }
        ]
      };
    }

    if (type === 'patients') {
      return {
        total_patients: patients.length,
        by_gender: [
          { gender: 'MALE', count: 11 },
          { gender: 'FEMALE', count: 9 }
        ],
        by_blood_group: [
          { blood_group: 'O+', count: 6 },
          { blood_group: 'B+', count: 5 },
          { blood_group: 'A+', count: 4 },
          { blood_group: 'AB+', count: 2 },
          { blood_group: 'O-', count: 2 },
          { blood_group: 'A-', count: 1 }
        ]
      };
    }

    return { data: [] };
  }
};
