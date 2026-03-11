import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Search, Users, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployees, createEmployee, deleteEmployee } from '../services/api';

const DEPT_COLORS = ['dept-0','dept-1','dept-2','dept-3','dept-4','dept-5'];
function deptClass(dept) {
  if (!dept) return 'dept-0';
  let h = 0;
  for (let c of dept) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return DEPT_COLORS[Math.abs(h) % DEPT_COLORS.length];
}

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing',
  'Sales', 'Finance', 'HR', 'Operations', 'Legal', 'Support'
];

const EMPTY_FORM = { employee_id: '', full_name: '', email: '', department: '' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    getEmployees()
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  const validateForm = () => {
    const errors = {};
    if (!form.employee_id.trim()) errors.employee_id = 'Required';
    if (!form.full_name.trim()) errors.full_name = 'Required';
    if (!form.email.trim()) errors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email';
    if (!form.department.trim()) errors.department = 'Required';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setSubmitting(true);
    try {
      await createEmployee(form);
      toast.success('Employee added successfully');
      setShowModal(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (emp) => {
    try {
      await deleteEmployee(emp.id);
      toast.success(`${emp.full_name} removed`);
      setDeleteConfirm(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} total employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </header>

      <div className="page-body">
        {error && (
          <div className="error-banner">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={16} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)'
          }} />
          <input
            className="form-control"
            style={{ paddingLeft: 38 }}
            placeholder="Search by name, ID, department, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <span className="loading-text">Loading employees…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Users /></div>
              <div className="empty-title">{search ? 'No results found' : 'No employees yet'}</div>
              <div className="empty-desc">
                {search
                  ? 'Try a different search term'
                  : 'Click "Add Employee" to add your first employee'}
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Attendance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div className="flex-center gap-2">
                          <div className={`avatar ${deptClass(emp.department)}`}>
                            {emp.full_name.split(' ').map(n => n[0]).slice(0,2).join('')}
                          </div>
                          <div>
                            <div className="td-primary">{emp.full_name}</div>
                            <div className="text-muted text-xs">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: 12, background: 'var(--bg-raised)', padding: '2px 8px', borderRadius: 4 }}>
                          {emp.employee_id}
                        </code>
                      </td>
                      <td><span className={`badge ${deptClass(emp.department)}`}>{emp.department}</span></td>
                      <td>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{emp.present_days}</span>
                        <span className="text-muted"> / {emp.total_days} days</span>
                      </td>
                      <td>
                        <div className="flex-center gap-2">
                          <Link to={`/employees/${emp.id}`} className="btn btn-secondary btn-sm">
                            View
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteConfirm(emp)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Employee</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => { setShowModal(false); setFormErrors({}); setForm(EMPTY_FORM); }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Employee ID *</label>
                    <input
                      className="form-control"
                      placeholder="e.g. EMP001"
                      value={form.employee_id}
                      onChange={(e) => { setForm({...form, employee_id: e.target.value}); setFormErrors({...formErrors, employee_id: ''}); }}
                    />
                    {formErrors.employee_id && <span className="form-error">{formErrors.employee_id}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      className="form-control"
                      placeholder="John Doe"
                      value={form.full_name}
                      onChange={(e) => { setForm({...form, full_name: e.target.value}); setFormErrors({...formErrors, full_name: ''}); }}
                    />
                    {formErrors.full_name && <span className="form-error">{formErrors.full_name}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={(e) => { setForm({...form, email: e.target.value}); setFormErrors({...formErrors, email: ''}); }}
                  />
                  {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-control"
                    value={form.department}
                    onChange={(e) => { setForm({...form, department: e.target.value}); setFormErrors({...formErrors, department: ''}); }}
                  >
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {formErrors.department && <span className="form-error">{formErrors.department}</span>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setShowModal(false); setFormErrors({}); setForm(EMPTY_FORM); }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Adding…' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.full_name}</strong>?
                This will also delete all their attendance records.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
