import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Bed,
  Receipt,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertTriangle,
  Building
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, chartsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getCharts(),
      ]);
      setStats(statsRes.data);
      setCharts(chartsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load live dashboard statistics. Please ensure the backend server and MySQL are running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Connecting to MySQL & loading metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3">
        <AlertTriangle className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">Dashboard Connection Error</h4>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-sky-800 to-teal-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-sky-200 mb-3">
            <span>Hospital Operational Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Administrator'}
          </h2>
          <p className="text-sm text-sky-100/90 mt-1 max-w-2xl">
            {user?.role === 'DOCTOR'
              ? 'Review your scheduled consultations, diagnostic records, and active patient profiles.'
              : 'Real-time overview of bed occupancy, patient admissions, outpatient appointments, and revenue.'}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={stats?.total_patients ?? 0}
          icon={Users}
          color="blue"
          subtitle="Registered Patients"
          onClick={() => navigate('/patients')}
        />
        <StatCard
          title="Total Doctors"
          value={stats?.total_doctors ?? 0}
          icon={UserCheck}
          color="emerald"
          subtitle="Specialists Available"
          onClick={() => user?.role === 'ADMIN' && navigate('/doctors')}
        />
        <StatCard
          title="Today's Appointments"
          value={stats?.today_appointments ?? 0}
          icon={Calendar}
          color="purple"
          subtitle="Outpatient Bookings"
          onClick={() => navigate('/appointments')}
        />
        <StatCard
          title="Available Rooms"
          value={`${stats?.available_rooms ?? 0} / ${(stats?.available_rooms ?? 0) + (stats?.occupied_rooms ?? 0)}`}
          icon={Bed}
          color="cyan"
          subtitle={`${stats?.occupied_rooms ?? 0} Beds Occupied`}
          onClick={() => navigate('/rooms')}
        />
      </div>

      {/* Second KPI row for Financials / Pending */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Billed"
          value={`$${Number(stats?.total_revenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          subtitle={`$${Number(stats?.total_collected || 0).toLocaleString()} Collected`}
          onClick={() => navigate('/billing')}
        />
        <StatCard
          title="Pending Invoices"
          value={stats?.pending_bills ?? 0}
          icon={Receipt}
          color="rose"
          subtitle={`$${Number(stats?.total_outstanding || 0).toLocaleString()} Outstanding`}
          onClick={() => navigate('/billing')}
        />
        <StatCard
          title="Bed Occupancy Rate"
          value={
            (stats?.available_rooms + stats?.occupied_rooms) > 0
              ? `${Math.round((stats.occupied_rooms / (stats.available_rooms + stats.occupied_rooms)) * 100)}%`
              : '0%'
          }
          icon={TrendingUp}
          color="amber"
          subtitle="Current Inpatient Ward"
          onClick={() => navigate('/rooms')}
        />
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Department */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Appointments by Department</h3>
              <p className="text-xs text-slate-500">Distribution across medical specialties</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.appointments_by_dept || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Monthly Revenue & Collections</h3>
              <p className="text-xs text-slate-500">Billed amount vs realized collections ($)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.monthly_revenue || []} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="billed" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Total Billed" />
                <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Collected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two-Column Grid for Recent Activity & Pending Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Appointments</h3>
              <p className="text-xs text-slate-500">Upcoming and recently scheduled patient visits</p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recent_appointments?.length > 0 ? (
              stats.recent_appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      {appt.appointment_type?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{appt.patient_name}</p>
                      <p className="text-[11px] text-slate-500">
                        {appt.doctor_name} • {appt.appointment_date} at {appt.appointment_time}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Badge status={appt.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent appointments recorded</p>
            )}
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pending & Partial Invoices</h3>
              <p className="text-xs text-slate-500">Bills requiring payment settlement</p>
            </div>
            <button
              onClick={() => navigate('/billing')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stats?.pending_payments?.length > 0 ? (
              stats.pending_payments.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{bill.patient_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{bill.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Total: ${bill.total_amount.toLocaleString()} • Balance: <span className="font-semibold text-rose-600">${bill.balance_amount.toLocaleString()}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge status={bill.payment_status} />
                    <p className="text-[10px] text-slate-400 mt-1">{bill.generated_at}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">All hospital bills are currently settled!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
