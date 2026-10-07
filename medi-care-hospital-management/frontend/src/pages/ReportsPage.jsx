import React, { useState, useEffect } from 'react';
import {
  BarChart3, Users, Calendar, Building2, DollarSign, Bed, CreditCard,
  Printer, Download, Filter, TrendingUp, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';
import { reportsAPI } from '../services/api';
import Badge from '../components/Badge';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport]);

  const loadReport = async (type) => {
    setLoading(true);
    try {
      let res;
      if (type === 'patients') res = await reportsAPI.getPatientsReport();
      else if (type === 'appointments') res = await reportsAPI.getAppointmentsReport();
      else if (type === 'departments') res = await reportsAPI.getDepartmentsReport();
      else if (type === 'revenue') res = await reportsAPI.getRevenueReport();
      else if (type === 'occupancy') res = await reportsAPI.getRoomOccupancyReport();
      else if (type === 'payments') res = await reportsAPI.getPaymentsReport();

      setReportData(res?.data || null);
    } catch (err) {
      console.error(`Failed to load ${type} report:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const reportTabs = [
    { id: 'revenue', label: 'Revenue & Financials (SQL View)', icon: DollarSign },
    { id: 'occupancy', label: 'Room Occupancy (SQL View)', icon: Bed },
    { id: 'departments', label: 'Department Workload', icon: Building2 },
    { id: 'appointments', label: 'Appointments Summary', icon: Calendar },
    { id: 'patients', label: 'Patient Demographics', icon: Users },
    { id: 'payments', label: 'Payments & Channels', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Analytics & DBMS Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SQL aggregate queries, material views, and relational reporting summaries
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadReport(activeReport)}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition-colors"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handlePrintReport}
            className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200/80 pb-2">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mr-2 stroke-[2.5]" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs">Querying MySQL relational views...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ======================================================== */}
          {/* 1. Revenue Report (hospital_revenue_view) */}
          {/* ======================================================== */}
          {activeReport === 'revenue' && reportData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Billed</p>
                  <h4 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                    ${reportData.summary.total_billed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">Across {reportData.summary.total_bills} clinical invoices</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-emerald-600 uppercase">Total Collected</p>
                  <h4 className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                    ${reportData.summary.total_collected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h4>
                  <p className="text-[11px] text-emerald-700/80 mt-1">Settled payments realized</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-xs font-bold text-rose-600 uppercase">Total Outstanding</p>
                  <h4 className="text-2xl font-black text-rose-600 mt-1 font-mono">
                    ${reportData.summary.total_outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h4>
                  <p className="text-[11px] text-rose-700/80 mt-1">Pending patient balances</p>
                </div>
              </div>

              {/* Monthly Revenue Breakdown Table from SQL View */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Query Source: <span className="font-mono text-sky-700">hospital_revenue_view</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Grouped by calendar month</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Billing Month</th>
                        <th className="py-3 px-4">Invoices</th>
                        <th className="py-3 px-4">Consultation ($)</th>
                        <th className="py-3 px-4">Room Ward ($)</th>
                        <th className="py-3 px-4">Medicines ($)</th>
                        <th className="py-3 px-4">Diagnostics ($)</th>
                        <th className="py-3 px-4">Total Billed ($)</th>
                        <th className="py-3 px-4">Total Collected ($)</th>
                        <th className="py-3 px-4">Outstanding ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {reportData.monthly_breakdown?.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50 font-medium">
                          <td className="py-3 px-4 font-bold text-slate-900">{m.billing_month}</td>
                          <td className="py-3 px-4">{m.total_invoices}</td>
                          <td className="py-3 px-4">${m.consultation_revenue.toFixed(2)}</td>
                          <td className="py-3 px-4">${m.room_revenue.toFixed(2)}</td>
                          <td className="py-3 px-4">${m.medicine_revenue.toFixed(2)}</td>
                          <td className="py-3 px-4">${m.test_revenue.toFixed(2)}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">${m.billed_amount.toFixed(2)}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">${m.collected_amount.toFixed(2)}</td>
                          <td className="py-3 px-4 font-bold text-rose-600">${m.outstanding_amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. Room Occupancy Report (room_occupancy_view) */}
          {/* ======================================================== */}
          {activeReport === 'occupancy' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400">Total Hospital Beds</p>
                  <h4 className="text-2xl font-bold text-slate-900 mt-1">{reportData.summary.total_rooms}</h4>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-emerald-600">Available Beds</p>
                  <h4 className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary.available_rooms}</h4>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-rose-600">Occupied Beds</p>
                  <h4 className="text-2xl font-bold text-rose-600 mt-1">{reportData.summary.occupied_rooms}</h4>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-sky-600">Occupancy Rate</p>
                  <h4 className="text-2xl font-bold text-sky-600 mt-1">{reportData.summary.occupancy_rate_percent}%</h4>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Query Source: <span className="font-mono text-sky-700">room_occupancy_view</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Room #</th>
                        <th className="py-3 px-4">Ward Type</th>
                        <th className="py-3 px-4">Floor</th>
                        <th className="py-3 px-4">Daily Tariff</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Occupant Patient</th>
                        <th className="py-3 px-4">Attending Doctor</th>
                        <th className="py-3 px-4">Admission Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.rooms?.map((r) => (
                        <tr key={r.room_id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.room_number}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{r.room_type}</td>
                          <td className="py-3 px-4">Floor {r.floor}</td>
                          <td className="py-3 px-4 font-mono">${r.daily_charge.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <Badge status={r.status} />
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {r.patient_name ? (
                              <span>{r.patient_name} <span className="text-[10px] font-mono text-slate-400">({r.patient_code})</span></span>
                            ) : (
                              <span className="text-slate-400 font-normal italic">Unoccupied</span>
                            )}
                          </td>
                          <td className="py-3 px-4">{r.attending_doctor || '—'}</td>
                          <td className="py-3 px-4 text-slate-500">{r.admission_date || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. Department Workload Report */}
          {/* ======================================================== */}
          {activeReport === 'departments' && reportData && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Appointments Distribution by Department</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.data || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="department_name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                      <Bar dataKey="total_appointments" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Appointments" />
                      <Bar dataKey="total_doctors" fill="#10b981" radius={[6, 6, 0, 0]} name="Doctors" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Department Name</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4 text-center">Assigned Doctors</th>
                      <th className="py-3 px-4 text-center">Total Appointments</th>
                      <th className="py-3 px-4 text-center">Support Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.data?.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{d.department_name}</td>
                        <td className="py-3 px-4 text-slate-600">{d.location}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">{d.total_doctors}</td>
                        <td className="py-3 px-4 text-center font-bold text-sky-700">{d.total_appointments}</td>
                        <td className="py-3 px-4 text-center text-slate-700">{d.total_staff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. Appointments Summary (patient_appointment_view) */}
          {/* ======================================================== */}
          {activeReport === 'appointments' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Breakdown by Appointment Status</h3>
                  <div className="space-y-2 text-xs">
                    {reportData.by_status?.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
                        <Badge status={s.status} />
                        <span className="font-bold text-slate-800 text-sm">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Breakdown by Appointment Type</h3>
                  <div className="space-y-2 text-xs">
                    {reportData.by_type?.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
                        <span className="font-semibold text-slate-700">{t.type}</span>
                        <span className="font-bold text-sky-700 text-sm">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">
                    Query Source: <span className="font-mono text-sky-700">patient_appointment_view</span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Patient</th>
                        <th className="py-3 px-4">Doctor</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.data?.slice(0, 15).map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-medium">{a.appointment_date} {a.appointment_time}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{a.patient_name}</td>
                          <td className="py-3 px-4">{a.doctor_name}</td>
                          <td className="py-3 px-4">{a.department}</td>
                          <td className="py-3 px-4 font-medium text-slate-700">{a.appointment_type}</td>
                          <td className="py-3 px-4">
                            <Badge status={a.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. Patient Demographics Report */}
          {/* ======================================================== */}
          {activeReport === 'patients' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Patient Blood Group Distribution</h3>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {reportData.by_blood_group?.map((bg, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                        <span className="font-extrabold text-sm text-rose-700 block">{bg.blood_group}</span>
                        <span className="text-[11px] text-slate-500">{bg.count} patients</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Gender Distribution</h3>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {reportData.by_gender?.map((g, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-center">
                        <span className="font-bold text-sky-900 block text-sm">{g.gender}</span>
                        <span className="text-xs text-sky-700 mt-1 block">{g.count} registered</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 6. Payments Report */}
          {/* ======================================================== */}
          {activeReport === 'payments' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportData.by_method?.map((m, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">{m.method} Channel</p>
                    <h4 className="text-2xl font-black text-slate-900 mt-1 font-mono">
                      ${m.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">{m.count} successful transactions</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
