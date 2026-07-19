import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';

function OfficerDashboard() {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get('/service-management-service/api/services/officer/stats'),
          api.get('/service-management-service/api/services/officer/recent')
        ]);
        setStats(statsRes.data);
        setRecentApps(recentRes.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data. Ensure backend is running.');
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <AppShell title="Officer Dashboard">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)' }}>📊 Officer Dashboard</h1>
        <p className="text-muted">Manage applications, verify documents, and issue certificates for your department.</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <div className="spinner-sm" style={{ width: '32px', height: '32px', margin: '0 auto', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #eee', borderBottom: '4px solid #f59e0b' }}>
              <h3 style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Pending Action</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827' }}>{stats?.pending + stats?.underVerification || 0}</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #eee', borderBottom: '4px solid #10b981' }}>
              <h3 style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Approved</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827' }}>{stats?.approved || 0}</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #eee', borderBottom: '4px solid #ef4444' }}>
              <h3 style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Rejected</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827' }}>{stats?.rejected || 0}</div>
            </div>
          </div>

          {/* Recent Applications Table */}
          <div className="card">
            <div className="card-header" style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text)' }}>Recent Applications</h2>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Application No</th>
                    <th>Service Type</th>
                    <th>Applicant Name</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                        No applications found in your department.
                      </td>
                    </tr>
                  ) : (
                    recentApps.map(app => (
                      <tr key={app.applicationId}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{app.applicationNumber}</td>
                        <td>{app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td>
                        <td>{app.applicantName}</td>
                        <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${
                            ['SUBMITTED', 'RESUBMITTED'].includes(app.status) ? 'yellow' :
                            app.status === 'UNDER_VERIFICATION' ? 'blue' :
                            ['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(app.status) ? 'green' : 'red'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => navigate(`/services/officer/verify/${app.applicationId}`)}
                            style={{ padding: '0.4rem 0.8rem' }}
                          >
                            {['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status) ? 'Verify / Approve' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

export default OfficerDashboard;
