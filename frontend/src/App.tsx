import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthForm from './components/AuthForm';
import Profile from './components/Profile';
import CVManager from './components/CVManager';
import JobManager from './components/JobManager';
import EmployerDashboard from './components/EmployerDashboard';
import CandidateDashboard from './components/CandidateDashboard';
import AppliedCompanies from './components/AppliedCompanies';
import AdminDashboard from './components/AdminDashboard';
import AppliedCandidates from './components/AppliedCandidates';

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Hàm chuyển trang bằng React Router
  const navigateBack = () => window.history.back();
  const handleManageCV = () => window.location.href = '/cv';

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/*" element={<AuthForm onAuth={setUser} />} />
        </Routes>
        <Footer />
      </Router>
    );
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={
          user.role === 'admin' ? <AdminDashboard user={user} /> :
          user.role === 'employer' ? <EmployerDashboard user={user} /> :
          <CandidateDashboard user={user} onManageCV={handleManageCV} />
        } />
        <Route path="/profile" element={
          <Profile user={user} onLogout={handleLogout} onUpdateUser={setUser} />
        } />
        <Route path="/cv" element={
          user.role === 'candidate' ? <CVManager user={user} onBack={navigateBack} /> : <Navigate to="/" />
        } />
        <Route path="/applied-companies" element={
          user.role === 'candidate' ? <AppliedCompanies /> : <Navigate to="/" />
        } />
        <Route path="/jobs" element={
          user.role === 'employer' ? <JobManager user={user} onBack={navigateBack} /> : <Navigate to="/" />
        } />
        <Route path="/applied-candidates" element={
          user.role === 'employer' ? <AppliedCandidates /> : <Navigate to="/" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
}