import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
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

const OFFICER_DEPT_MAP = {
  john: 'Health Department',
  mark: 'Revenue Department',
  ryan: 'Municipal Corporation',
  chris: 'Water Department',
  ethan: 'Roads Department',
  jack: 'Electricity Department',
  david: 'Sanitation Department',
  will: 'Urban Planning Department'
};

function getDepartmentDescription(dept) {
  if (!dept) return "Review and verify items assigned to your department, and keep statuses updated in real-time.";
  
  const d = dept.toLowerCase();
  if (d.includes('health')) return "Review and verify items assigned to the Health Department, manage public health cases, and keep statuses updated in real-time.";
  if (d.includes('revenue')) return "Review and verify applications assigned to the Revenue Department, process land records, and keep statuses updated in real-time.";
  if (d.includes('municipal')) return "Review and verify civic administration requests assigned to the Municipal Corporation, and keep statuses updated in real-time.";
  if (d.includes('water')) return "Review water supply complaints, verify pipeline maintenance requests assigned to the Water Department, and keep statuses updated in real-time.";
  if (d.includes('roads')) return "Manage road maintenance requests and infrastructure complaints assigned to the Roads Department, and keep statuses updated in real-time.";
  if (d.includes('electricity')) return "Review electricity service requests, power outage complaints assigned to the Electricity Department, and keep statuses updated in real-time.";
  if (d.includes('sanitation')) return "Monitor sanitation requests, waste management services assigned to the Sanitation Department, and keep statuses updated in real-time.";
  if (d.includes('urban planning')) return "Review building permits and planning applications assigned to the Urban Planning Department, and keep statuses updated in real-time.";
  
  return `Review and verify items assigned to the ${dept}, and keep statuses updated in real-time.`;
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 22px',
      border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 160px',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

function OfficerDashboard() {
  
  // Certificate State
  const [certStats, setCertStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [certFilter, setCertFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [officerDept, setOfficerDept] = useState('');
  const username = keycloak.tokenParsed?.preferred_username || 'Officer';
  const name = keycloak.tokenParsed?.name || username;
  
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
      
      let dept = keycloak.tokenParsed?.department || OFFICER_DEPT_MAP[username.toLowerCase()] || '';
      setOfficerDept(dept);
      
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
    <AppShell title="Field Operations">
      <div style={{ width: '100%', maxWidth: '100%', padding: '0 24px 40px 24px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* ── Welcome Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: 16, padding: '32px', color: '#fff',
        display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 10px 25px rgba(15,23,42,0.3)',
        marginBottom: 30, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: '#3b82f6', opacity: 0.15, borderRadius: '50%', filter: 'blur(50px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ 
            background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)',
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block' 
          }}>
            {officerDept ? `${officerDept.toUpperCase()} WORKSPACE` : 'DEPARTMENT WORKSPACE'}
          </span>
          <h2 style={{ margin: '14px 0 4px', fontSize: 32, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Welcome back, {name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1)}
          </h2>
          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
            {officerDept ? `${officerDept} Workspace` : 'Department Workspace'}
          </div>
          <p style={{ margin: 0, color: '#94a3b8', maxWidth: 650, fontSize: 15, lineHeight: 1.6 }}>
            {getDepartmentDescription(officerDept)}
          </p>
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
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <List size={20} color="#0f172a" />
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>My Assigned Complaints</h3>
              </div>
              <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {[
                      'All', 'Submitted', 'In Progress', 'Resolved', 'Rejected'
                    ].map(f => (
                      <button
                        key={f}
                        type="button"
                        className={`filter-chip${complaintFilter === f ? ' active' : ''}`}
                        onClick={() => setComplaintFilter(f)}
                        style={{
                          background: complaintFilter === f ? '#0f172a' : '#f1f5f9',
                          color: complaintFilter === f ? '#fff' : '#64748b',
                          border: 'none', padding: '6px 14px', borderRadius: 20,
                          fontSize: 13, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    {filteredComplaints.length === 0 ? (
                      <EmptyState
                        icon="inbox"
                        title="No Complaints Found"
                        message={complaintFilter === 'All' ? 'No complaints assigned to your department.' : `No ${complaintFilter} complaints.`}
                      />
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>#</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Title</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Priority</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>SLA</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredComplaints.map((c, index) => (
                            <tr key={c.complaintId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>{index + 1}</td>
                              <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0f172a' }}>{c.title}</td>
                              <td style={{ padding: '16px 20px', fontSize: 14 }}>{c.department || 'N/A'}</td>
                              <td style={{ padding: '16px 20px' }}>
                                <Badge variant={priorityVariant(c.priority)} label={c.priority || 'NORMAL'} />
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <Badge variant={slaVariant(c.slaStatus)} label={c.slaStatus || 'ON_TIME'} />
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <Badge variant={compStatusVariant(c.status)} label={c.status} />
                              </td>
                              <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                {['NEW', 'ASSIGNED'].includes(c.status) ? (
                                  <button
                                    type="button"
                                    style={{
                                      background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px',
                                      borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer', marginRight: 8
                                    }}
                                    onClick={() => navigate(`/complaints/${c.complaintId}`)}
                                  >
                                    Start Work
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  style={{
                                    background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '6px 12px',
                                    borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer'
                                  }}
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
          </div>
          )}

          {showCertificates && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#0f172a" />
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>Assigned Certificates</h3>
              </div>
              <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff', color: '#0f172a', outline: 'none' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {[
                      'All', 'Submitted', 'Under Verification', 'Action Required', 'Approved', 'Rejected', 'Certificate Generated', 'Downloaded'
                    ].map(f => (
                      <button
                        key={f}
                        type="button"
                        className={`filter-chip${certFilter === f ? ' active' : ''}`}
                        onClick={() => setCertFilter(f)}
                        style={{
                          background: certFilter === f ? '#0f172a' : '#f1f5f9',
                          color: certFilter === f ? '#fff' : '#64748b',
                          border: 'none', padding: '6px 14px', borderRadius: 20,
                          fontSize: 13, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    {filteredApps.length === 0 ? (
                      <EmptyState
                        icon="file-text"
                        title="No Certificate Applications"
                        message="There are currently no certificate applications assigned to your department."
                      />
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Application Number</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Certificate Type</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Applicant Name</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Applied Date</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Current Status</th>
                            <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredApps.map(app => (
                            <tr key={app.applicationId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: '600', fontSize: '12px', color: '#3b82f6' }}>{app.applicationNumber}</td>
                              <td style={{ padding: '16px 20px', fontSize: 14 }}>{app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td>
                              <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0f172a' }}>{app.applicantName}</td>
                              <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>
                                {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                              </td>
                              <td style={{ padding: '16px 20px' }}>
                                <Badge variant={certStatusVariant(app.status)} label={app.status} />
                              </td>
                              <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  style={{
                                    background: ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status) ? '#3b82f6' : '#f8fafc',
                                    color: ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status) ? '#fff' : '#0f172a',
                                    border: ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status) ? 'none' : '1px solid #e2e8f0',
                                    padding: '6px 12px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer'
                                  }}
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
          </div>
          )}
        </>
      )}
      </div>
    </AppShell>
  );
}

export default OfficerDashboard;
