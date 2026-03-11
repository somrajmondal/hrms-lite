import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AttendancePage from './pages/Attendance';
import EmployeeDetail from './pages/EmployeeDetail';
import './styles.css';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e8e3d5',
            border: '1px solid #2d2d4e',
            borderRadius: '8px',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#6ee7b7', secondary: '#1a1a2e' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#1a1a2e' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeDetail />} />
          <Route path="attendance" element={<AttendancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
