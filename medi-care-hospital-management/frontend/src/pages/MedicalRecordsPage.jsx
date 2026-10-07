import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Plus, Calendar, User, Clock, Pill, Trash2,
  Stethoscope, Eye, AlertCircle
} from 'lucide-react';
import { medicalRecordsAPI, patientsAPI, doctorsAPI, appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const MedicalRecordsPage = () => {
  const { user, hasRole } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Toast
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form State
  const initialForm = {
    patient_id: '',
    doctor_id: '',
    appointment_id: '',
    diagnosis: '',
    symptoms: '',
    treatment_notes: '',
    follow_up_date: '',
    prescriptions: [
      { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ],
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecords();
    fetchAux();
  }, []);

  const fetchAux = async () => {
    try {
      const [patRes, apptRes] = await Promise.all([
        patientsAPI.getAll({ limit: 100 }),
        appointmentsAPI.getAll({ status: 'Scheduled' }),
      ]);
      setPatients(patRes.data.patients);
      setAppointments(apptRes.data);
    } catch (err) {
      console.error('Failed to load auxiliary data:', err);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await medicalRecordsAPI.getAll();
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to load medical records:', err);
      setToast({ message: 'Failed to load records', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      doctor_id: user?.doctor_id || 1,
      patient_id: patients[0]?.id || '',
    });
    setIsAddModalOpen(true);
  };

  const handleAddPrescriptionRow = () => {
    setFormData({
      ...formData,
      prescriptions: [
        ...formData.prescriptions,
        { medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' },
      ],
    });
  };

  const handleRemovePrescriptionRow = (index) => {
    const updated = formData.prescriptions.filter((_, i) => i !== index);
    setFormData({ ...formData, prescriptions: updated });
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...formData.prescriptions];
    updated[index][field] = value;
    setFormData({ ...formData, prescriptions: updated });
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cleanedPrescriptions = formData.prescriptions.filter(
        (p) => p.medicine_name.trim() !== ''
      );

      await medicalRecordsAPI.create({
        patient_id: parseInt(formData.patient_id, 10),
        doctor_id: parseInt(formData.doctor_id, 10),
        appointment_id: formData.appointment_id ? parseInt(formData.appointment_id, 10) : null,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        treatment_notes: formData.treatment_notes,
        follow_up_date: formData.follow_up_date || null,
        prescriptions: cleanedPrescriptions,
      });

      setIsAddModalOpen(false);
      setToast({ message: 'Medical Record & Prescriptions filed!', type: 'success' });
      fetchRecords();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to file medical record',
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Electronic Medical Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic history, clinical treatment evaluations, and drug prescriptions
          </p>
        </div>
        {hasRole(['ADMIN', 'DOCTOR']) && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            New Medical Consultation
          </button>
        )}
      </div>

      {/* Records Timeline / Grid */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            <div className="inline-block w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs">Loading clinical records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 text-xs">
            No medical records registered.
          </div>
        ) : (
          records.map((mr) => (
            <div
              key={mr.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{mr.diagnosis}</h3>
                    <p className="text-xs text-slate-500">
                      Patient: <strong className="text-slate-800">{mr.patient_name}</strong> ({mr.patient_code}) • Doctor: <strong className="text-slate-800">{mr.doctor_name}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {mr.follow_up_date && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                      Follow-up: {mr.follow_up_date}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {mr.created_at ? new Date(mr.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Reported Symptoms</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
                    {mr.symptoms}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">Physician Treatment Notes</span>
                  <p className="p-3 bg-slate-50 rounded-xl text-slate-600 leading-relaxed">
                    {mr.treatment_notes || 'No treatment notes recorded.'}
                  </p>
                </div>
              </div>

              {mr.prescriptions?.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                    <Pill className="w-3.5 h-3.5 text-sky-600" />
                    Prescribed Medications ({mr.prescriptions.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {mr.prescriptions.map((pr) => (
                      <div key={pr.id} className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100 text-xs">
                        <p className="font-bold text-sky-950">{pr.medicine_name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {pr.dosage} • {pr.frequency} ({pr.duration})
                        </p>
                        {pr.instructions && (
                          <p className="text-[10px] text-slate-600 mt-1 italic">{pr.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Consultation Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="File Medical Consultation & Prescription"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Appointment (Optional)</label>
              <select
                value={formData.appointment_id}
                onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">None / Walk-in</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.patient_name} - {a.appointment_date} ({a.appointment_time})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date</label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="e.g. Type 2 Diabetes Mellitus, Acute Bronchitis"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms Reported *</label>
              <textarea
                required
                rows="3"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Observed and reported symptoms..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Notes & Advice</label>
              <textarea
                rows="3"
                value={formData.treatment_notes}
                onChange={(e) => setFormData({ ...formData, treatment_notes: e.target.value })}
                placeholder="Clinical regime, dietary advice, or diagnostic referrals..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              ></textarea>
            </div>
          </div>

          {/* Multiple Prescriptions Form */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-sky-600" />
                Prescribe Medications
              </span>
              <button
                type="button"
                onClick={handleAddPrescriptionRow}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-2">
              {formData.prescriptions.map((pr, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <div className="col-span-12 sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={pr.medicine_name}
                      onChange={(e) => handlePrescriptionChange(index, 'medicine_name', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={pr.dosage}
                      onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={pr.frequency}
                      onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Duration"
                      value={pr.duration}
                      onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={pr.instructions}
                      onChange={(e) => handlePrescriptionChange(index, 'instructions', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {formData.prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePrescriptionRow(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {submitting ? 'Saving Record...' : 'File Record'}
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

export default MedicalRecordsPage;
