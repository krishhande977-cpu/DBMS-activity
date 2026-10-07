import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, MapPin, Users, Activity } from 'lucide-react';
import { departmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const DepartmentsPage = () => {
  const { hasRole } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Toast
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form State
  const initialForm = {
    department_name: '',
    description: '',
    location: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentsAPI.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setToast({ message: 'Failed to load departments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setCurrentDept(dept);
    setFormData({
      department_name: dept.department_name,
      description: dept.description || '',
      location: dept.location,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (dept) => {
    setCurrentDept(dept);
    setIsDeleteModalOpen(true);
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await departmentsAPI.create(formData);
      setIsAddModalOpen(false);
      setToast({ message: 'Department created successfully!', type: 'success' });
      fetchDepartments();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to create department',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await departmentsAPI.update(currentDept.id, formData);
      setIsEditModalOpen(false);
      setToast({ message: 'Department updated successfully!', type: 'success' });
      fetchDepartments();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to update department',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async () => {
    setSubmitting(true);
    try {
      await departmentsAPI.delete(currentDept.id);
      setIsDeleteModalOpen(false);
      setToast({ message: 'Department deleted successfully.', type: 'info' });
      fetchDepartments();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to delete department',
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Departments</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Specialized hospital clinical divisions & wings
          </p>
        </div>
        {hasRole(['ADMIN']) && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Add Department
          </button>
        )}
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs">Loading hospital departments...</p>
          </div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                    <Building2 className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {dept.doctor_count} {dept.doctor_count === 1 ? 'Doctor' : 'Doctors'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{dept.department_name}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {dept.description || 'Dedicated clinical specialty center providing diagnostics and treatment.'}
                </p>

                <div className="mt-4 flex items-center text-xs font-medium text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-sky-600 mr-1.5 flex-shrink-0" />
                  <span>{dept.location}</span>
                </div>
              </div>

              {hasRole(['ADMIN']) && (
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(dept)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Create New Department' : `Edit Department – ${currentDept?.department_name}`}
      >
        <form onSubmit={isAddModalOpen ? handleCreateDepartment : handleUpdateDepartment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={formData.department_name}
              onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
              placeholder="e.g. Cardiology, Dermatology"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location / Floor / Wing *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Wing A - 3rd Floor"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description & Services</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief details about the clinical division..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
            ></textarea>
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
              {submitting ? 'Saving...' : isAddModalOpen ? 'Create Department' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Department Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{currentDept?.department_name}</strong>?
            Note: Deletion will be rejected if doctors or staff are currently assigned to this department to uphold database integrity.
          </p>
          <div className="flex justify-end space-x-2 pt-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteDepartment}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              {submitting ? 'Deleting...' : 'Delete Department'}
            </button>
          </div>
        </div>
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

export default DepartmentsPage;
