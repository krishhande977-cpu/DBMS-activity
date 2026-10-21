import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailsPage from './pages/PatientDetailsPage';
import DoctorsPage from './pages/DoctorsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import RoomsPage from './pages/RoomsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import BillingPage from './pages/BillingPage';
import PaymentsPage from './pages/PaymentsPage';
import StaffPage from './pages/StaffPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login redirects straight to dashboard (authentication bypassed) */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />

          {/* Hospital Dashboard Routes - All Open & Directly Accessible */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Patients & Profile History */}
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:id" element={<PatientDetailsPage />} />

            {/* Doctors */}
            <Route path="doctors" element={<DoctorsPage />} />

            {/* Departments */}
            <Route path="departments" element={<DepartmentsPage />} />

            {/* Appointments */}
            <Route path="appointments" element={<AppointmentsPage />} />

            {/* Medical Records & Prescriptions */}
            <Route path="medical-records" element={<MedicalRecordsPage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />

            {/* Rooms & Admissions */}
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="admissions" element={<AdmissionsPage />} />

            {/* Billing & Payments */}
            <Route path="billing" element={<BillingPage />} />
            <Route path="payments" element={<PaymentsPage />} />

            {/* Staff & Reports */}
            <Route path="staff" element={<StaffPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
