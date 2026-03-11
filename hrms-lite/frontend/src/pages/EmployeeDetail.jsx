import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, UserCheck, UserX, CalendarClock, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { getEmployee, getEmployeeAttendance, markAttendance, deleteEmployee } from '../services/api';

const DEPT_COLORS = ['dept-0','dept-1','dept-2','dept-3','dept-4','dept-5'];
function deptClass(dept) {
  if (!dept) return 'dept-0';
  let h = 0;
  for (let c of dept) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return DEPT_COLORS[Math.abs(h) % DEPT_COLORS.length];
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAttModal, setShowAttModal] = useState(false);
  const [attForm, setAttForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), status: 'Present' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([getEmployee(id), getEmployeeAttendance(id)])
      .then(([emp, att]) => { setEmployee(emp); setAttendance(att); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleMarkAttendance = async () => {
    setSubmitting(true);
    try {
      await markAttendance({ employee_id: parseInt(id), date: attForm.date, status: attForm.status });
      toast.success('Attendance recorded');
      setShowAttModal(false);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div>
      <header className="page-header">
        <Link to="/employees" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</Link>
      </header>
      <div className="page-body">
        <div className="loading-container"><div className="spinner" /><span className="loading-text">Loading…</span></div>
      </div>
    </div>
  );

  if (error) return (
    <div>
      <header className="page-header">
        <Link to="/employees" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</Link>
      </header>
      <div className="page-body">
        <div className="error-banner"><span>⚠</span> {error}</div>
      </div>
    </div>
  );

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;
  const rate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <div>
      <header className="page-header">
        <div className="flex-center gap-3">
          <Link to="/employees" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Back</Link>
          <div>
            <h1 className="page-title">{employee.full_name}</h1>
            <p className="page-subtitle">{employee.employee_id} · {employee.department}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAttModal(true)}>
          <Plus size={16} /> Mark Attendance
        </button>
      </header>

      <div className="page-body">
        {/* Profile Card */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="flex-center gap-3">
              <div className={`avatar ${deptClass(employee.department)}`} style={{ width: 54, height: 54, fontSize: 20 }}>
                {employee.full_name.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>{employee.full_name}</div>
                <div className="text-secondary text-sm">{employee.email}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span className={`badge ${deptClass(employee.department)}`}>{employee.department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-icon gold"><CalendarCheck /></div>
            <div className="stat-info">
              <div className="stat-value">{attendance.length}</div>
              <div className="stat-label">Total Days</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald"><UserCheck /></div>
            <div className="stat-info">
              <div className="stat-value">{presentCount}</div>
              <div className="stat-label">Present</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rose"><UserX /></div>
            <div className="stat-info">
              <div className="stat-value">{absentCount}</div>
              <div className="stat-label">Absent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><CalendarClock /></div>
            <div className="stat-info">
              <div className="stat-value">{rate}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Attendance History</span>
          </div>
          {attendance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><CalendarCheck /></div>
              <div className="empty-title">No attendance records</div>
              <div className="empty-desc">Mark attendance to start tracking</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((rec) => (
                    <tr key={rec.id}>
                      <td className="td-primary">{format(parseISO(rec.date + 'T00:00:00'), 'MMMM d, yyyy')}</td>
                      <td className="text-secondary">{format(parseISO(rec.date + 'T00:00:00'), 'EEEE')}</td>
                      <td><span className={`badge badge-${rec.status.toLowerCase()}`}>{rec.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showAttModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAttModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2 className="modal-title">Mark Attendance</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAttModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-raised)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--text-secondary)' }}>
                    {employee.full_name}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={attForm.date}
                    onChange={(e) => setAttForm({...attForm, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-control"
                    value={attForm.status}
                    onChange={(e) => setAttForm({...attForm, status: e.target.value})}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAttModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleMarkAttendance} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
