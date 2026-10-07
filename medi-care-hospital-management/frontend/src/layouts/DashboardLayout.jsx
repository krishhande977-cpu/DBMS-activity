import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Helper to extract a friendly title from path
  const getPageTitle = (pathname) => {
    const parts = pathname.split('/').filter(Boolean);
    if (!parts.length) return 'Dashboard';
    const main = parts[0];
    const map = {
      dashboard: 'Dashboard Overview',
      patients: 'Patient Management',
      doctors: 'Doctor Directory',
      departments: 'Hospital Departments',
      appointments: 'Appointment Scheduler',
      'medical-records': 'Electronic Medical Records',
      prescriptions: 'Prescription Records',
      rooms: 'Ward & Room Management',
      admissions: 'Inpatient Admissions',
      billing: 'Patient Billing & Invoices',
      payments: 'Payment Transactions',
      staff: 'Hospital Staff',
      reports: 'Analytics & DBMS Reports',
    };
    return map[main] || 'MediCare Hospital';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
