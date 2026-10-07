import React, { useState, useEffect } from 'react';
import {
  CreditCard, Search, Plus, Filter, DollarSign, Calendar,
  CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { paymentsAPI, billsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const PaymentsPage = () => {
  const { hasRole } = useAuth();
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [methodFilter, setMethodFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals & Toast
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form State
  const initialForm = {
    bill_id: '',
    amount: '',
    payment_method: 'UPI',
    transaction_reference: '',
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchBills();
  }, [methodFilter]);

  const fetchBills = async () => {
    try {
      const res = await billsAPI.getAll({ payment_status: 'Pending' });
      const partialRes = await billsAPI.getAll({ payment_status: 'Partially Paid' });
      setBills([...res.data, ...partialRes.data]);
    } catch (err) {
      console.error('Failed to load pending bills:', err);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsAPI.getAll({
        payment_method: methodFilter || undefined,
      });
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to load payments:', err);
      setToast({ message: 'Failed to load payments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    fetchBills();
    setFormData({
      ...initialForm,
      bill_id: bills[0]?.id || '',
      transaction_reference: `TXN-${Date.now().toString().slice(-6)}`,
    });
    setIsAddModalOpen(true);
  };

  const handleBillSelect = (billId) => {
    const selected = bills.find((b) => b.id === parseInt(billId, 10));
    setFormData({
      ...formData,
      bill_id: billId,
      amount: selected?.balance_amount || '',
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await paymentsAPI.create({
        bill_id: parseInt(formData.bill_id, 10),
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        transaction_reference: formData.transaction_reference,
      });
      setIsAddModalOpen(false);
      setToast({ message: 'Payment recorded and bill updated!', type: 'success' });
      fetchPayments();
      fetchBills();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to record payment',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.patient_code?.toLowerCase().includes(search.toLowerCase()) ||
      p.transaction_reference?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = filteredPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payment Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Settlement records, transaction references, and real-time revenue receipts
          </p>
        </div>
        {hasRole(['ADMIN', 'RECEPTIONIST']) && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Record Payment
          </button>
        )}
      </div>

      {/* Filter and Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by patient name, patient code, transaction reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Realized</span>
            <span className="text-lg font-extrabold text-emerald-600 font-mono">
              ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Bill Reference</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Amount Paid</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Transaction Reference</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading payments...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      REC-{String(p.id).padStart(5, '0')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-sky-600 font-semibold">
                      INV-{String(p.bill_id).padStart(5, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{p.patient_name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{p.patient_code}</span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm font-mono">
                      +${Number(p.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {p.transaction_reference || 'CASH-COUNTER'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.payment_date ? new Date(p.payment_date).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record New Patient Payment"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Pending Invoice *</label>
            <select
              required
              value={formData.bill_id}
              onChange={(e) => handleBillSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="">Select Invoice</option>
              {bills.map((b) => (
                <option key={b.id} value={b.id}>
                  INV-{String(b.id).padStart(5, '0')} – {b.patient_name} (Due: ${Number(b.balance_amount).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ($) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method *</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="UPI">UPI / QR Code</option>
              <option value="Card">Card (POS Terminal)</option>
              <option value="Cash">Cash Receipt</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Reference</label>
            <input
              type="text"
              value={formData.transaction_reference}
              onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
              placeholder="e.g. UPI-REF-1234 or Bank Auth ID"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
            />
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Process Payment'}
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

export default PaymentsPage;
