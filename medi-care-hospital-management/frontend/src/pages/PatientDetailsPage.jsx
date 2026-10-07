import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, FileText, Pill, Bed, Receipt, CreditCard,
  User, Phone, Mail, MapPin, Heart, Clock, AlertCircle
} from 'lucide-react';
import { patientsAPI } from '../services/api';
import Badge from '../components/Badge';

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    setLoading(true);
    try {
      const res = await patientsAPI.getById(id);
      setPatient(res.data);
    } catch (err) {
      console.error('Error fetching patient profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Loading patient dossier...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-bold text-slate-700">Patient not found</p>
        <button
          onClick={() => navigate('/patients')}
          className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Patients Directory
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Personal Information', icon: User },
    { id: 'appointments', label: `Appointments (${patient.appointments?.length || 0})`, icon: Calendar },
    { id: 'records', label: `Medical History (${patient.medical_records?.length || 0})`, icon: FileText },
    { id: 'prescriptions', label: `Prescriptions (${patient.prescriptions?.length || 0})`, icon: Pill },
    { id: 'admissions', label: `Admissions (${patient.admissions?.length || 0})`, icon: Bed },
    { id: 'billing', label: `Bills & Payments (${patient.bills?.length || 0})`, icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/patients')}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800">
              {patient.patient_code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered on {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200/80 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'text-slate-600 bg-white hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mr-2 stroke-[2.5]" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Demographic & Clinical Profile
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Full Name</span>
                <span className="text-slate-800 font-bold mt-0.5 block">{patient.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date of Birth</span>
                <span className="text-slate-800 font-bold mt-0.5 block">{patient.date_of_birth}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Gender</span>
                <span className="text-slate-800 font-bold mt-0.5 block">{patient.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  {patient.blood_group}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Residential Address</span>
                <span className="text-slate-800 font-medium mt-0.5 block">{patient.address || 'Not registered'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Contact & Emergency Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Primary Phone</span>
                <span className="text-slate-800 font-bold mt-0.5 block">{patient.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Email Address</span>
                <span className="text-slate-800 font-medium mt-0.5 block truncate">{patient.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Emergency Contact</span>
                <span className="text-slate-800 font-bold mt-0.5 block">{patient.emergency_contact || 'None'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Emergency Phone</span>
                <span className="text-slate-800 font-medium mt-0.5 block">{patient.emergency_phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Appointment History</h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {patient.appointments?.length > 0 ? (
              patient.appointments.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">
                      {a.doctor_name} <span className="text-xs font-normal text-slate-400">({a.department_name})</span>
                    </p>
                    <p className="text-slate-500">
                      Date: <strong className="text-slate-700">{a.appointment_date}</strong> at{' '}
                      <strong className="text-slate-700">{a.appointment_time}</strong> • Type: {a.appointment_type}
                    </p>
                    {a.reason && <p className="text-slate-600 italic">"{a.reason}"</p>}
                  </div>
                  <div>
                    <Badge status={a.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-slate-400">No appointments recorded for this patient.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Medical Records */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {patient.medical_records?.length > 0 ? (
            patient.medical_records.map((mr) => (
              <div key={mr.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{mr.diagnosis}</h4>
                    <p className="text-xs text-slate-400">
                      Attending: {mr.doctor_name} • Recorded on: {mr.created_at ? new Date(mr.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {mr.follow_up_date && (
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-semibold">
                      Follow-up: {mr.follow_up_date}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Symptoms Reported</span>
                    <p className="p-3 bg-slate-50 rounded-xl text-slate-600">{mr.symptoms}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block mb-1">Clinical Treatment Notes</span>
                    <p className="p-3 bg-slate-50 rounded-xl text-slate-600">{mr.treatment_notes || 'No treatment notes recorded'}</p>
                  </div>
                </div>

                {mr.prescriptions?.length > 0 && (
                  <div className="pt-2">
                    <span className="font-bold text-xs text-slate-700 block mb-2">Prescribed Medications</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mr.prescriptions.map((pr) => (
                        <div key={pr.id} className="p-3 rounded-xl border border-slate-200 bg-sky-50/40 text-xs">
                          <p className="font-bold text-sky-950">{pr.medicine_name}</p>
                          <p className="text-slate-500 mt-0.5">
                            {pr.dosage} • {pr.frequency} for {pr.duration}
                          </p>
                          {pr.instructions && <p className="text-[11px] text-slate-600 mt-1 italic">{pr.instructions}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              No medical records filed yet.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">All Prescribed Medications</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Medicine</th>
                  <th className="py-3 px-4">Dosage</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Instructions</th>
                  <th className="py-3 px-4">Doctor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patient.prescriptions?.length > 0 ? (
                  patient.prescriptions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.medicine_name}</td>
                      <td className="py-3 px-4">{p.dosage}</td>
                      <td className="py-3 px-4">{p.frequency}</td>
                      <td className="py-3 px-4">{p.duration}</td>
                      <td className="py-3 px-4 italic text-slate-500">{p.instructions || 'As advised'}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{p.doctor_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No prescriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Admissions */}
      {activeTab === 'admissions' && (
        <div className="space-y-3">
          {patient.admissions?.length > 0 ? (
            patient.admissions.map((adm) => (
              <div key={adm.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm text-slate-900">Room {adm.room_number}</h4>
                    <span className="text-xs text-slate-400 font-medium">({adm.room_type} Ward)</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Reason: {adm.reason}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Admitted: {new Date(adm.admission_date).toLocaleString()} • Doctor: {adm.doctor_name}
                  </p>
                </div>
                <div className="text-right">
                  <Badge status={adm.status} />
                  {adm.discharge_date && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Discharged: {new Date(adm.discharge_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              No hospital admission history.
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Billing & Invoices */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          {patient.bills?.length > 0 ? (
            patient.bills.map((b) => (
              <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Invoice #{b.id}</h4>
                    <p className="text-[11px] text-slate-400">
                      Generated: {b.generated_at ? new Date(b.generated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <Badge status={b.payment_status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-slate-400 block font-medium">Consultation</span>
                    <span className="font-bold text-slate-800">${Number(b.consultation_charge).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Room Charge</span>
                    <span className="font-bold text-slate-800">${Number(b.room_charge).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Medicines</span>
                    <span className="font-bold text-slate-800">${Number(b.medicine_charge).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Lab Tests</span>
                    <span className="font-bold text-slate-800">${Number(b.test_charge).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Total Billed</span>
                    <span className="font-extrabold text-sky-700 text-sm">${Number(b.total_amount).toFixed(2)}</span>
                  </div>
                </div>

                {b.payments?.length > 0 && (
                  <div className="pt-1">
                    <span className="text-xs font-bold text-slate-700 block mb-1.5">Payment Receipts</span>
                    <div className="space-y-1.5">
                      {b.payments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                          <div>
                            <span className="font-bold text-emerald-950">${Number(p.amount).toFixed(2)}</span>
                            <span className="text-emerald-700 ml-2">via {p.payment_method}</span>
                            {p.transaction_reference && (
                              <span className="text-[10px] text-emerald-600 font-mono ml-2">
                                ({p.transaction_reference})
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-emerald-700">
                            {new Date(p.payment_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              No bills on record for this patient.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientDetailsPage;
