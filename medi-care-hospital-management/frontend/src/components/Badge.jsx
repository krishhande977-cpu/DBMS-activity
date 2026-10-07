import React from 'react';

const Badge = ({ status, variant }) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Appointments & Admissions
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Confirmed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Completed':
      case 'Discharged':
      case 'Paid':
      case 'Available':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
      case 'Pending':
      case 'Occupied':
      case 'RESIGNED':
      case 'INACTIVE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Partially Paid':
      case 'Active':
      case 'Maintenance':
      case 'ON_LEAVE':
      case 'BUSY':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'No Show':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      
      // Roles
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
      case 'DOCTOR':
        return 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
      case 'RECEPTIONIST':
        return 'bg-teal-50 text-teal-700 border-teal-200 font-semibold';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {status}
    </span>
  );
};

export default Badge;
