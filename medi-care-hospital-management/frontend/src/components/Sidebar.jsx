import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  CalendarDays,
  FileText,
  Pill,
  Bed,
  DoorOpen,
  Receipt,
  CreditCard,
  Briefcase,
  BarChart3,
  LogOut,
  Cross
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'RECEPTIONIST';

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
    },
    {
      title: 'Patients',
      path: '/patients',
      icon: Users,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
    },
    {
      title: 'Doctors',
      path: '/doctors',
      icon: UserCheck,
      roles: ['ADMIN'],
    },
    {
      title: 'Departments',
      path: '/departments',
      icon: Building2,
      roles: ['ADMIN'],
    },
    {
      title: 'Appointments',
      path: '/appointments',
      icon: CalendarDays,
      roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
    },
    {
      title: 'Medical Records',
      path: '/medical-records',
      icon: FileText,
      roles: ['ADMIN', 'DOCTOR'],
    },
    {
      title: 'Prescriptions',
      path: '/prescriptions',
      icon: Pill,
      roles: ['ADMIN', 'DOCTOR'],
    },
    {
      title: 'Rooms',
      path: '/rooms',
      icon: Bed,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      title: 'Admissions',
      path: '/admissions',
      icon: DoorOpen,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      title: 'Billing',
      path: '/billing',
      icon: Receipt,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      title: 'Payments',
      path: '/payments',
      icon: CreditCard,
      roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
      title: 'Staff',
      path: '/staff',
      icon: Briefcase,
      roles: ['ADMIN'],
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: BarChart3,
      roles: ['ADMIN'],
    },
  ];

  const allowedMenuItems = menuItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Cross className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Medi<span className="text-sky-400">Care</span>
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">HMS Portal</p>
            </div>
          </div>
        </div>

        {/* User Info Capsule */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-800/30">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-300 font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <div className="mt-0.5">
                <Badge status={role} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {allowedMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 stroke-[2]" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Bottom Footer */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
