import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';

function OfficerDashboard() {
  const [activeTab, setActiveTab] = useState('certificates'); // 'complaints' or 'certificates'
  
  // Certificate State
  const [certStats, setCertStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [certFilter, setCertFilter] = useState('all');
  
  // Complaint State
  const [complaints, setComplaints] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState('all');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, recentRes, complaintsRes] = await Promise.allSettled([
        api.get('/service-management-service/api/services/officer/stats'),
        api.get('/service-management-service/api/services/officer/recent'),
        api.get('/grievance-service/api/complaints/officer?size=50')
      ]);
      
      if (statsRes.status === 'fulfilled') setCertStats(statsRes.value.data);
      if (recentRes.status === 'fulfilled') setRecentApps(recentRes.value.data);
      
      if (complaintsRes.status === 'fulfilled') {
        // grievance-service returns a paginated response
        setComplaints(complaintsRes.value.data.content || []);
      }
      
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter Logic
  const filteredApps = recentApps.filter(app => {
    if (certFilter === 'pending') return ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status);
    if (certFilter === 'approved') return ['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(app.status);
    if (certFilter === 'rejected') return app.status === 'REJECTED';
    return true;
  });

  const filteredComplaints = complaints.filter(c => {
    if (complaintFilter === 'open') return ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status);
    if (complaintFilter === 'resolved') return ['PENDING', 'RESOLVED'].includes(c.status);
    if (complaintFilter === 'closed') return c.status === 'CLOSED';
    return true;
  });

  const pendingCount = (certStats?.pending || 0) + (certStats?.underVerification || 0);
  const openComplaintsCount = complaints.filter(c => ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;

  return (
    <AppShell title="Officer Dashboard">
      <div className="welcome-banner">
        <div>
          <div className="welcome-label">Department Workspace</div>
          <h2>Officer Dashboard</h2>
          <p>Manage complaints and certificate applications for your department.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>⚠️</span> {error}
        </div>
      )}

      {isLoading ? (
        <PageLoader message="Loading dashboard..." />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card" style={{ '--stat-color': 'var(--warning)' }}>
              <div className="stat-icon">📢</div>
              <div className="stat-value">{openComplaintsCount}</div>
              <div className="stat-label">Open Complaints</div>
            </div>
            <div className="stat-card" style={{ '--stat-color': 'var(--accent)' }}>
              <div className="stat-icon">⏳</div>
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Pending Certificates</div>
            </div>
            <div className="stat-card" style={{ '--stat-color': 'var(--primary)' }}>
              <div className="stat-icon">📋</div>
              <div className="stat-value">{complaints.length}</div>
              <div className="stat-label">Total Complaints</div>
            </div>
            <div className="stat-card" style={{ '--stat-color': 'var(--success)' }}>
              <div className="stat-icon">✅</div>
              <div className="stat-value">{certStats?.approved || 0}</div>
              <div className="stat-label">Approved Certificates</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-light)' }}>
              <button 
                className={`filter-chip ${activeTab === 'complaints' ? 'active' : ''}`}
                onClick={() => setActiveTab('complaints')}
                style={{ fontSize: '16px', fontWeight: 'bold' }}
              >
                Complaint Management
              </button>
              <button 
                className={`filter-chip ${activeTab === 'certificates' ? 'active' : ''}`}
                onClick={() => setActiveTab('certificates')}
                style={{ fontSize: '16px', fontWeight: 'bold' }}
              >
                Certificate Management
              </button>
            </div>

            <div className="card-body">
              {activeTab === 'complaints' && (
                <>
                  <div className="filter-bar">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'open', label: 'Open' },
                      { key: 'resolved', label: 'Resolved' },
                      { key: 'closed', label: 'Closed' },
                    ].map(f => (
                      <button
                        key={f.key}
                        type="button"
                        className={`filter-chip${complaintFilter === f.key ? ' active' : ''}`}
                        onClick={() => setComplaintFilter(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="table-wrapper">
                    {filteredComplaints.length === 0 ? (
                      <EmptyState
                        icon="🎉"
                        title="No Complaints Found"
                        message={complaintFilter === 'all' ? 'No complaints assigned to your department.' : `No ${complaintFilter} complaints.`}
                      />
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Complaint ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredComplaints.map(c => (
                            <tr key={c.complaintId}>
                              <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{c.complaintId.split('-')[0]}</td>
                              <td style={{ fontWeight: '500' }}>{c.title}</td>
                              <td>{c.category || 'N/A'}</td>
                              <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                {new Date(c.createdAt).toLocaleDateString('en-IN')}
                              </td>
                              <td>
                                <span className={`badge badge-${
                                  ['NEW', 'ASSIGNED'].includes(c.status) ? 'yellow' :
                                  c.status === 'IN_PROGRESS' ? 'blue' :
                                  c.status === 'CLOSED' ? 'gray' : 'green'
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => navigate(`/complaints/${c.complaintId}`)}
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'certificates' && (
                <>
                  <div className="filter-bar">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'pending', label: 'Pending' },
                      { key: 'approved', label: 'Approved' },
                      { key: 'rejected', label: 'Rejected' },
                    ].map(f => (
                      <button
                        key={f.key}
                        type="button"
                        className={`filter-chip${certFilter === f.key ? ' active' : ''}`}
                        onClick={() => setCertFilter(f.key)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="table-wrapper">
                    {filteredApps.length === 0 ? (
                      <EmptyState
                        icon="📭"
                        title="No Applications Found"
                        message={certFilter === 'all' ? 'No certificates mapped to your department.' : `No ${certFilter} applications.`}
                      />
                    ) : (
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
                          {filteredApps.map(app => (
                            <tr key={app.applicationId}>
                              <td style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '12px' }}>{app.applicationNumber}</td>
                              <td>{app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td>
                              <td style={{ fontWeight: '500' }}>{app.applicantName}</td>
                              <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                              </td>
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
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => navigate(`/services/officer/verify/${app.applicationId}`)}
                                >
                                  {['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status) ? 'Verify / Approve' : 'View Details'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

export default OfficerDashboard;
