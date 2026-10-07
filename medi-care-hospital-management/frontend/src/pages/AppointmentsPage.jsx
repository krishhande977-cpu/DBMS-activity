import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Search, Plus, Filter, CheckCircle2, XCircle, Clock,
  Calendar, User, AlertCircle, Edit2
} from 'lucide-react';
import { appointmentsAPI, doctorsAPI, patientsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Toast from '../components/Toast';

const AppointmentsPage = () => {
  const { user, hasRole } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals & Toast
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [currentAppt, setCurrentAppt] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form State
  const initialForm = {
    patient_id: '',
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00:00',
    appointment_type: 'General Checkup',
    reason: '',
    status: 'Scheduled',
  };
  const [formData, setFormData] = useState(initialForm);
  const [rescheduleData, setRescheduleData] = useState({
    appointment_date: '',
    appointment_time: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAuxiliaryData();
    if (user?.role === 'DOCTOR' && user?.doctor_id) {
      setDoctorFilter(String(user.doctor_id));
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [search, doctorFilter, statusFilter, dateFilter]);

  const fetchAuxiliaryData = async () => {
    try {
      const [docRes, patRes] = await Promise.all([
        doctorsAPI.getAll(),
        patientsAPI.getAll({ limit: 100 }),
      ]);
      setDoctors(docRes.data);
      setPatients(patRes.data.patients);
    } catch (err) {
      console.error('Failed to load aux data:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getAll({
        search: search || undefined,
        doctor_id: doctorFilter || undefined,
        status: statusFilter || undefined,
        appointment_date: dateFilter || undefined,
      });
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setToast({ message: 'Failed to load appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBook = () => {
    setFormData({
      ...initialForm,
      doctor_id: user?.role === 'DOCTOR' && user.doctor_id ? user.doctor_id : (doctors[0]?.id || ''),
      patient_id: patients[0]?.id || '',
    });
    setIsBookModalOpen(true);
  };

  const handleOpenReschedule = (appt) => {
    setCurrentAppt(appt);
    setRescheduleData({
      appointment_date: appt.appointment_date,
      appointment_time: appt.appointment_time,
    });
    setIsRescheduleModalOpen(true);
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentsAPI.create({
        ...formData,
        patient_id: parseInt(formData.patient_id, 10),
        doctor_id: parseInt(formData.doctor_id, 10),
      });
      setIsBookModalOpen(false);
      setToast({ message: 'Appointment booked successfully!', type: 'success' });
      fetchAppointments();
    } catch (err) {
      // Catch double-booking error from backend
      setToast({
        message: err.response?.data?.detail || 'Failed to book appointment',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await appointmentsAPI.update(currentAppt.id, {
        appointment_date: rescheduleData.appointment_date,
        appointment_time: rescheduleData.appointment_time,
      });
      setIsRescheduleModalOpen(false);
      setToast({ message: 'Appointment rescheduled!', type: 'success' });
      fetchAppointments();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Double-booking conflict or reschedule error',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await appointmentsAPI.updateStatus(apptId, newStatus);
      setToast({ message: `Appointment marked as ${newStatus}`, type: 'success' });
      fetchAppointments();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to update status',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Appointment Scheduler</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bookings, slot allocation, and schedule tracking
          </p>
        </div>
        <button
          onClick={handleOpenBook}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Book Appointment
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by patient name, patient code, or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {user?.role !== 'DOCTOR' && (
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />

          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Doctor & Specialty</th>
                <th className="py-3.5 px-4">Type & Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading scheduled appointments...</p>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No appointments found matching your query.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{a.appointment_date}</span>
                      <span className="font-mono text-[11px] text-sky-600 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {a.appointment_time}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{a.patient_name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{a.patient_code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{a.doctor_name}</span>
                      <span className="text-[11px] text-slate-400">{a.department_name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{a.appointment_type}</span>
                      <span className="text-[11px] text-slate-500 italic truncate max-w-xs block">
                        {a.reason || 'General checkup'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={a.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(a.id, 'Completed')}
                              title="Mark Completed"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenReschedule(a)}
                              title="Reschedule Slot"
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(a.id, 'Cancelled')}
                              title="Cancel Appointment"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule New Appointment"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Patient *</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patient_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Doctor *</label>
              <select
                required
                disabled={user?.role === 'DOCTOR'}
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} – {d.specialization} (${d.consultation_fee})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot *</label>
              <select
                required
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="09:00:00">09:00 AM</option>
                <option value="09:30:00">09:30 AM</option>
                <option value="10:00:00">10:00 AM</option>
                <option value="10:30:00">10:30 AM</option>
                <option value="11:00:00">11:00 AM</option>
                <option value="11:30:00">11:30 AM</option>
                <option value="12:00:00">12:00 PM</option>
                <option value="14:00:00">02:00 PM</option>
                <option value="14:30:00">02:30 PM</option>
                <option value="15:00:00">03:00 PM</option>
                <option value="15:30:00">03:30 PM</option>
                <option value="16:00:00">04:00 PM</option>
                <option value="16:30:00">04:30 PM</option>
                <option value="17:00:00">05:00 PM</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Type</label>
              <select
                value={formData.appointment_type}
                onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="General Checkup">General Checkup</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Routine">Routine</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Chief Reason / Symptoms</label>
              <textarea
                rows="2"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Describe reason for consultation..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              ></textarea>
            </div>
          </div>

          <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-[11px] text-sky-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>The system enforces relational double-booking constraints to prevent schedule collisions.</span>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {submitting ? 'Checking Slots...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        title={`Reschedule Slot – ${currentAppt?.patient_name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReschedule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Date *</label>
            <input
              type="date"
              required
              value={rescheduleData.appointment_date}
              onChange={(e) => setRescheduleData({ ...rescheduleData, appointment_date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Time Slot *</label>
            <select
              required
              value={rescheduleData.appointment_time}
              onChange={(e) => setRescheduleData({ ...rescheduleData, appointment_time: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="09:00:00">09:00 AM</option>
              <option value="09:30:00">09:30 AM</option>
              <option value="10:00:00">10:00 AM</option>
              <option value="10:30:00">10:30 AM</option>
              <option value="11:00:00">11:00 AM</option>
              <option value="11:30:00">11:30 AM</option>
              <option value="12:00:00">12:00 PM</option>
              <option value="14:00:00">02:00 PM</option>
              <option value="14:30:00">02:30 PM</option>
              <option value="15:00:00">03:00 PM</option>
              <option value="15:30:00">03:30 PM</option>
              <option value="16:00:00">04:00 PM</option>
              <option value="16:30:00">04:30 PM</option>
              <option value="17:00:00">05:00 PM</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRescheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {submitting ? 'Validating...' : 'Update Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
