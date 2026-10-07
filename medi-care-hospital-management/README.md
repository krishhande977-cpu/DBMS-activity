# MediCare – Hospital Management System

A comprehensive, full-stack Hospital Management System (HMS) developed as a college **BTech Database Management System (DBMS)** project. The application demonstrates real-world relational database design, normalization, referential integrity constraints, MySQL views, indexing, and ACID database transactions.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture & Schema](#database-architecture--schema)
5. [Database Relationships & Constraints](#database-relationships--constraints)
6. [Database Views](#database-views)
7. [Setup & Installation](#setup--installation)
   - [MySQL Database Setup](#1-mysql-database-setup)
   - [Backend Setup (FastAPI)](#2-backend-setup-fastapi)
   - [Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
8. [Demo Login Credentials](#demo-login-credentials)
9. [API Overview](#api-overview)
10. [DBMS Concepts Demonstrated](#dbms-concepts-demonstrated)
11. [15 Important SQL Queries for Viva Demonstration](#15-important-sql-queries-for-viva-demonstration)
12. [Future Enhancements](#future-enhancements)

---

## 🏥 Project Overview

**MediCare** is designed to streamline healthcare administration across multiple departments, clinical staff, in-patients, and out-patients. It features a role-based architecture serving three distinct personas:
- **Admin**: Full visibility over clinical departments, doctors, hospital staff, financial revenue, room allocation, and analytics.
- **Doctor**: Dedicated portal for appointments, diagnostic electronic medical records (EMR), and medication prescriptions.
- **Receptionist**: Patient onboarding, appointment scheduling, ward room assignment, inpatient admissions/discharges, and billing settlement.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Styling**: Tailwind CSS (custom clinical teal & dark slate palette)
- **Routing**: React Router v6 with Role-Based Protected Routes
- **HTTP Client**: Axios with JWT Interceptors
- **Data Visualization**: Recharts (Bar Charts, Line Charts, Pie Charts)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM & Database Driver**: SQLAlchemy 2.0 with PyMySQL
- **Data Validation & Schemas**: Pydantic v2 with Email-Validator
- **Authentication**: JWT (JSON Web Tokens) with Python-Jose (HS256)
- **Password Hashing**: BCrypt with salted hashes

### Database
- **Engine**: MySQL / MariaDB (InnoDB Storage Engine)
- **Database Name**: `medicare_hospital`

---

## 📁 Project Structure

```text
medi-care-hospital-management/
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components (Sidebar, Navbar, Modal, StatCard, Badge, Toast)
│   │   ├── pages/              # Core pages (Login, Dashboard, Patients, Doctors, Appointments, etc.)
│   │   ├── layouts/            # DashboardLayout wrapper
│   │   ├── services/           # Axios API client functions
│   │   ├── context/            # AuthContext for session management
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Formatting helpers
│   │   ├── App.jsx             # React Router configuration
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind base styles and print media rules
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   ├── .env                    # Active frontend environment variables
│   └── .env.example
│
├── backend/
│   ├── app/
│   │   ├── database/           # SQLAlchemy engine, session maker, connection lifecycle
│   │   ├── models/             # 12 SQLAlchemy ORM models matching MySQL tables
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── routers/            # 12 FastAPI REST routers (auth, patients, bills, etc.)
│   │   ├── services/           # Business logic layer
│   │   ├── utils/              # Security (BCrypt hashing, JWT issuance & verification)
│   │   ├── dependencies/       # Fastapi auth dependencies (get_current_user, require_roles)
│   │   └── main.py             # FastAPI application entrypoint & CORS middleware
│   ├── venv/                   # Python virtual environment
│   ├── requirements.txt
│   ├── .env                    # Active backend environment variables
│   └── .env.example
│
├── database/
│   ├── schema.sql              # Normalized DDL script with constraints and indexes
│   ├── seed.sql                # Realistic seed data (users, doctors, patients, bills, etc.)
│   └── views.sql               # Complex SQL Views (revenue, occupancy, schedules)
│
├── README.md                   # Comprehensive project documentation & DBMS Viva questions
└── .gitignore
```

---

## 🗄 Database Architecture & Schema

The database consists of **12 normalized relational tables**:

1. **`users`**: System authentication, password hashes, and access roles (`ADMIN`, `DOCTOR`, `RECEPTIONIST`).
2. **`departments`**: Clinical departments (Cardiology, Neurology, Pediatrics, etc.) with physical locations.
3. **`doctors`**: Medical specialists, qualifications, experience, department links, and consultation fees.
4. **`patients`**: Patient demographics, formatted identifiers (`PAT-XXXX`), blood groups, emergency contacts.
5. **`appointments`**: Outpatient bookings, time slots, reasons, and status with **double-booking constraint**.
6. **`medical_records`**: Diagnostic history, clinical observations, symptoms, treatment notes, and follow-up dates.
7. **`prescriptions`**: Itemized medication orders (dosage, frequency, duration, instructions) linked to medical records.
8. **`rooms`**: Hospital beds and wards (General, Semi-Private, Private, ICU) with status and daily tariffs.
9. **`admissions`**: Inpatient admissions, reason for stay, admission and discharge timestamps.
10. **`bills`**: Itemized charges (consultation, room charges, medicine, tests, other) and payment status.
11. **`payments`**: Transaction records with payment methods (`Cash`, `Card`, `UPI`) and transaction references.
12. **`staff`**: Hospital nursing, pharmacy, and diagnostic technical staff.

---

## 🔗 Database Relationships & Constraints

- **One-to-Many**: `departments.id` → `doctors.department_id` (`ON DELETE RESTRICT`)
- **One-to-One / Optional**: `users.id` → `doctors.user_id` (`ON DELETE SET NULL`)
- **One-to-Many**: `patients.id` → `appointments.patient_id` (`ON DELETE CASCADE`)
- **One-to-Many**: `doctors.id` → `appointments.doctor_id` (`ON DELETE CASCADE`)
- **Composite Unique Constraint**: `(doctor_id, appointment_date, appointment_time)` prevents double-booking at both the database level and the application logic level.
- **One-to-Many**: `medical_records.id` → `prescriptions.medical_record_id` (`ON DELETE CASCADE`)
- **One-to-Many**: `rooms.id` → `admissions.room_id` (`ON DELETE RESTRICT`)
- **One-to-Many**: `bills.id` → `payments.bill_id` (`ON DELETE CASCADE`)
- **Check / Application Constraint**: Overpayment prevention logic enforces that payments cannot exceed the outstanding balance.

---

## 👁 Database Views

The database includes **4 specialized SQL Views** defined in `database/views.sql`:

1. **`patient_appointment_view`**: Joins `appointments`, `patients`, `doctors`, and `departments` to display scheduled visits in a single unified view.
2. **`doctor_schedule_view`**: Joins `doctors`, `departments`, `appointments`, and `patients` to provide doctor schedule planning.
3. **`hospital_revenue_view`**: Aggregates `bills` and correlated subqueries on `payments` to display monthly billed amounts, realized collections, and outstanding dues.
4. **`room_occupancy_view`**: Outer-joins `rooms`, active `admissions`, and `patients` to provide real-time bed availability and patient occupancy data.

---

## 🚀 Setup & Installation

### Prerequisites
- **MySQL Server** (via XAMPP, MariaDB, or MySQL Community Server 8.0+)
- **Python 3.10+**
- **Node.js 18+** and **npm**

---

### 1. MySQL Database Setup

1. Start your MySQL service (e.g. from the **XAMPP Control Panel** by clicking **Start** next to MySQL).
2. Open your terminal or MySQL command line and load the SQL files in order:
```powershell
# Using the MySQL CLI:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
mysql -u root -p < database/views.sql
```
*(If your root user has no password, simply omit `-p`)*.

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend folder:
```powershell
cd backend
```
2. Create and activate a Python virtual environment:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows PowerShell
# source venv/bin/activate    # On Linux / macOS
```
3. Install required Python packages:
```powershell
pip install -r requirements.txt
```
4. Verify or create your `.env` file (copy from `.env.example`):
```ini
DATABASE_URL=mysql+pymysql://root:@localhost:3306/medicare_hospital
SECRET_KEY=medicare-super-secret-jwt-token-key-college-dbms-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
```
5. Start the FastAPI backend server:
```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The interactive Swagger API documentation will be available at: **http://localhost:8000/api/docs**

---

### 3. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend folder:
```powershell
cd frontend
```
2. Install Node dependencies:
```powershell
npm install
```
3. Verify your `.env` file (copy from `.env.example`):
```ini
VITE_API_URL=http://localhost:8000/api
```
4. Start the frontend development server:
```powershell
npm run dev
```
5. Open your browser at: **http://localhost:5173**

---

## 🔑 Demo Login & Doctor Name Authentication

The application features a dedicated **Doctor Sign-In** mode where doctors log in directly using their **Doctor Name**:

### 🩺 Doctor Sign-In (By Doctor Name)
- On the Login page (`http://localhost:5173/login`), the default tab is **"Doctor Sign-In"**.
- Doctors simply enter their **Doctor Name** (e.g. `Dr. Rajesh Sharma`, `Dr. Priya Patel`, `Dr. Amit Verma`, etc.) or click any of the 1-click doctor pills.
- Can also enter **ANY custom Doctor Name** (e.g., `Dr. Yogesh`); the backend will automatically register the doctor profile and log in!
- **Default Password**: `Doctor@123`
- The system binds the session to that doctor's ID, showing their name in the top navigation, sidebar, and pre-filtering their appointments and prescription signatures.

### 👔 Staff & Admin Sign-In (By Email)
Switch to the **"Staff / Admin"** tab for administrative roles:

| Role | Login Method | Identifier / Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Doctor** | **Doctor Name** | `Dr. Rajesh Sharma` *(or any doctor name)* | `Doctor@123` | Appointments, EMR, Prescriptions, Patient dossiers |
| **System Administrator** | Email | `admin@medicare.com` | `Admin@123` | Full access across all modules, analytics, and staff |
| **Receptionist** | Email | `reception@medicare.com` | `Reception@123` | Patient check-in, Bookings, Bed admissions, Billing & payments |

*(Quick 1-click credential buttons are also provided on both login tabs for convenience during viva demonstrations).*

---

## 📡 API Overview

| Method | Endpoint | Description | Role Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT Bearer token | Public |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated user | Authenticated |
| `GET` | `/api/dashboard/stats` | KPI aggregate statistics | All Roles |
| `GET` | `/api/dashboard/charts` | Recharts aggregate data streams | All Roles |
| `GET` | `/api/patients` | Searchable, paginated patient directory | All Roles |
| `POST` | `/api/patients` | Register new patient (generates `PAT-XXXX`) | Admin, Receptionist |
| `GET` | `/api/patients/{id}` | Comprehensive patient dossier with full history | All Roles |
| `PUT` | `/api/patients/{id}` | Update patient profile | Admin, Receptionist |
| `DELETE` | `/api/patients/{id}` | Cascade delete patient record | Admin |
| `GET` | `/api/doctors` | List doctors with department/specialty filters | All Roles |
| `POST` | `/api/doctors` | Onboard doctor and create user login | Admin |
| `GET` | `/api/departments` | List clinical departments with doctor counts | All Roles |
| `POST` | `/api/departments` | Add new clinical department | Admin |
| `GET` | `/api/appointments` | Outpatient appointments with status filters | All Roles |
| `POST` | `/api/appointments` | Book appointment (**checks double-booking**) | All Roles |
| `PATCH`| `/api/appointments/{id}/status` | Update status (Confirmed/Completed/Cancelled) | All Roles |
| `GET` | `/api/medical-records` | Chronological EMR clinical notes | Admin, Doctor |
| `POST` | `/api/medical-records` | File diagnosis and multiple prescriptions | Admin, Doctor |
| `GET` | `/api/prescriptions` | List prescription orders | Admin, Doctor |
| `GET` | `/api/rooms` | Hospital wards with live bed occupancy | Admin, Receptionist |
| `POST` | `/api/rooms` | Add ward room | Admin |
| `GET` | `/api/admissions` | Inpatient admission records | Admin, Receptionist |
| `POST` | `/api/admissions` | Admit patient (atomically sets Room to OCCUPIED) | Admin, Receptionist |
| `PUT` | `/api/admissions/{id}/discharge` | Discharge patient (releases bed & calculates bill) | Admin, Receptionist |
| `GET` | `/api/bills` | Itemized invoice records | Admin, Receptionist |
| `POST` | `/api/bills` | Generate custom patient invoice | Admin, Receptionist |
| `POST` | `/api/payments` | Record payment (prevents overpayment) | Admin, Receptionist |
| `GET` | `/api/staff` | Hospital staff directory | Admin |
| `GET` | `/api/reports/*` | Specialized analytics from SQL views | Admin |

---

## 🎓 DBMS Concepts Demonstrated

This project is built from the ground up to demonstrate essential college DBMS syllabus concepts:

### 1. Relational Database Modeling & Normalization
- **1NF (First Normal Form)**: All attributes are atomic. Multi-valued prescriptions are moved to a separate `prescriptions` relation rather than stored in a comma-separated column.
- **2NF (Second Normal Form)**: Every non-key attribute is fully functionally dependent on the entire primary key.
- **3NF (Third Normal Form)**: No transitive dependencies exist. For example, doctor details (`name`, `specialization`, `department_id`) are stored in `doctors`, and appointments merely reference `doctor_id`.
- **BCNF (Boyce-Codd Normal Form)**: For all functional dependencies $X \rightarrow Y$, $X$ is a super key.

### 2. Primary Keys & Foreign Keys
- Every table has a surrogate integer primary key (`id INT AUTO_INCREMENT PRIMARY KEY`) guaranteeing entity integrity.
- Referential integrity is strictly maintained via foreign keys linking child tables to parent tables (`fk_appointment_patient`, `fk_record_doctor`, etc.).

### 3. Cascading Actions & Integrity Preservation
- `ON DELETE CASCADE`: When a patient record is deleted, their dependent appointments, prescriptions, and medical records are automatically removed.
- `ON DELETE RESTRICT`: Prevents deleting a department if active doctors are assigned to it, preventing orphan doctor rows.
- `ON DELETE SET NULL`: If a user account is deleted, the corresponding doctor profile retains historical records with `user_id = NULL`.

### 4. Constraints (Integrity Enforcement)
- **NOT NULL**: Mandatory clinical fields (`patient_code`, `name`, `diagnosis`, `appointment_date`).
- **UNIQUE**: Prevents duplicate codes (`doctor_code`, `patient_code`, `room_number`, `email`).
- **Composite UNIQUE Constraint**: `UNIQUE (doctor_id, appointment_date, appointment_time)` prevents double-booking a physician in the exact same time slot.

### 5. ACID Database Transactions
- **Atomicity & Consistency**: When admitting a patient (`POST /api/admissions`), creating the admission row and updating `rooms.status = 'Occupied'` execute inside a single transaction block. If any error occurs, all modifications are rolled back (`db.rollback()`).
- **Isolation**: Row-level locking (`with_for_update()`) is applied during discharge and payment processing to prevent race conditions during concurrent bed bookings or bill settlements.

### 6. Relational SQL Views
- SQL Views (`CREATE OR REPLACE VIEW ...`) abstract complex multi-table joins and aggregations into reusable virtual tables.
- **`hospital_revenue_view`** computes monthly billing summaries with subqueries.
- **`room_occupancy_view`** merges static room inventory with active inpatient occupancy.

### 7. B-Tree Indexes
- Indexes (`INDEX idx_patient_code`, `idx_patient_phone`, `idx_appointment_doctor_date`) accelerate search queries and join performance from $O(N)$ full table scans to $O(\log N)$ lookups.

---

## 💡 15 Important SQL Queries for Viva Demonstration

Below are 15 examiner-ready SQL queries demonstrating key DBMS concepts:

### Query 1: Multi-Table INNER JOIN (Patient Consultation History)
*Concept: Multi-table relational INNER JOIN*
```sql
SELECT 
    p.patient_code,
    p.name AS patient_name,
    d.name AS doctor_name,
    dept.department_name,
    a.appointment_date,
    a.appointment_time,
    a.status
FROM appointments a
INNER JOIN patients p ON a.patient_id = p.id
INNER JOIN doctors d ON a.doctor_id = d.id
INNER JOIN departments dept ON d.department_id = dept.id
ORDER BY a.appointment_date DESC;
```

---

### Query 2: LEFT OUTER JOIN (Find Departments Without Any Scheduled Appointments)
*Concept: LEFT OUTER JOIN with NULL detection*
```sql
SELECT 
    dept.department_name,
    dept.location,
    COUNT(a.id) AS total_appointments
FROM departments dept
LEFT JOIN doctors d ON dept.id = d.department_id
LEFT JOIN appointments a ON d.id = a.doctor_id
GROUP BY dept.id, dept.department_name, dept.location
HAVING COUNT(a.id) = 0;
```

---

### Query 3: GROUP BY with Aggregate Functions (Doctor Consultation Revenue)
*Concept: GROUP BY, SUM, COUNT, and ORDER BY*
```sql
SELECT 
    d.name AS doctor_name,
    d.specialization,
    COUNT(a.id) AS total_consultations,
    SUM(d.consultation_fee) AS total_consultation_revenue
FROM doctors d
INNER JOIN appointments a ON d.id = a.doctor_id
WHERE a.status = 'Completed'
GROUP BY d.id, d.name, d.specialization
ORDER BY total_consultation_revenue DESC;
```

---

### Query 4: HAVING Clause (High Volume Departments)
*Concept: Filtering aggregated records using HAVING*
```sql
SELECT 
    dept.department_name,
    COUNT(d.id) AS doctor_count
FROM departments dept
INNER JOIN doctors d ON dept.id = d.department_id
GROUP BY dept.id, dept.department_name
HAVING COUNT(d.id) >= 2;
```

---

### Query 5: Subquery with IN (Patients Admitted to ICU Wards)
*Concept: Nested Subquery using IN operator*
```sql
SELECT 
    patient_code,
    name,
    phone,
    emergency_contact
FROM patients
WHERE id IN (
    SELECT adm.patient_id
    FROM admissions adm
    INNER JOIN rooms r ON adm.room_id = r.id
    WHERE r.room_type = 'ICU' AND adm.status = 'Active'
);
```

---

### Query 6: Correlated Subquery (Patients with Above-Average Billing)
*Concept: Correlated Subquery and Scalar Aggregation*
```sql
SELECT 
    p.patient_code,
    p.name,
    b.total_amount
FROM bills b
INNER JOIN patients p ON b.patient_id = p.id
WHERE b.total_amount > (
    SELECT AVG(total_amount) FROM bills
)
ORDER BY b.total_amount DESC;
```

---

### Query 7: EXISTS Operator (Doctors Who Have Handled Admissions)
*Concept: Correlated Subquery using EXISTS*
```sql
SELECT 
    d.doctor_code,
    d.name,
    d.specialization
FROM doctors d
WHERE EXISTS (
    SELECT 1 
    FROM admissions adm 
    WHERE adm.doctor_id = d.id
);
```

---

### Query 8: Date Manipulation & Aggregation (Monthly Patient Registrations)
*Concept: Date formatting, GROUP BY, and chronological sorting*
```sql
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') AS registration_month,
    COUNT(id) AS new_patients_registered
FROM patients
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY registration_month ASC;
```

---

### Query 9: Conditional Aggregation using CASE WHEN (Bed Occupancy Breakdown)
*Concept: Conditional aggregation (Pivot simulation)*
```sql
SELECT 
    room_type,
    COUNT(id) AS total_rooms,
    SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available_beds,
    SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_beds,
    SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance_beds
FROM rooms
GROUP BY room_type;
```

---

### Query 10: Multi-Table Cascade Retrieval (Prescription with Complete Medical History)
*Concept: Multi-level relational join across 4 tables*
```sql
SELECT 
    p.patient_code,
    p.name AS patient_name,
    mr.diagnosis,
    pr.medicine_name,
    pr.dosage,
    pr.frequency,
    pr.duration,
    d.name AS prescribing_doctor
FROM prescriptions pr
INNER JOIN medical_records mr ON pr.medical_record_id = mr.id
INNER JOIN patients p ON pr.patient_id = p.id
INNER JOIN doctors d ON pr.doctor_id = d.id
ORDER BY mr.created_at DESC;
```

---

### Query 11: Outstanding Payment Calculation (Bills vs Payments)
*Concept: Subqueries in SELECT list and COALESCE handling*
```sql
SELECT 
    b.id AS bill_id,
    p.name AS patient_name,
    b.total_amount AS billed_amount,
    COALESCE(SUM(pm.amount), 0.00) AS total_paid,
    (b.total_amount - COALESCE(SUM(pm.amount), 0.00)) AS balance_due,
    b.payment_status
FROM bills b
INNER JOIN patients p ON b.patient_id = p.id
LEFT JOIN payments pm ON b.id = pm.bill_id
GROUP BY b.id, p.name, b.total_amount, b.payment_status
HAVING balance_due > 0;
```

---

### Query 12: Detecting Double-Booking Collisions (Constraint Demonstration)
*Concept: Self-JOIN to identify scheduling conflicts*
```sql
SELECT 
    a1.doctor_id,
    d.name AS doctor_name,
    a1.appointment_date,
    a1.appointment_time,
    COUNT(a1.id) AS appointment_count
FROM appointments a1
INNER JOIN doctors d ON a1.doctor_id = d.id
WHERE a1.status != 'Cancelled'
GROUP BY a1.doctor_id, d.name, a1.appointment_date, a1.appointment_time
HAVING COUNT(a1.id) > 1;
```
*(Returns 0 rows because our unique composite key prevents collisions)*.

---

### Query 13: Querying a Database View (Hospital Revenue View)
*Concept: Querying from virtual table views*
```sql
SELECT 
    billing_month,
    total_invoices,
    total_billed_amount,
    total_collected_amount,
    total_outstanding_amount
FROM hospital_revenue_view
WHERE total_outstanding_amount > 0;
```

---

### Query 14: Stay Duration & Bed Tariff Calculation
*Concept: DATEDIFF, TIMESTAMPDIFF, and arithmetic calculation*
```sql
SELECT 
    adm.id AS admission_id,
    p.name AS patient_name,
    r.room_number,
    r.room_type,
    adm.admission_date,
    COALESCE(adm.discharge_date, NOW()) AS end_date,
    GREATEST(1, CEIL(TIMESTAMPDIFF(SECOND, adm.admission_date, COALESCE(adm.discharge_date, NOW())) / 86400)) AS days_stayed,
    r.daily_charge,
    (GREATEST(1, CEIL(TIMESTAMPDIFF(SECOND, adm.admission_date, COALESCE(adm.discharge_date, NOW())) / 86400)) * r.daily_charge) AS total_room_charge
FROM admissions adm
INNER JOIN rooms r ON adm.room_id = r.id
INNER JOIN patients p ON adm.patient_id = p.id;
```

---

### Query 15: Staff Payroll Breakdown by Department
*Concept: SUM, AVG, MIN, MAX statistical aggregation*
```sql
SELECT 
    dept.department_name,
    COUNT(s.id) AS staff_count,
    MIN(s.salary) AS minimum_salary,
    MAX(s.salary) AS maximum_salary,
    ROUND(AVG(s.salary), 2) AS average_salary,
    SUM(s.salary) AS total_payroll_expense
FROM staff s
INNER JOIN departments dept ON s.department_id = dept.id
WHERE s.status = 'ACTIVE'
GROUP BY dept.id, dept.department_name
ORDER BY total_payroll_expense DESC;
```

---

## 🔮 Future Enhancements
- Integration with external SMS / WhatsApp gateways for appointment reminders.
- Patient Self-Service Portal for viewing laboratory test results and downloading invoices.
- DICOM image viewing for radiology and MRI scan attachments.
- Inventory management for hospital pharmacy stock levels and expiry tracking.

---

## 📜 License
Developed for Academic Educational & Demonstration Purposes.
Designed by Antigravity IDE for BTech Computer Science & Engineering.
