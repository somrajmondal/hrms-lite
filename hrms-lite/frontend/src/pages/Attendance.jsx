import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Plus, Filter, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { getAllAttendance, getEmployees, markAttendance } from '../services/api';

const DEPT_COLORS = ['dept-0','dept-1','dept-2','dept-3','dept-4','dept-5'];
function deptClass(dept) {
  if (!dept) return 'dept-0';
  let h = 0;
  for (let c of dept) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return DEPT_COLORS[Math.abs(h) % DEPT_COLORS.length];
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    employee_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Present',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadAttendance = () => {
    getAllAttendance(dateFilter || null)
      .then(setAttendance)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAttendance();
  }, [dateFilter]);

  const validate = () => {
    const errors = {};
    if (!form.employee_id) errors.employee_id = 'Please select an employee';
    if (!form.date) errors.date = 'Date is required';
    if (!form.status) errors.status = 'Status is required';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      await markAttendance({ ...form, employee_id: parseInt(form.employee_id) });
      toast.success('Attendance marked successfully');
      setShowModal(false);
      setForm({ employee_id: '', date: format(new Date(), 'yyyy-MM-dd'), status: 'Present' });
      setFormErrors({});
      loadAttendance();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Present vs absent count
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;

  return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track and manage daily attendance records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Mark Attendance
        </button>
      </header>

      <div className="page-body">
        {error && (
          <div className="error-banner"><AlertCircle size={16} /> {error}</div>
        )}

        {/* Summary */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon gold"><CalendarCheck /></div>
            <div className="stat-info">
              <div className="stat-value">{attendance.length}</div>
              <div className="stat-label">Total Records</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald"><CalendarCheck /></div>
            <div className="stat-info">
              <div className="stat-value">{presentCount}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rose"><CalendarCheck /></div>
            <div className="stat-info">
              <div className="stat-value">{absentCount}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div className="flex-center gap-2" style={{ flex: 1 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Filter by date:</span>
          </div>
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto', flex: 'none' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button className="btn btn-ghost btn-sm" onClick={() => setDateFilter('')}>
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Records Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              {dateFilter
                ? `Records for ${format(parseISO(dateFilter + 'T00:00:00'), 'MMMM d, yyyy')}`
                : 'All Attendance Records'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{attendance.length} records</span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <span className="loading-text">Loading records…</span>
            </div>
          ) : attendance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><CalendarCheck /></div>
              <div className="empty-title">No records found</div>
              <div className="empty-desc">
                {dateFilter ? 'No attendance for this date' : 'Start marking attendance for your employees'}
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Dept</th>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((rec) => (
                    <tr key={rec.id}>
                      <td>
                        <div>
                          <Link
                            to={`/employees/${rec.employee_id}`}
                            className="td-primary"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {rec.employee_name}
                          </Link>
                          <div className="text-muted text-xs">{rec.employee_code}</div>
                        </div>
                      </td>
                      <td><span className={`badge ${deptClass(rec.department)}`}>{rec.department}</span></td>
                      <td className="text-secondary">{format(parseISO(rec.date + 'T00:00:00'), 'MMM d, yyyy')}</td>
                      <td className="text-muted text-sm">{format(parseISO(rec.date + 'T00:00:00'), 'EEE')}</td>
                      <td><span className={`badge badge-${rec.status.toLowerCase()}`}>{rec.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">Mark Attendance</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowModal(false); setFormErrors({}); }}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Employee *</label>
                  <select
                    className="form-control"
                    value={form.employee_id}
                    onChange={(e) => { setForm({...form, employee_id: e.target.value}); setFormErrors({...formErrors, employee_id: ''}); }}
                  >
                    <option value="">Select employee…</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.employee_id})</option>
                    ))}
                  </select>
                  {formErrors.employee_id && <span className="form-error">{formErrors.employee_id}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.date}
                    onChange={(e) => { setForm({...form, date: e.target.value}); setFormErrors({...formErrors, date: ''}); }}
                  />
                  {formErrors.date && <span className="form-error">{formErrors.date}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-control"
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                * If a record already exists for this employee on this date, it will be updated.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowModal(false); setFormErrors({}); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving…' : 'Mark Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
