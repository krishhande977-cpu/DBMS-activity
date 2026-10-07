import React, { useState, useEffect } from 'react';
import {
  Receipt, Plus, Search, Filter, Printer, DollarSign, CreditCard,
  User, CheckCircle2, AlertCircle, Cross
} from 'lucide-react';
import { billsAPI, patientsAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import Toast from '../components/Toast';

const BillingPage = () => {
  const { hasRole } = useAuth();
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Bill Form State
  const initialBillForm = {
    patient_id: '',
    consultation_charge: 500,
    room_charge: 0,
    medicine_charge: 350,
    test_charge: 400,
    other_charge: 0,
  };
  const [billFormData, setBillFormData] = useState(initialBillForm);

  // Payment Form State
  const [payFormData, setPayFormData] = useState({
    amount: '',
    payment_method: 'UPI',
    transaction_reference: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, [statusFilter, search]);

  const fetchPatients = async () => {
    try {
      const res = await patientsAPI.getAll({ limit: 100 });
      setPatients(res.data.patients);
    } catch (err) {
      console.error('Failed to load patients for billing:', err);
    }
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await billsAPI.getAll({
        search: search || undefined,
        payment_status: statusFilter || undefined,
      });
      setBills(res.data);
    } catch (err) {
      console.error('Failed to load bills:', err);
      setToast({ message: 'Failed to load bills', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddBill = () => {
    setBillFormData({
      ...initialBillForm,
      patient_id: patients[0]?.id || '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenInvoice = (bill) => {
    setSelectedBill(bill);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenPay = (bill) => {
    setSelectedBill(bill);
    setPayFormData({
      amount: bill.balance_amount > 0 ? bill.balance_amount : '',
      payment_method: 'UPI',
      transaction_reference: `TXN-${Date.now().toString().slice(-6)}`,
    });
    setIsPayModalOpen(true);
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await billsAPI.create({
        patient_id: parseInt(billFormData.patient_id, 10),
        consultation_charge: parseFloat(billFormData.consultation_charge || 0),
        room_charge: parseFloat(billFormData.room_charge || 0),
        medicine_charge: parseFloat(billFormData.medicine_charge || 0),
        test_charge: parseFloat(billFormData.test_charge || 0),
        other_charge: parseFloat(billFormData.other_charge || 0),
      });
      setIsAddModalOpen(false);
      setToast({ message: 'Bill created successfully!', type: 'success' });
      fetchBills();
    } catch (err) {
      setToast({
        message: err.response?.data?.detail || 'Failed to create bill',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await paymentsAPI.create({
        bill_id: selectedBill.id,
        amount: parseFloat(payFormData.amount),
        payment_method: payFormData.payment_method,
        transaction_reference: payFormData.transaction_reference,
      });
      setIsPayModalOpen(false);
      setToast({ message: 'Payment recorded and bill updated!', type: 'success' });
      fetchBills();
    } catch (err) {
      // Catches overpayment and validation errors from backend!
      setToast({
        message: err.response?.data?.detail || 'Failed to process payment',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalCalculated =
    Number(billFormData.consultation_charge || 0) +
    Number(billFormData.room_charge || 0) +
    Number(billFormData.medicine_charge || 0) +
    Number(billFormData.test_charge || 0) +
    Number(billFormData.other_charge || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Patient Billing & Invoices</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Itemized medical charges, invoice printing, and payment balances
          </p>
        </div>
        {hasRole(['ADMIN', 'RECEPTIONIST']) && (
          <button
            onClick={handleOpenAddBill}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Generate New Bill
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search invoice by patient name, patient code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        >
          <option value="">All Payment Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Generated Date</th>
                <th className="py-3.5 px-4">Breakdown</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status & Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Loading invoice records...</p>
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No billing records found.
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      INV-{String(b.id).padStart(5, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{b.patient_name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{b.patient_code}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {b.generated_at ? new Date(b.generated_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      Fee: ${b.consultation_charge} • Room: ${b.room_charge} • Med: ${b.medicine_charge} • Test: ${b.test_charge}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                      ${Number(b.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={b.payment_status} />
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Paid: ${Number(b.paid_amount).toFixed(2)} • Due:{' '}
                        <strong className={b.balance_amount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          ${Number(b.balance_amount).toFixed(2)}
                        </strong>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenInvoice(b)}
                          title="View / Print Invoice"
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {b.balance_amount > 0 && hasRole(['ADMIN', 'RECEPTIONIST']) && (
                          <button
                            onClick={() => handleOpenPay(b)}
                            title="Record Payment"
                            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                            Pay
                          </button>
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

      {/* Generate Bill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Generate New Hospital Invoice"
      >
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
            <select
              required
              value={billFormData.patient_id}
              onChange={(e) => setBillFormData({ ...billFormData, patient_id: e.target.value })}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={billFormData.consultation_charge}
                onChange={(e) => setBillFormData({ ...billFormData, consultation_charge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Charges ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={billFormData.room_charge}
                onChange={(e) => setBillFormData({ ...billFormData, room_charge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Charges ($)</label>
              <input
                type="number"
                min="0"
                step="10"
                value={billFormData.medicine_charge}
                onChange={(e) => setBillFormData({ ...billFormData, medicine_charge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lab / Diagnostic Tests ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={billFormData.test_charge}
                onChange={(e) => setBillFormData({ ...billFormData, test_charge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Other / Nursing Charges ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={billFormData.other_charge}
                onChange={(e) => setBillFormData({ ...billFormData, other_charge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Calculated Invoice Total:</span>
            <span className="text-base font-extrabold text-sky-700 font-mono">
              ${totalCalculated.toFixed(2)}
            </span>
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
              {submitting ? 'Generating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Record Payment for INV-${String(selectedBill?.id).padStart(5, '0')}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-800">{selectedBill?.patient_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Billed:</span>
              <span className="font-bold text-slate-800">${Number(selectedBill?.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Outstanding Balance:</span>
              <span className="font-bold text-rose-600">${Number(selectedBill?.balance_amount).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Amount ($) *
            </label>
            <input
              type="number"
              min="1"
              max={selectedBill?.balance_amount}
              step="0.01"
              required
              value={payFormData.amount}
              onChange={(e) => setPayFormData({ ...payFormData, amount: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Payment cannot exceed outstanding balance (${selectedBill?.balance_amount}).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method *</label>
            <select
              value={payFormData.payment_method}
              onChange={(e) => setPayFormData({ ...payFormData, payment_method: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="UPI">UPI / Digital Payment</option>
              <option value="Card">Debit / Credit Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Reference</label>
            <input
              type="text"
              value={payFormData.transaction_reference}
              onChange={(e) => setPayFormData({ ...payFormData, transaction_reference: e.target.value })}
              placeholder="e.g. TXN-123456 or Receipt No."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Hospital Tax Invoice"
        maxWidth="max-w-2xl"
      >
        {selectedBill && (
          <div className="space-y-6">
            <div id="printable-invoice" className="p-6 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-800 font-sans printable-card">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-sky-600 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white">
                    <Cross className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">
                      Medi<span className="text-sky-600">Care</span> Super Speciality Hospital
                    </h1>
                    <p className="text-xs text-slate-500">GSTIN: 07AAAAA0000A1Z5 • Medical Billing Division</p>
                    <p className="text-[11px] text-slate-400">Central Avenue • +91 (011) 2345-6789</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-800">
                    INV-{String(selectedBill.id).padStart(5, '0')}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Date: {selectedBill.generated_at ? new Date(selectedBill.generated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Billed To</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedBill.patient_name}</p>
                  <p className="font-mono text-slate-600 font-semibold">Patient Code: {selectedBill.patient_code}</p>
                  <p className="text-slate-500">Contact: {selectedBill.patient_phone || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Payment Status</p>
                  <div className="mt-1">
                    <Badge status={selectedBill.payment_status} />
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="py-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Service Description</th>
                      <th className="py-2.5 px-3 text-right">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Physician Consultation Charges</td>
                      <td className="py-2.5 px-3 text-right font-mono">${Number(selectedBill.consultation_charge).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Inpatient Ward & Bed Charges</td>
                      <td className="py-2.5 px-3 text-right font-mono">${Number(selectedBill.room_charge).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Pharmacy & Medication Supplies</td>
                      <td className="py-2.5 px-3 text-right font-mono">${Number(selectedBill.medicine_charge).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Clinical Laboratory Diagnostics & Tests</td>
                      <td className="py-2.5 px-3 text-right font-mono">${Number(selectedBill.test_charge).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-medium">Nursing & Administrative Care</td>
                      <td className="py-2.5 px-3 text-right font-mono">${Number(selectedBill.other_charge).toFixed(2)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t-2 border-slate-800 text-xs">
                    <tr>
                      <th className="py-2.5 px-3 font-bold text-slate-900">Total Billed Amount</th>
                      <th className="py-2.5 px-3 text-right font-extrabold text-slate-900 text-sm font-mono">
                        ${Number(selectedBill.total_amount).toFixed(2)}
                      </th>
                    </tr>
                    <tr>
                      <th className="py-1 px-3 text-emerald-700 font-semibold">Total Paid to Date</th>
                      <th className="py-1 px-3 text-right text-emerald-700 font-mono">
                        -${Number(selectedBill.paid_amount).toFixed(2)}
                      </th>
                    </tr>
                    <tr className="border-t border-slate-200">
                      <th className="py-2 px-3 font-bold text-rose-700">Remaining Balance Due</th>
                      <th className="py-2 px-3 text-right font-extrabold text-rose-700 text-sm font-mono">
                        ${Number(selectedBill.balance_amount).toFixed(2)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Receipts History */}
              {selectedBill.payments?.length > 0 && (
                <div className="py-3 border-t border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Payment Transactions History</p>
                  <div className="space-y-1">
                    {selectedBill.payments.map((p) => (
                      <div key={p.id} className="flex justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <span>{new Date(p.payment_date).toLocaleDateString()} • {p.payment_method} ({p.transaction_reference})</span>
                        <strong className="text-emerald-700">+${Number(p.amount).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-400">
                <p>Thank you for choosing MediCare Hospital.</p>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 pb-6 mb-1"></div>
                  <p className="text-[10px] text-slate-600 font-semibold">Authorized Accounts Signatory</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 no-print">
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
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

export default BillingPage;
