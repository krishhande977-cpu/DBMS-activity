import React, { useState, useEffect } from 'react';
import {
  UserCheck, Search, Plus, Filter, Edit2, Trash2, Mail, Phone,
  Award, Briefcase, DollarSign, CheckCircle2, Clock
} from 'lucide-react';
import { doctorsAPI, departmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const DoctorsPage = () => {
  const { hasRole } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Toast
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form State
  const initialForm = {
    name: '',
    specialization: '',
    department_id: '',
    phone: '',
    email: '',
    qualification: '',
    experience: 5,
    consultation_fee: 500,
    availability_status: 'AVAILABLE',
    password: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [search, deptFilter, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        doctorsAPI.getAll({
          search: search || undefined,
          department_id: deptFilter || undefined,
          availability_status: statusFilter || undefined,
        }),
        departmentsAPI.getAll(),
      ]);
      setDoctors(docRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setToast({ message: 'Failed to load doctors list', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      department_id: departments[0]?.id || '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setCurrentDoctor(doc);
    setFormData({
      name: doc.name || '',
      specialization: doc.specialization || '',
      department_id: doc.department_id || '',
      phone: doc.phone || '',
      email: doc.email || '',
      qualification: doc.qualification || '',
      experience: doc.experience || 0,
      consultation_fee: doc.consultation_fee || 500,
      availability_status: doc.availability_status || 'AVAILABLE',
      password: '',
    });
    setIsEditModalOpen(true);
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await doctorsAPI.create({
        ...formData,
        department_id: parseInt(formData.department_id, 10),
        experience: parseInt(formData.experience, 10),
        consultation_fee: parseFloat(formData.consultation_fee),
      });
      setIsAddModalOpen(false);
      setToast({ message: 'Doctor profile created successfully!', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to create doctor',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await doctorsAPI.update(currentDoctor.id, {
        name: formData.name,
        specialization: formData.specialization,
        department_id: parseInt(formData.department_id, 10),
        phone: formData.phone,
        email: formData.email,
        qualification: formData.qualification,
        experience: parseInt(formData.experience, 10),
        consultation_fee: parseFloat(formData.consultation_fee),
        availability_status: formData.availability_status,
      });
      setIsEditModalOpen(false);
      setToast({ message: 'Doctor details updated successfully!', type: 'success' });
      fetchData();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to update doctor',
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Doctor Specialists</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active medical officers & attending consultants
          </p>
        </div>
        {hasRole(['ADMIN']) && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Add Doctor
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by doctor name, code, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.department_name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No doctors found matching the query.
          </div>
        ) : (
          doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 text-white flex items-center justify-center font-bold text-base shadow-md shadow-sky-500/20">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                      <p className="text-xs font-semibold text-sky-600">{doc.specialization}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {doc.doctor_code}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                    <span>Dept: <strong className="text-slate-800">{doc.department_name}</strong></span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                    <span className="truncate">{doc.qualification} • {doc.experience} yrs exp</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                    <span>{doc.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
                  <span className="text-sm font-extrabold text-slate-900">${Number(doc.consultation_fee).toFixed(2)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      doc.availability_status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : doc.availability_status === 'BUSY'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {doc.availability_status}
                  </span>

                  {hasRole(['ADMIN']) && (
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add New Doctor' : `Edit Doctor – ${currentDoctor?.name}`}
      >
        <form onSubmit={isAddModalOpen ? handleCreateDoctor : handleUpdateDoctor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Dr. John Doe"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialization *</label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Cardiologist, Neurosurgeon"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications *</label>
              <input
                type="text"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="MBBS, MD, DM"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience</label>
              <input
                type="number"
                min="0"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Availability Status</label>
              <select
                value={formData.availability_status}
                onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
            {isAddModalOpen && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Portal Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank or set Doctor login"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isAddModalOpen ? 'Create Doctor' : 'Save Changes'}
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

export default DoctorsPage;
