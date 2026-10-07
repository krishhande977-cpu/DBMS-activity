import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
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

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Guard (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) return null;

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected Hospital Dashboard Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Patients & Profile History */}
            <Route
              path="patients"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
                  <PatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="patients/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
                  <PatientDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Doctors (Admin) */}
            <Route
              path="doctors"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DoctorsPage />
                </ProtectedRoute>
              }
            />

            {/* Departments (Admin) */}
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Appointments (All Roles) */}
            <Route
              path="appointments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST']}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Medical Records & Prescriptions (Admin, Doctor) */}
            <Route
              path="medical-records"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <MedicalRecordsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="prescriptions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
                  <PrescriptionsPage />
                </ProtectedRoute>
              }
            />

            {/* Rooms & Admissions (Admin, Receptionist) */}
            <Route
              path="rooms"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                  <RoomsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admissions"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                  <AdmissionsPage />
                </ProtectedRoute>
              }
            />

            {/* Billing & Payments (Admin, Receptionist) */}
            <Route
              path="billing"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="payments"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />

            {/* Staff & Reports (Admin) */}
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <StaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
