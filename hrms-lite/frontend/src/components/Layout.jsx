import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Building2,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
];

const deptColors = ['#d4a853','#818cf8','#4ade80','#fb923c','#f87171','#22d3ee'];
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffffffff, 0);

export default function Layout() {
  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <a className="logo-mark" href="/dashboard">
            <div className="logo-icon">H</div>
            <div className="logo-text">
              <span className="logo-title">HRMS Lite</span>
              <span className="logo-sub">Management System</span>
            </div>
          </a>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Main</span>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">© 2025 HRMS Lite v1.0</p>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
