import React from 'react';
import { Menu, Bell, Database, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from './Badge';

const Navbar = ({ onOpenSidebar, pageTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">{pageTitle}</h2>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            MediCare Hospital Management System • Relational DBMS Edition
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Database Status Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>MySQL Live</span>
        </div>

        {/* User Pill & Logout */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
            <span className="text-[10px] text-slate-400 font-medium">{user?.email}</span>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
