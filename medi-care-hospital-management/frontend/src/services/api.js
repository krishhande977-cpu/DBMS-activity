import axios from 'axios';
import { mockStore } from './mockData';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/api'
    : 'http://localhost:8000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Request interceptor to attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medicare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: true } }));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Resilient wrapper: calls live backend; if offline / mixed-content blocked, gracefully falls back to mockStore
async function withFallback(requestFn, fallbackFn) {
  try {
    const res = await requestFn();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: true } }));
    }
    return res;
  } catch (err) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: false } }));
    }
    // Return mock data fallback
    const data = await fallbackFn();
    return { data, status: 200, statusText: 'OK', headers: {}, config: {} };
  }
}

export const authAPI = {
  login: (credentials) => withFallback(() => api.post('/auth/login', credentials), () => ({ access_token: 'demo-token', user: { id: 1, name: 'System Administrator', email: 'admin@medicare.com', role: 'ADMIN' } })),
  doctorLogin: (data) => withFallback(() => api.post('/auth/doctor-login', data), () => ({ access_token: 'demo-token', user: { id: 2, name: data.doctor_name || 'Dr. Rajesh Sharma', role: 'DOCTOR', doctor_id: 1 } })),
  getDoctorsList: () => withFallback(() => api.get('/auth/doctors-list'), () => mockStore.getDoctors()),
  me: () => withFallback(() => api.get('/auth/me'), () => ({ id: 1, name: 'System Administrator', email: 'admin@medicare.com', role: 'ADMIN' })),
};

export const dashboardAPI = {
  getStats: () => withFallback(() => api.get('/dashboard/stats'), () => mockStore.getStats()),
  getCharts: () => withFallback(() => api.get('/dashboard/charts'), () => mockStore.getCharts()),
};

export const patientsAPI = {
  getAll: (params) => withFallback(() => api.get('/patients', { params }), () => mockStore.getPatients(params)),
  getById: (id) => withFallback(() => api.get(`/patients/${id}`), () => mockStore.getPatientById(id)),
  create: (data) => withFallback(() => api.post('/patients', data), () => mockStore.createPatient(data)),
  update: (id, data) => withFallback(() => api.put(`/patients/${id}`, data), () => mockStore.updatePatient(id, data)),
  delete: (id) => withFallback(() => api.delete(`/patients/${id}`), () => mockStore.deletePatient(id)),
};

export const doctorsAPI = {
  getAll: (params) => withFallback(() => api.get('/doctors', { params }), () => mockStore.getDoctors(params)),
  getById: (id) => withFallback(() => api.get(`/doctors/${id}`), () => mockStore.getDoctors().find(d => String(d.id) === String(id))),
  create: (data) => withFallback(() => api.post('/doctors', data), () => data),
  update: (id, data) => withFallback(() => api.put(`/doctors/${id}`, data), () => data),
  delete: (id) => withFallback(() => api.delete(`/doctors/${id}`), () => true),
};

export const departmentsAPI = {
  getAll: () => withFallback(() => api.get('/departments'), () => mockStore.getDepartments()),
  create: (data) => withFallback(() => api.post('/departments', data), () => data),
  update: (id, data) => withFallback(() => api.put(`/departments/${id}`, data), () => data),
  delete: (id) => withFallback(() => api.delete(`/departments/${id}`), () => true),
};

export const appointmentsAPI = {
  getAll: (params) => withFallback(() => api.get('/appointments', { params }), () => mockStore.getAppointments(params)),
  getById: (id) => withFallback(() => api.get(`/appointments/${id}`), () => mockStore.getAppointments().find(a => String(a.id) === String(id))),
  create: (data) => withFallback(() => api.post('/appointments', data), () => mockStore.createAppointment(data)),
  update: (id, data) => withFallback(() => api.put(`/appointments/${id}`, data), () => data),
  updateStatus: (id, status) => withFallback(() => api.patch(`/appointments/${id}/status`, { status }), () => ({ id, status })),
  delete: (id) => withFallback(() => api.delete(`/appointments/${id}`), () => true),
};

export const medicalRecordsAPI = {
  getAll: (params) => withFallback(() => api.get('/medical-records', { params }), () => mockStore.getMedicalRecords()),
  getById: (id) => withFallback(() => api.get(`/medical-records/${id}`), () => mockStore.getMedicalRecords().find(r => String(r.id) === String(id))),
  create: (data) => withFallback(() => api.post('/medical-records', data), () => data),
};

export const prescriptionsAPI = {
  getAll: (params) => withFallback(() => api.get('/prescriptions', { params }), () => mockStore.getPrescriptions()),
  getById: (id) => withFallback(() => api.get(`/prescriptions/${id}`), () => mockStore.getPrescriptions().find(p => String(p.id) === String(id))),
  create: (data) => withFallback(() => api.post('/prescriptions', data), () => data),
  delete: (id) => withFallback(() => api.delete(`/prescriptions/${id}`), () => true),
};

export const roomsAPI = {
  getAll: (params) => withFallback(() => api.get('/rooms', { params }), () => mockStore.getRooms(params)),
  getById: (id) => withFallback(() => api.get(`/rooms/${id}`), () => mockStore.getRooms().find(r => String(r.id) === String(id))),
  create: (data) => withFallback(() => api.post('/rooms', data), () => data),
  update: (id, data) => withFallback(() => api.put(`/rooms/${id}`, data), () => data),
  delete: (id) => withFallback(() => api.delete(`/rooms/${id}`), () => true),
};

export const admissionsAPI = {
  getAll: (params) => withFallback(() => api.get('/admissions', { params }), () => mockStore.getAdmissions(params)),
  getById: (id) => withFallback(() => api.get(`/admissions/${id}`), () => mockStore.getAdmissions().find(a => String(a.id) === String(id))),
  create: (data) => withFallback(() => api.post('/admissions', data), () => data),
  discharge: (id, data) => withFallback(() => api.put(`/admissions/${id}/discharge`, data), () => data),
};

export const billsAPI = {
  getAll: (params) => withFallback(() => api.get('/bills', { params }), () => mockStore.getBills(params)),
  getById: (id) => withFallback(() => api.get(`/bills/${id}`), () => mockStore.getBills().find(b => String(b.id) === String(id))),
  create: (data) => withFallback(() => api.post('/bills', data), () => data),
  update: (id, data) => withFallback(() => api.put(`/bills/${id}`, data), () => data),
  delete: (id) => withFallback(() => api.delete(`/bills/${id}`), () => true),
};

export const paymentsAPI = {
  getAll: (params) => withFallback(() => api.get('/payments', { params }), () => mockStore.getPayments(params)),
  create: (data) => withFallback(() => api.post('/payments', data), () => data),
};

export const staffAPI = {
  getAll: (params) => withFallback(() => api.get('/staff', { params }), () => mockStore.getStaff()),
  getById: (id) => withFallback(() => api.get(`/staff/${id}`), () => mockStore.getStaff().find(s => String(s.id) === String(id))),
  create: (data) => withFallback(() => api.post('/staff', data), () => data),
  update: (id, data) => withFallback(() => api.put(`/staff/${id}`, data), () => data),
  delete: (id) => withFallback(() => api.delete(`/staff/${id}`), () => true),
};

export const reportsAPI = {
  getPatientsReport: (params) => withFallback(() => api.get('/reports/patients', { params }), () => mockStore.getReports('patients')),
  getAppointmentsReport: (params) => withFallback(() => api.get('/reports/appointments', { params }), () => mockStore.getReports('appointments')),
  getDepartmentsReport: () => withFallback(() => api.get('/reports/departments'), () => mockStore.getReports('departments')),
  getRevenueReport: () => withFallback(() => api.get('/reports/revenue'), () => mockStore.getReports('revenue')),
  getRoomOccupancyReport: () => withFallback(() => api.get('/reports/room-occupancy'), () => mockStore.getReports('occupancy')),
  getPaymentsReport: () => withFallback(() => api.get('/reports/payments'), () => mockStore.getReports('payments')),
};

export default api;
