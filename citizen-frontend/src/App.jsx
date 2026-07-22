import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import keycloak from './keycloak.js';

// Public pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Authenticated pages
import Dashboard from './pages/Dashboard.jsx';
import ComplaintList from './pages/ComplaintList.jsx';
import ComplaintForm from './pages/ComplaintForm.jsx';
import ComplaintTimeline from './pages/ComplaintTimeline.jsx';
import ServiceApplicationForm from './pages/ServiceApplicationForm.jsx';
import ServiceTracker from './pages/ServiceTracker.jsx';
import OfficerDashboard from './pages/OfficerDashboard.jsx';
import OfficerApplicationView from './pages/OfficerApplicationView.jsx';
import CitizenRegister from './pages/CitizenRegister.jsx';
import MyCertificates from './pages/MyCertificates.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminOfficers from './pages/AdminOfficers.jsx';
import AdminDepartments from './pages/AdminDepartments.jsx';
import AdminCertificates from './pages/AdminCertificates.jsx';
import AdminPermits from './pages/AdminPermits.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';

// Guard: redirects to /login if not authenticated
function Protected({ children }) {
  if (!keycloak.authenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Redirect authenticated users away from public pages
function PublicOnly({ children }) {
  if (keycloak.authenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App({ authenticated }) {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <PublicOnly><LoginPage /></PublicOnly>
        } />
        <Route path="/register" element={
          <PublicOnly><RegisterPage /></PublicOnly>
        } />

        {/* ===== AUTHENTICATED ROUTES ===== */}
        <Route path="/dashboard" element={
          <Protected><Dashboard /></Protected>
        } />

        {/* Notifications */}
        <Route path="/notifications" element={
          <Protected><NotificationsPage /></Protected>
        } />

        {/* Complaint routes */}
        <Route path="/complaints" element={
          <Protected><ComplaintList /></Protected>
        } />
        <Route path="/complaints/new" element={
          <Protected><ComplaintForm /></Protected>
        } />
        <Route path="/complaints/:id" element={
          <Protected><ComplaintTimeline /></Protected>
        } />

        {/* Profile (complete citizen profile after first login) */}
        <Route path="/profile" element={
          <Protected><CitizenRegister /></Protected>
        } />

        {/* Service routes */}
        <Route path="/services/apply" element={
          <Protected><ServiceApplicationForm /></Protected>
        } />
        <Route path="/services/tracker" element={
          <Protected><ServiceTracker /></Protected>
        } />
        <Route path="/services/my-certificates" element={
          <Protected><MyCertificates /></Protected>
        } />
        <Route path="/services/officer/dashboard" element={
          <Protected><OfficerDashboard /></Protected>
        } />
        <Route path="/services/officer/verify/:id" element={
          <Protected><OfficerApplicationView /></Protected>
        } />

        {/* Officer route (also accessible via dashboard) */}
        <Route path="/officer" element={
          <Protected><OfficerDashboard /></Protected>
        } />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={
          <Protected><AdminDashboard /></Protected>
        } />
        <Route path="/admin/certificates" element={
          <Protected><AdminCertificates /></Protected>
        } />
        <Route path="/admin/permits" element={
          <Protected><AdminPermits /></Protected>
        } />
        <Route path="/admin/assign" element={
          <Protected><ComplaintList /></Protected>
        } />
        <Route path="/admin/officers" element={
          <Protected><AdminOfficers /></Protected>
        } />
        <Route path="/admin/departments" element={
          <Protected><AdminDepartments /></Protected>
        } />

        {/* Fallback: root redirects based on auth */}
        <Route path="*" element={
          keycloak.authenticated
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/" replace />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
