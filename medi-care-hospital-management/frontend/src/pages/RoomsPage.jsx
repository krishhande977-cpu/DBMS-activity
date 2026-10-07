import React, { useState, useEffect } from 'react';
import {
  Bed, Search, Plus, Filter, Edit2, Trash2, CheckCircle2, AlertTriangle,
  Layers, DollarSign, UserCheck
} from 'lucide-react';
import { roomsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Toast from '../components/Toast';

const RoomsPage = () => {
  const { hasRole } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');

  // Modals & Toast
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form State
  const initialForm = {
    room_number: '',
    room_type: 'General',
    floor: 1,
    status: 'Available',
    daily_charge: 600,
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [statusFilter, typeFilter, floorFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomsAPI.getAll({
        status: statusFilter || undefined,
        room_type: typeFilter || undefined,
        floor: floorFilter ? parseInt(floorFilter, 10) : undefined,
      });
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setToast({ message: 'Failed to load rooms', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setCurrentRoom(r);
    setFormData({
      room_number: r.room_number,
      room_type: r.room_type,
      floor: r.floor,
      status: r.status,
      daily_charge: r.daily_charge,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await roomsAPI.create({
        ...formData,
        floor: parseInt(formData.floor, 10),
        daily_charge: parseFloat(formData.daily_charge),
      });
      setIsAddModalOpen(false);
      setToast({ message: 'Room added to hospital inventory!', type: 'success' });
      fetchRooms();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to add room',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await roomsAPI.update(currentRoom.id, {
        room_number: formData.room_number,
        room_type: formData.room_type,
        floor: parseInt(formData.floor, 10),
        status: formData.status,
        daily_charge: parseFloat(formData.daily_charge),
      });
      setIsEditModalOpen(false);
      setToast({ message: 'Room updated successfully!', type: 'success' });
      fetchRooms();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to update room',
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Wards & Room Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inpatient bed status, ward tariffs, and current admissions
          </p>
        </div>
        {hasRole(['ADMIN']) && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Add Room
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Maintenance">Maintenance</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        >
          <option value="">All Ward Types</option>
          <option value="General">General</option>
          <option value="Semi-Private">Semi-Private</option>
          <option value="Private">Private</option>
          <option value="ICU">ICU (Intensive Care)</option>
        </select>

        <select
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        >
          <option value="">All Floors</option>
          <option value="1">Floor 1</option>
          <option value="2">Floor 2</option>
          <option value="3">Floor 3</option>
        </select>
      </div>

      {/* Visual Room Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs">Loading rooms from database...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No rooms match your filter.
          </div>
        ) : (
          rooms.map((r) => (
            <div
              key={r.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                r.status === 'Available'
                  ? 'bg-white border-emerald-200 hover:border-emerald-300 shadow-sm'
                  : r.status === 'Occupied'
                  ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300 shadow-sm'
                  : 'bg-amber-50/30 border-amber-200 hover:border-amber-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-lg text-slate-900 font-mono tracking-tight">
                    Room {r.room_number}
                  </span>
                  <Badge status={r.status} />
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p className="font-semibold text-sky-700">{r.room_type} Ward</p>
                  <p className="text-slate-400">Floor {r.floor}</p>
                  <p className="font-bold text-slate-900 mt-2">
                    ${Number(r.daily_charge).toFixed(2)} <span className="text-[11px] font-normal text-slate-400">/ day</span>
                  </p>
                </div>

                {r.current_patient_name && (
                  <div className="mt-3 p-2 rounded-xl bg-rose-100/70 border border-rose-200 text-[11px] text-rose-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                    <span className="font-semibold truncate">Occupant: {r.current_patient_name}</span>
                  </div>
                )}
              </div>

              {hasRole(['ADMIN', 'RECEPTIONIST']) && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Add New Room' : `Edit Room ${currentRoom?.room_number}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={isAddModalOpen ? handleCreateRoom : handleUpdateRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Room Number *</label>
            <input
              type="text"
              required
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              placeholder="e.g. 101, 202, 305"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Room Type *</label>
            <select
              value={formData.room_type}
              onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="General">General</option>
              <option value="Semi-Private">Semi-Private</option>
              <option value="Private">Private</option>
              <option value="ICU">ICU (Intensive Care)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Floor Level</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Daily Charge ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.daily_charge}
                onChange={(e) => setFormData({ ...formData, daily_charge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Room Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
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
              {submitting ? 'Saving...' : isAddModalOpen ? 'Create Room' : 'Save Changes'}
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

export default RoomsPage;
