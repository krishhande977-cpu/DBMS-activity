import React, { useState, useEffect } from 'react';
import {
  Briefcase, Search, Plus, Filter, Edit2, Trash2, Phone, Mail,
  Calendar, DollarSign, Building2, User
} from 'lucide-react';
import { staffAPI, departmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Toast from '../components/Toast';

const StaffPage = () => {
  const { hasRole } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Toast
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form State
  const initialForm = {
    name: '',
    role: '',
    department_id: '',
    phone: '',
    email: '',
    salary: 35000,
    joining_date: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchDepartments();
  }, [search, deptFilter, statusFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffAPI.getAll({
        search: search || undefined,
        department_id: deptFilter || undefined,
        status: statusFilter || undefined,
      });
      setStaffList(res.data);
    } catch (err) {
      console.error('Failed to load staff:', err);
      setToast({ message: 'Failed to load staff list', type: 'error' });
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

  const handleOpenEdit = (s) => {
    setCurrentStaff(s);
    setFormData({
      name: s.name,
      role: s.role,
      department_id: s.department_id || '',
      phone: s.phone,
      email: s.email,
      salary: s.salary,
      joining_date: s.joining_date,
      status: s.status,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await staffAPI.create({
        ...formData,
        department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
        salary: parseFloat(formData.salary),
      });
      setIsAddModalOpen(false);
      setToast({ message: 'Staff member onboarded!', type: 'success' });
      fetchStaff();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to add staff member',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await staffAPI.update(currentStaff.id, {
        ...formData,
        department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
        salary: parseFloat(formData.salary),
      });
      setIsEditModalOpen(false);
      setToast({ message: 'Staff record updated successfully!', type: 'success' });
      fetchStaff();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to update staff member',
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Staff Administration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nursing officers, laboratory technicians, pharmacists, and support personnel
          </p>
        </div>
        {hasRole(['ADMIN']) && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Onboard Staff
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by staff name, role, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="RESIGNED">Resigned</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Staff Name</th>
                <th className="py-3.5 px-4">Designation / Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Salary ($)</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading staff directory...</p>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No staff members found matching query.
                  </td>
                </tr>
              ) : (
                staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{s.name}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-xs block">{s.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-sky-800">{s.role}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{s.department_name || 'General Operations'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{s.phone}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      ${Number(s.salary).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{s.joining_date}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={s.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {hasRole(['ADMIN']) && (
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Onboard New Staff Member' : `Edit Staff – ${currentStaff?.name}`}
      >
        <form onSubmit={isAddModalOpen ? handleCreateStaff : handleUpdateStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role / Designation *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. ICU Nurse, Lab Technician"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">General Support / None</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Salary ($)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Joining Date *</label>
              <input
                type="date"
                required
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Employment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="RESIGNED">Resigned</option>
              </select>
            </div>
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
              {submitting ? 'Saving...' : isAddModalOpen ? 'Onboard Staff' : 'Save Changes'}
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

export default StaffPage;
