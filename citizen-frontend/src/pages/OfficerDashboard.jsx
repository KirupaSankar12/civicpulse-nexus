import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SectionCard } from '../components/SectionCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { AlertCircle, FileText, Search, List, Inbox } from 'lucide-react';

function certStatusVariant(status) {
  if (['SUBMITTED', 'RESUBMITTED'].includes(status)) return 'warning';
  if (status === 'UNDER_VERIFICATION') return 'info';
  if (['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(status)) return 'success';
  return 'danger';
}

function compStatusVariant(status) {
  if (['NEW', 'ASSIGNED'].includes(status)) return 'warning';
  if (status === 'IN_PROGRESS') return 'info';
  if (status === 'CLOSED') return 'neutral';
  return 'success';
}

function priorityVariant(p) {
  if (p === 'HIGH') return 'danger';
  if (p === 'MEDIUM') return 'warning';
  return 'neutral';
}

function slaVariant(s) {
  if (s === 'OVERDUE') return 'danger';
  if (s === 'NEAR_DEADLINE') return 'warning';
  return 'success';
}

function OfficerDashboard() {
  
  // Certificate State
  const [certStats, setCertStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [certFilter, setCertFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [complaints, setComplaints] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState('All');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const showComplaints = !location.pathname.includes('/services');
  const showCertificates = location.pathname.includes('/services');

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
    // Status Filter
    let statusMatch = true;
    if (certFilter !== 'All') {
      if (certFilter === 'Submitted') statusMatch = app.status === 'SUBMITTED' || app.status === 'RESUBMITTED';
      else if (certFilter === 'Under Verification') statusMatch = app.status === 'UNDER_VERIFICATION';
      else if (certFilter === 'Action Required') statusMatch = app.status === 'ADDITIONAL_INFO_REQUESTED';
      else if (certFilter === 'Approved') statusMatch = app.status === 'APPROVED';
      else if (certFilter === 'Rejected') statusMatch = app.status === 'REJECTED';
      else if (certFilter === 'Certificate Generated') statusMatch = app.status === 'CERTIFICATE_GENERATED';
      else if (certFilter === 'Downloaded') statusMatch = app.status === 'DOWNLOADED';
    }
    
    // Search Filter
    let searchMatch = true;
    if (searchTerm.trim() !== '') {
      const lowerTerm = searchTerm.toLowerCase();
      const serviceTypeStr = app.serviceType?.replace(/_/g, ' ')?.toLowerCase() || '';
      searchMatch = 
        (app.applicationNumber && app.applicationNumber.toLowerCase().includes(lowerTerm)) ||
        (app.applicantName && app.applicantName.toLowerCase().includes(lowerTerm)) ||
        serviceTypeStr.includes(lowerTerm);
    }
    
    return statusMatch && searchMatch;
  });

  const filteredComplaints = complaints.filter(c => {
    if (complaintFilter === 'All') return true;
    if (complaintFilter === 'Submitted') return c.status === 'NEW' || c.status === 'ASSIGNED';
    if (complaintFilter === 'In Progress') return c.status === 'IN_PROGRESS';
    if (complaintFilter === 'Resolved') return c.status === 'RESOLVED' || c.status === 'CLOSED';
    if (complaintFilter === 'Rejected') return c.status === 'REJECTED';
    return true;
  });

  return (
    <AppShell title="Officer Dashboard">
      <div className="welcome-banner">
        <div>
          <div className="welcome-label">Department Workspace</div>
          <h2>Officer Dashboard</h2>
          <p>Review and verify items assigned to your department.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {isLoading ? (
        <PageLoader message="Loading dashboard..." />
      ) : (
        <>
          {showComplaints && (
            <SectionCard className="mb-4" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <List size={20} color="var(--color-text-primary)" />
              <h3 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: '600' }}>My Assigned Complaints</h3>
            </div>

            <div style={{ padding: '20px' }}>
                  <div className="filter-bar">
                    {[
                      'All', 'Submitted', 'In Progress', 'Resolved', 'Rejected'
                    ].map(f => (
                      <button
                        key={f}
                        type="button"
                        className={`filter-chip${complaintFilter === f ? ' active' : ''}`}
                        onClick={() => setComplaintFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    {filteredComplaints.length === 0 ? (
                      <EmptyState
                        icon="inbox"
                        title="No Complaints Found"
                        message={complaintFilter === 'All' ? 'No complaints assigned to your department.' : `No ${complaintFilter} complaints.`}
                      />
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Department</th>
                            <th>Priority</th>
                            <th>SLA</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredComplaints.map((c, index) => (
                            <tr key={c.complaintId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>{index + 1}</td>
                              <td style={{ fontWeight: '500' }}>{c.title}</td>
                              <td>{c.department || 'N/A'}</td>
                              <td>
                                <Badge variant={priorityVariant(c.priority)} label={c.priority || 'NORMAL'} />
                              </td>
                              <td>
                                <Badge variant={slaVariant(c.slaStatus)} label={c.slaStatus || 'ON_TIME'} />
                              </td>
                              <td>
                                <Badge variant={compStatusVariant(c.status)} label={c.status} />
                              </td>
                              <td>
                                {['NEW', 'ASSIGNED'].includes(c.status) ? (
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ marginRight: '8px' }}
                                    onClick={() => navigate(`/complaints/${c.complaintId}`)}
                                  >
                                    Start Work
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => navigate(`/complaints/${c.complaintId}`)}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
            </div>
          </SectionCard>
          )}

          {showCertificates && (
          <SectionCard style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--color-text-primary)" />
                <h3 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: '600' }}>Assigned Certificates</h3>
              </div>
              <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', fontSize: '14px', backgroundColor: 'var(--color-white)', color: 'var(--color-text-primary)' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              </div>
            </div>

            <div style={{ padding: '20px' }}>
                  <div className="filter-bar">
                    {[
                      'All', 'Submitted', 'Under Verification', 'Action Required', 'Approved', 'Rejected', 'Certificate Generated', 'Downloaded'
                    ].map(f => (
                      <button
                        key={f}
                        type="button"
                        className={`filter-chip${certFilter === f ? ' active' : ''}`}
                        onClick={() => setCertFilter(f)}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    {filteredApps.length === 0 ? (
                      <EmptyState
                        icon="file-text"
                        title="No Certificate Applications"
                        message="There are currently no certificate applications assigned to your department."
                      />
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Application Number</th>
                            <th>Certificate Type</th>
                            <th>Applicant Name</th>
                            <th>Applied Date</th>
                            <th>Current Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApps.map(app => (
                            <tr key={app.applicationId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{app.applicationNumber}</td>
                              <td>{app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td>
                              <td style={{ fontWeight: '500' }}>{app.applicantName}</td>
                              <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                                {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                              </td>
                              <td>
                                <Badge variant={certStatusVariant(app.status)} label={app.status} />
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
            </div>
          </SectionCard>
          )}
        </>
      )}
    </AppShell>
  );
}

export default OfficerDashboard;
