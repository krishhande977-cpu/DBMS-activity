import React, { useState, useEffect } from 'react';
import {
  DoorOpen, Plus, Search, Filter, LogOut, CheckCircle2, Clock,
  Calendar, Bed, User, Stethoscope, AlertCircle
} from 'lucide-react';
import { admissionsAPI, patientsAPI, doctorsAPI, roomsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Toast from '../components/Toast';

const AdmissionsPage = () => {
  const { hasRole } = useAuth();
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('Active');

  // Modals & Toast
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [currentAdm, setCurrentAdm] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form State
  const initialForm = {
    patient_id: '',
    doctor_id: '',
    room_id: '',
    admission_date: new Date().toISOString().slice(0, 16),
    reason: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmissions();
    fetchAux();
  }, [statusFilter]);

  const fetchAux = async () => {
    try {
      const [patRes, docRes, roomRes] = await Promise.all([
        patientsAPI.getAll({ limit: 100 }),
        doctorsAPI.getAll(),
        roomsAPI.getAll({ status: 'Available' }),
      ]);
      setPatients(patRes.data.patients);
      setDoctors(docRes.data);
      setAvailableRooms(roomRes.data);
    } catch (err) {
      console.error('Failed to load auxiliary data:', err);
    }
  };

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await admissionsAPI.getAll({
        status: statusFilter || undefined,
      });
      setAdmissions(res.data);
    } catch (err) {
      console.error('Failed to load admissions:', err);
      setToast({ message: 'Failed to load admissions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdmit = () => {
    fetchAux(); // Refresh available rooms
    setFormData({
      ...initialForm,
      patient_id: patients[0]?.id || '',
      doctor_id: doctors[0]?.id || '',
      room_id: availableRooms[0]?.id || '',
    });
    setIsAdmitModalOpen(true);
  };

  const handleOpenDischarge = (adm) => {
    setCurrentAdm(adm);
    setDischargeDate(new Date().toISOString().slice(0, 16));
    setIsDischargeModalOpen(true);
  };

  const handleAdmitPatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await admissionsAPI.create({
        patient_id: parseInt(formData.patient_id, 10),
        doctor_id: parseInt(formData.doctor_id, 10),
        room_id: parseInt(formData.room_id, 10),
        admission_date: formData.admission_date,
        reason: formData.reason,
      });
      setIsAdmitModalOpen(false);
      setToast({ message: 'Patient admitted! Room status updated to OCCUPIED.', type: 'success' });
      fetchAdmissions();
      fetchAux();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to admit patient',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischargePatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await admissionsAPI.discharge(currentAdm.id, {
        discharge_date: dischargeDate,
        generate_bill: true,
      });
      setIsDischargeModalOpen(false);
      setToast({ message: 'Patient discharged! Room released and invoice generated.', type: 'success' });
      fetchAdmissions();
      fetchAux();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to discharge patient',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Patient Inpatient Admissions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admission lifecycle, bed assignment, and transactional discharge processing
          </p>
        </div>
        {hasRole(['ADMIN', 'RECEPTIONIST']) && (
          <button
            onClick={handleOpenAdmit}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Admit Patient
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'Active'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active Inpatients
          </button>
          <button
            onClick={() => setStatusFilter('Discharged')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'Discharged'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Discharged History
          </button>
          <button
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === ''
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Records
          </button>
        </div>
      </div>

      {/* Admissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Ward & Room</th>
                <th className="py-3.5 px-4">Admission Date</th>
                <th className="py-3.5 px-4">Attending Doctor</th>
                <th className="py-3.5 px-4">Clinical Reason</th>
                <th className="py-3.5 px-4">Status & Stay</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading admission records...</p>
                  </td>
                </tr>
              ) : admissions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No admission records match your filter.
                  </td>
                </tr>
              ) : (
                admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{adm.patient_name}</span>
                      <span className="font-mono text-[11px] text-sky-600">{adm.patient_code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 block font-mono">
                        Room {adm.room_number}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {adm.room_type} (${adm.daily_charge}/day)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {new Date(adm.admission_date).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{adm.doctor_name}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                      {adm.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={adm.status} />
                      <span className="text-[11px] text-slate-400 block mt-1">
                        Stay: <strong>{adm.calculated_days} {adm.calculated_days === 1 ? 'day' : 'days'}</strong> (${adm.calculated_room_charge})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {adm.status === 'Active' && hasRole(['ADMIN', 'RECEPTIONIST']) && (
                        <button
                          onClick={() => handleOpenDischarge(adm)}
                          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 mr-1" />
                          Discharge
                        </button>
                      )}
                      {adm.status === 'Discharged' && adm.discharge_date && (
                        <span className="text-[11px] text-slate-400">
                          Discharged: {new Date(adm.discharge_date).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admit Patient Modal */}
      <Modal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        title="Admit Inpatient to Hospital Ward"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAdmitPatient} className="space-y-4">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Attending Doctor *</label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Available Bed / Room *</label>
              <select
                required
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">Choose Available Room</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} – {r.room_type} Ward (Floor {r.floor}, ${r.daily_charge}/day)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Admission Timestamp *</label>
              <input
                type="datetime-local"
                required
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Admission *</label>
              <textarea
                required
                rows="2"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Clinical reason, observation, surgery prep, etc."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              ></textarea>
            </div>
          </div>

          <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-[11px] text-sky-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span>Database Transaction: Room status automatically switches to OCCUPIED.</span>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdmitModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {submitting ? 'Admitting...' : 'Confirm Admission'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Discharge Modal */}
      <Modal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        title="Discharge Patient & Generate Final Bill"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleDischargePatient} className="space-y-4">
          <p className="text-xs text-slate-600">
            Discharging patient <strong className="text-slate-900">{currentAdm?.patient_name}</strong> from Room{' '}
            <strong className="text-slate-900">{currentAdm?.room_number}</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Discharge Timestamp *</label>
            <input
              type="datetime-local"
              required
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Automated Transaction Workflow:
            </p>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-900/80">
              <li>Calculates days stayed and room tariff.</li>
              <li>Releases Room {currentAdm?.room_number} (sets status to AVAILABLE).</li>
              <li>Generates finalized inpatient bill for payment processing.</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDischargeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 disabled:opacity-50"
            >
              {submitting ? 'Processing Discharge...' : 'Confirm Discharge'}
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

export default AdmissionsPage;
