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
import OfficerApprovals from './pages/OfficerApprovals.jsx';
import CitizenRegister from './pages/CitizenRegister.jsx';

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
        <Route path="/services/approvals" element={
          <Protected><OfficerApprovals /></Protected>
        } />

        {/* Officer route (also accessible via dashboard) */}
        <Route path="/officer" element={
          <Protected><Dashboard /></Protected>
        } />

        {/* Admin routes */}
        <Route path="/admin/assign" element={
          <Protected><ComplaintList /></Protected>
        } />
        <Route path="/admin/officers" element={
          <Protected><ManageOfficersPage /></Protected>
        } />
        <Route path="/admin/departments" element={
          <Protected><ManageDepartmentsPage /></Protected>
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

/* ==================== MANAGE OFFICERS PAGE ==================== */
import AppShell from './components/AppShell.jsx';

function ManageOfficersPage() {
  const officers = [
    { name: 'Jane Officer', dept: 'Water Supply', email: 'jane_officer@civicpulse.gov', phone: '9876500001', status: 'Active' },
    { name: 'Raj Sharma', dept: 'Roads & Traffic', email: 'raj_officer@civicpulse.gov', phone: '9876500002', status: 'Active' },
    { name: 'Priya Singh', dept: 'Electricity', email: 'priya_officer@civicpulse.gov', phone: '9876500003', status: 'Active' },
    { name: 'Amit Kumar', dept: 'Sanitation', email: 'amit_officer@civicpulse.gov', phone: '9876500004', status: 'Inactive' },
  ];

  return (
    <AppShell title="Manage Officers">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: 'var(--primary)' }}>🧑‍💼 Manage Officers</h1>
          <p className="text-muted">View, add, and manage department field officers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert('Add Officer — use Keycloak Admin Console to create officer accounts.')}>
          ➕ Add Officer
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Officer Name</th><th>Department</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {officers.map((o, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: '600' }}>{o.name}</td>
                  <td>{o.dept}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{o.email}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{o.phone}</td>
                  <td>
                    <span className={`badge ${o.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{o.status}</span>
                  </td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-outline btn-sm">Edit</button>
                    <button className="btn btn-danger btn-sm">Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

/* ==================== MANAGE DEPARTMENTS PAGE ==================== */
function ManageDepartmentsPage() {
  const departments = [
    { name: 'Water Supply', head: 'Director Suresh Mehta', officers: 3, pending: 8, resolved: 45 },
    { name: 'Roads & Traffic', head: 'Director Anita Verma', officers: 4, pending: 12, resolved: 67 },
    { name: 'Electricity', head: 'Director Rahul Gupta', officers: 2, pending: 5, resolved: 38 },
    { name: 'Sanitation', head: 'Director Kavita Nair', officers: 3, pending: 6, resolved: 52 },
  ];

  return (
    <AppShell title="Manage Departments">
      <div className="page-header">
        <h1 style={{ color: 'var(--primary)' }}>🏢 Manage Departments</h1>
        <p className="text-muted">Overview of all civic service departments and their performance.</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Department</th><th>Head of Department</th><th>Total Officers</th><th>Pending</th><th>Resolved</th><th>Resolution Rate</th></tr>
            </thead>
            <tbody>
              {departments.map((d, i) => {
                const total = d.pending + d.resolved;
                const rate = total > 0 ? Math.round((d.resolved / total) * 100) : 0;
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: '700' }}>{d.name}</td>
                    <td>{d.head}</td>
                    <td style={{ textAlign: 'center' }}>{d.officers}</td>
                    <td><span className="badge badge-yellow">{d.pending}</span></td>
                    <td><span className="badge badge-green">{d.resolved}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: rate > 80 ? 'var(--accent)' : rate > 60 ? 'var(--warning)' : 'var(--danger)', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700' }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

export default App;
