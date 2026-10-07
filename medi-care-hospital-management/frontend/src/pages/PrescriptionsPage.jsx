import React, { useState, useEffect } from 'react';
import {
  Pill, Search, Printer, Plus, Trash2, Calendar, User,
  Cross, FileText, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { prescriptionsAPI, patientsAPI, doctorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const PrescriptionsPage = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Printable modal state
  const [selectedRx, setSelectedRx] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await prescriptionsAPI.getAll();
      setPrescriptions(res.data);
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
      setToast({ message: 'Failed to load prescriptions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPrint = (rx) => {
    setSelectedRx(rx);
    setIsPrintModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.medicine_name.toLowerCase().includes(search.toLowerCase()) ||
      p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.patient_code?.toLowerCase().includes(search.toLowerCase()) ||
      p.doctor_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Prescription Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active medication orders and printable prescription slips (Rx)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by medicine name, patient name, patient code, or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Medicine Name</th>
                <th className="py-3.5 px-4">Dosage & Frequency</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Doctor</th>
                <th className="py-3.5 px-4">Instructions</th>
                <th className="py-3.5 px-4 text-right">Print Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading prescriptions...</p>
                  </td>
                </tr>
              ) : filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No prescriptions found.
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
                          <Pill className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-900">{rx.medicine_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{rx.dosage}</span>
                      <span className="text-[11px] text-slate-400">{rx.frequency}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{rx.duration}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{rx.patient_name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{rx.patient_code}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{rx.doctor_name}</td>
                    <td className="py-3.5 px-4 italic text-slate-500 max-w-xs truncate">
                      {rx.instructions || 'As advised'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenPrint(rx)}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:text-sky-600 hover:bg-sky-50 text-xs font-semibold transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        Print Rx
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Printable Prescription Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Printable Medical Prescription (Rx)"
        maxWidth="max-w-2xl"
      >
        {selectedRx && (
          <div className="space-y-6">
            {/* The actual printable area */}
            <div id="printable-rx" className="p-6 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-800 font-sans printable-card">
              {/* Hospital Header */}
              <div className="flex items-start justify-between border-b-2 border-sky-600 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white">
                    <Cross className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">
                      Medi<span className="text-sky-600">Care</span> Super Speciality Hospital
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                      Accredited Healthcare & Research Institute • Reg No: MED-MH-2026-99
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Medical Enclave, Central Avenue • Phone: +91 (011) 2345-6789 • help@medicare.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient & Doctor Meta */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Patient Information</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedRx.patient_name}</p>
                  <p className="font-mono text-slate-600 font-semibold">ID: {selectedRx.patient_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Prescribing Physician</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedRx.doctor_name}</p>
                  <p className="text-slate-600">Consultant Specialist</p>
                  <p className="text-[11px] text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Rx Symbol & Medication Body */}
              <div className="py-6">
                <div className="text-3xl font-black text-sky-800 font-serif italic mb-4">
                  ℞
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Medicine Name</th>
                        <th className="py-2.5 px-3">Dosage</th>
                        <th className="py-2.5 px-3">Frequency</th>
                        <th className="py-2.5 px-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-400">1</td>
                        <td className="py-3 px-3 font-bold text-slate-900 text-sm">
                          {selectedRx.medicine_name}
                          {selectedRx.instructions && (
                            <span className="block text-[11px] font-normal text-slate-500 italic mt-0.5">
                              Note: {selectedRx.instructions}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">{selectedRx.dosage}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{selectedRx.frequency}</td>
                        <td className="py-3 px-3 font-medium text-slate-800">{selectedRx.duration}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures & Seal Area */}
              <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Computer generated medical prescription</p>
                  <p className="text-[10px] text-slate-400">Not valid for medicolegal claims without stamp</p>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 pb-8 mb-1"></div>
                  <p className="font-bold text-slate-800">{selectedRx.doctor_name}</p>
                  <p className="text-[10px] text-slate-500">Authorized Medical Practitioner</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 no-print">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        )}
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

export default PrescriptionsPage;
