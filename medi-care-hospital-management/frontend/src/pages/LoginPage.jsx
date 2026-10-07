import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cross, Lock, Mail, ArrowRight, ShieldCheck, Database,
  Stethoscope, User, Sparkles, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' or 'staff'
  const [doctorName, setDoctorName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registeredDoctors, setRegisteredDoctors] = useState([]);

  const { login, doctorLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch registered doctors list to provide autocomplete suggestions
    const loadDoctors = async () => {
      try {
        const res = await authAPI.getDoctorsList();
        setRegisteredDoctors(res.data);
      } catch (err) {
        console.error('Could not fetch doctor list for suggestions', err);
      }
    };
    loadDoctors();
  }, []);

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorName.trim()) {
      setError('Please provide your Doctor Name');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await doctorLogin(doctorName.trim(), password || 'Doctor@123');
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Doctor authentication failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Invalid email or password. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectDoctorSuggestion = (name) => {
    setDoctorName(name);
    setPassword('Doctor@123');
    setError('');
  };

  const fillStaffCredentials = (demoEmail, demoPassword) => {
    setActiveTab('staff');
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 shadow-xl shadow-sky-500/25 mb-4">
            <Cross className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Medi<span className="text-sky-400">Care</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Hospital Management System</p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-sky-950/60 border border-sky-800/60 rounded-full text-xs text-sky-300 font-medium">
            <Database className="w-3.5 h-3.5" />
            MySQL Relational DBMS Portal
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('doctor');
                setError('');
                if (!password) setPassword('Doctor@123');
              }}
              className={`flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'doctor'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Doctor Sign-In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('staff');
                setError('');
              }}
              className={`flex items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'staff'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Staff / Admin
            </button>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* DOCTOR LOGIN MODE */}
          {activeTab === 'doctor' ? (
            <form onSubmit={handleDoctorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Doctor Name *
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    list="doctor-suggestions"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Enter your Doctor Name (e.g. Dr. Rajesh Sharma)"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 placeholder:font-normal"
                  />
                  <datalist id="doctor-suggestions">
                    {registeredDoctors.map((doc) => (
                      <option key={doc.id} value={doc.name}>
                        {doc.specialization} ({doc.department_name})
                      </option>
                    ))}
                  </datalist>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Type your name or pick from hospital roster. If new, a doctor record will be generated automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Portal Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Doctor@123"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Quick Doctor Name Suggestions Pills */}
              {registeredDoctors.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Click to choose registered Doctor:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {registeredDoctors.slice(0, 4).map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleSelectDoctorSuggestion(d.name)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all text-left ${
                          doctorName === d.name
                            ? 'bg-sky-600 text-white border-sky-600 font-bold'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-sky-800'
                        }`}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
              >
                <span>{submitting ? 'Connecting as Doctor...' : 'Sign In as Doctor'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STAFF / ADMIN LOGIN MODE */
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@medicare.com or reception@medicare.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
              >
                <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Logins Bottom Pill Row */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick 1-Click Role Logins:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillStaffCredentials('admin@medicare.com', 'Admin@123')}
                className="px-2 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('doctor');
                  handleSelectDoctorSuggestion('Dr. Rajesh Sharma');
                }}
                className="px-2 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors text-center"
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => fillStaffCredentials('reception@medicare.com', 'Reception@123')}
                className="px-2 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors text-center"
              >
                Receptionist
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Doctor Identity Mapping & Role-Based Access Control</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
