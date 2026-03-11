import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserCheck, UserX, CalendarClock, Building2, ArrowRight } from 'lucide-react';
import { getDashboard, getEmployees, getAllAttendance } from '../services/api';
import { format } from 'date-fns';

const DEPT_COLORS = ['dept-0','dept-1','dept-2','dept-3','dept-4','dept-5'];
function deptClass(dept) {
  let h = 0;
  for (let c of dept) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return DEPT_COLORS[Math.abs(h) % DEPT_COLORS.length];
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboard(), getEmployees(), getAllAttendance()])
      .then(([dashboard, employees, attendance]) => {
        setStats(dashboard);
        setRecentEmployees(employees.slice(-5).reverse());
        setRecentAttendance(attendance.slice(0, 8));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your organization</p>
        </div>
      </header>
      <div className="page-body">
        <div className="loading-container">
          <div className="spinner" />
          <span className="loading-text">Loading dashboard…</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <header className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} · Organization overview
          </p>
        </div>
        <Link to="/employees" className="btn btn-primary">
          <Users size={16} /> Manage Employees
        </Link>
      </header>

      <div className="page-body">
        {error && (
          <div className="error-banner">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon gold"><Users /></div>
            <div className="stat-info">
              <div className="stat-value">{stats?.total_employees ?? 0}</div>
              <div className="stat-label">Total Employees</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon emerald"><UserCheck /></div>
            <div className="stat-info">
              <div className="stat-value">{stats?.today_present ?? 0}</div>
              <div className="stat-label">Present Today</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rose"><UserX /></div>
            <div className="stat-info">
              <div className="stat-value">{stats?.today_absent ?? 0}</div>
              <div className="stat-label">Absent Today</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><CalendarClock /></div>
            <div className="stat-info">
              <div className="stat-value">{stats?.today_unmarked ?? 0}</div>
              <div className="stat-label">Not Marked</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Departments */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Departments</span>
              <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="card-body">
              {stats && Object.keys(stats.departments).length === 0 ? (
                <p className="text-secondary text-sm">No departments yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stats && Object.entries(stats.departments).map(([dept, count]) => (
                    <div key={dept} className="flex-between">
                      <div className="flex-center gap-2">
                        <span className={`badge ${deptClass(dept)}`}>{dept}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {count} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>emp</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Attendance</span>
              <Link to="/attendance" className="btn btn-ghost btn-sm">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ overflow: 'hidden' }}>
              {recentAttendance.length === 0 ? (
                <div className="card-body">
                  <p className="text-secondary text-sm">No attendance records yet</p>
                </div>
              ) : (
                <table>
                  <tbody>
                    {recentAttendance.map((rec) => (
                      <tr key={rec.id}>
                        <td>
                          <div className="td-primary" style={{ fontSize: 13 }}>{rec.employee_name}</div>
                          <div className="text-muted text-xs">{format(new Date(rec.date + 'T00:00:00'), 'MMM d')}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${rec.status.toLowerCase()}`}>{rec.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Recent Employees */}
        <div className="card mt-4">
          <div className="card-header">
            <span className="card-title">Recent Employees</span>
            <Link to="/employees" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentEmployees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Users /></div>
              <div className="empty-title">No employees yet</div>
              <div className="empty-desc">Start by adding your first employee</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID</th>
                    <th>Department</th>
                    <th>Present Days</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentEmployees.map((emp) => (
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
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{emp.employee_id}</td>
                      <td><span className={`badge ${deptClass(emp.department)}`}>{emp.department}</span></td>
                      <td>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{emp.present_days}</span>
                        <span className="text-muted text-xs"> / {emp.total_days}</span>
                      </td>
                      <td>
                        <Link to={`/employees/${emp.id}`} className="btn btn-ghost btn-sm">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
