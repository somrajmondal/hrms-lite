import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Employees ──────────────────────────────────────────────────────────────
export const getEmployees = () => api.get('/employees').then((r) => r.data);
export const getEmployee = (id) => api.get(`/employees/${id}`).then((r) => r.data);
export const createEmployee = (data) => api.post('/employees', data).then((r) => r.data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// ── Attendance ─────────────────────────────────────────────────────────────
export const getAllAttendance = (dateFilter) =>
  api.get('/attendance', { params: dateFilter ? { date_filter: dateFilter } : {} }).then((r) => r.data);

export const getEmployeeAttendance = (empId, params = {}) =>
  api.get(`/attendance/employee/${empId}`, { params }).then((r) => r.data);

export const markAttendance = (data) => api.post('/attendance', data).then((r) => r.data);

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard').then((r) => r.data);
