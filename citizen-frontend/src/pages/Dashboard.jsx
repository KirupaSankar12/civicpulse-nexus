import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';

import { StatCard } from '../components/StatCard.jsx';
import { SectionCard } from '../components/SectionCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { 
  LayoutDashboard, MessageSquareWarning, CheckCircle2, 
  Clock, AlertTriangle, Inbox, CheckCircle, 
  Settings, PenSquare, List, FilePlus, Search, User, Phone,
  FileText, Activity, Users, FileSignature
} from 'lucide-react';

function slaBadgeVariant(s) {
  if (s === 'ON_TIME') return 'success';
  if (s === 'NEAR_DEADLINE') return 'warning';
  if (s === 'OVERDUE') return 'danger';
  return 'neutral';
}

function statusBadgeVariant(s) {
  if (s === 'NEW') return 'info';
  if (s === 'ASSIGNED') return 'info';
  if (s === 'IN_PROGRESS') return 'warning';
  if (s === 'RESOLVED') return 'success';
  if (s === 'CLOSED') return 'neutral';
  return 'neutral';
}

function priorityBadgeVariant(p) {
  if (p === 'HIGH') return 'danger';
  if (p === 'MEDIUM') return 'warning';
  return 'info';
}

function Dashboard() {
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isCitizen = roles.includes('CITIZEN') || roles.includes('citizen');
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer');
  const isAdmin = roles.includes('admin') || roles.includes('ADMIN');

  if (isAdmin) return <AdminDashboard />;
  if (isOfficer) return <OfficerDashboardView />;
  return <CitizenDashboard />;
}

/* ==================== CITIZEN DASHBOARD ==================== */
function CitizenDashboard() {
  const [stats, setStats] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const citizenId = keycloak.tokenParsed?.sub;
  const name = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Citizen';

  useEffect(() => {
    Promise.all([
      api.get('/grievance-service/api/complaints/dashboard/stats'),
      api.get('/grievance-service/api/complaints')
    ])
      .then(([statsRes, complaintsRes]) => {
        setStats(statsRes.data);
        // filter to citizen's own
        const own = complaintsRes.data.filter(c => c.citizenId === citizenId);
        setMyComplaints(own);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [citizenId]);

  const pending = myComplaints.filter(c => !['RESOLVED','CLOSED'].includes(c.status)).length;
  const resolved = myComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  if (loading) return (
    <AppShell title="Citizen Dashboard">
      <PageLoader message="Loading your dashboard..." />
    </AppShell>
  );

  return (
    <AppShell title="Citizen Dashboard">
      <div className="welcome-banner">
        <div>
          <div className="welcome-label">Citizen Portal</div>
          <h2>Welcome back, {name}</h2>
          <p>Your grievances are being handled. Track complaints and access services below.</p>
        </div>
        <Link to="/complaints/new" className="btn btn-accent btn-lg" style={{ flexShrink: 0 }}>
          + Raise Complaint
        </Link>
      </div>

      {/* Citizen stats */}
      <div className="stats-grid">
        <StatCard icon={FileText} title="Total My Complaints" value={myComplaints.length} />
        <StatCard icon={Clock} title="Pending Resolution" value={pending} trendType="down" />
        <StatCard icon={CheckCircle2} title="Resolved" value={resolved} trendType="up" />
      </div>

      {/* Quick actions */}
      <SectionCard className="mb-4">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="var(--color-primary)" /> Quick Actions
        </h3>
        <div className="quick-actions">
          <Link to="/complaints/new" className="qa-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
            <span className="qa-icon" style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', marginBottom: '12px' }}><PenSquare size={24} /></span>
            <span className="qa-label" style={{ fontSize: '14px', fontWeight: '500' }}>Raise Complaint</span>
          </Link>
          <Link to="/complaints" className="qa-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
            <span className="qa-icon" style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', marginBottom: '12px' }}><List size={24} /></span>
            <span className="qa-label" style={{ fontSize: '14px', fontWeight: '500' }}>My Complaints</span>
          </Link>
          <Link to="/services/apply" className="qa-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
            <span className="qa-icon" style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', marginBottom: '12px' }}><FilePlus size={24} /></span>
            <span className="qa-label" style={{ fontSize: '14px', fontWeight: '500' }}>Apply for Certificate</span>
          </Link>
          <Link to="/services/tracker" className="qa-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
            <span className="qa-icon" style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', marginBottom: '12px' }}><Search size={24} /></span>
            <span className="qa-label" style={{ fontSize: '14px', fontWeight: '500' }}>Track Application</span>
          </Link>
          <Link to="/profile" className="qa-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--color-text-primary)' }}>
            <span className="qa-icon" style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', borderRadius: '50%', marginBottom: '12px' }}><User size={24} /></span>
            <span className="qa-label" style={{ fontSize: '14px', fontWeight: '500' }}>Update Profile</span>
          </Link>
          <div className="qa-card" onClick={() => window.open('tel:112')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', border: '1px solid var(--color-danger-light)', backgroundColor: 'var(--color-danger-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-danger)' }}>
            <span className="qa-icon" style={{ padding: '12px', backgroundColor: 'var(--color-white)', color: 'var(--color-danger)', borderRadius: '50%', marginBottom: '12px' }}><Phone size={24} /></span>
            <span className="qa-label" style={{ fontSize: '14px', fontWeight: '500' }}>Emergency: 112</span>
          </div>
        </div>
      </SectionCard>

      {/* Recent complaints */}
      <SectionCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={20} /> Recent Complaints
          </h3>
          <Link to="/complaints" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          {myComplaints.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon text-muted"><Inbox size={48} /></span>
              <p>No complaints filed yet. <Link to="/complaints/new">Raise your first complaint</Link></p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Department</th><th>Priority</th><th>Status</th><th>SLA</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myComplaints.slice(0, 5).map(c => (
                  <tr key={c.complaintId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      {c.complaintId?.slice(0, 8)}...
                    </td>
                    <td style={{ fontWeight: '500', maxWidth: '200px' }}>{c.title}</td>
                    <td>{c.department}</td>
                    <td><Badge variant={priorityBadgeVariant(c.priority)} label={c.priority} /></td>
                    <td><Badge variant={statusBadgeVariant(c.status)} label={c.status} /></td>
                    <td><Badge variant={slaBadgeVariant(c.slaStatus)} label={c.slaStatus || 'N/A'} /></td>
                    <td>
                      <Link to={`/complaints/${c.complaintId}`} className="btn btn-ghost btn-sm">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SectionCard>
    </AppShell>
  );
}

/* ==================== OFFICER DASHBOARD ==================== */
function OfficerDashboardView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  const username = keycloak.tokenParsed?.preferred_username;
  const name = keycloak.tokenParsed?.name || username;

  const fetchOfficerComplaints = (p) => {
    setLoading(true);
    api.get(`/grievance-service/api/complaints/officer?page=${p}&size=${pageSize}`)
      .then(r => {
        setComplaints(r.data.content || []);
        setTotalPages(r.data.totalPages || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOfficerComplaints(page);
  }, [page]);

  const pending = complaints.filter(c => c.status === 'ASSIGNED').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
  const highPriority = complaints.filter(c => c.priority === 'HIGH').length;

  const handleStatusChange = async (id, newStatus) => {
    const remarks = prompt('Add remarks for this update:');
    if (remarks === null) return;
    try {
      await api.put(`/grievance-service/api/complaints/${id}/status?status=${newStatus}&remarks=${encodeURIComponent(remarks)}`);
      fetchOfficerComplaints(page);
    } catch (e) { alert('Failed: ' + (e.response?.data?.message || e.message)); }
  };

  if (loading) return (
    <AppShell title="Officer Dashboard">
      <PageLoader message="Loading officer dashboard..." />
    </AppShell>
  );

  return (
    <AppShell title="Officer Dashboard">
      <div className="welcome-banner">
        <div>
          <div className="welcome-label">Officer Portal</div>
          <h2>Welcome, {keycloak.tokenParsed?.name || name}</h2>
          <p>Manage and resolve assigned complaints. Update status and add remarks.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={Inbox} title="Total Assigned" value={complaints.length} />
        <StatCard icon={Clock} title="Pending Action" value={pending} trendType="down" />
        <StatCard icon={Settings} title="In Progress" value={inProgress} />
        <StatCard icon={CheckCircle2} title="Resolved" value={resolved} trendType="up" />
        <StatCard icon={AlertTriangle} title="High Priority" value={highPriority} trendType="down" />
      </div>

      {/* Complaints table */}
      <SectionCard>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <List size={20} /> My Assigned Complaints
        </h3>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          {complaints.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon text-muted"><Inbox size={48} /></span>
              <p>No complaints assigned. Great job staying on top of things!</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Title</th><th>Dept</th><th>Priority</th><th>SLA</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {complaints.map((c, i) => (
                  <tr key={c.complaintId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>{page * pageSize + i + 1}</td>
                    <td style={{ fontWeight: '500' }}>
                      <Link to={`/complaints/${c.complaintId}`}>{c.title}</Link>
                    </td>
                    <td>{c.department}</td>
                    <td><Badge variant={priorityBadgeVariant(c.priority)} label={c.priority} /></td>
                    <td><Badge variant={slaBadgeVariant(c.slaStatus)} label={c.slaStatus || 'N/A'} /></td>
                    <td><Badge variant={statusBadgeVariant(c.status)} label={c.status} /></td>
                    <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {c.status === 'ASSIGNED' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(c.complaintId, 'IN_PROGRESS')}>
                          Start Work
                        </button>
                      )}
                      {c.status === 'IN_PROGRESS' && (
                        <button className="btn btn-accent btn-sm" onClick={() => handleStatusChange(c.complaintId, 'RESOLVED')}>
                          Resolve ✓
                        </button>
                      )}
                      <Link to={`/complaints/${c.complaintId}`} className="btn btn-outline btn-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
            >
              ◀ Previous
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
            >
              Next ▶
            </button>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}

/* ==================== ADMIN DASHBOARD ==================== */
const OFFICERS = [
  { username: 'sibi',   name: 'Sibi Officer',   email: 'sibi@muni.gov',   tel: '9100000001', dept: 'Water',           role: 'Field Officer (Junior)' },
  { username: 'joyel',  name: 'Joyel Officer',  email: 'joyel@muni.gov',  tel: '9100000002', dept: 'Public Works',    role: 'Field Officer (Junior)' },
  { username: 'kirupa', name: 'Kirupa Officer', email: 'kirupa@muni.gov', tel: '9100000003', dept: 'Sanitation Dept', role: 'Senior Officer (Approver)' },
  { username: 'harish', name: 'Harish Officer', email: 'harish@muni.gov', tel: '9100000004', dept: 'Water',           role: 'Senior Officer (Approver)' }
];

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedOfficers, setSelectedOfficers] = useState({});
  const [assigning, setAssigning] = useState({});

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.get('/grievance-service/api/complaints/dashboard/stats')
      .then(s => setStats(s.data))
      .catch(() => {});
  }, []);

  const fetchComplaints = (p, sBy, sDir, sz) => {
    setLoading(true);
    api.get(`/grievance-service/api/complaints?page=${p}&size=${sz}&sort=${sBy},${sDir}`)
      .then(r => {
        setAllComplaints(r.data.content || []);
        setTotalPages(r.data.totalPages || 0);
        setTotalElements(r.data.totalElements || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchComplaints(page, sortBy, sortDir, pageSize);
  }, [page, sortBy, sortDir, pageSize]);

  const handleAssign = async (id) => {
    const officer = selectedOfficers[id];
    if (!officer) {
      showToast('error', 'Please select an officer from the dropdown first.');
      return;
    }
    setAssigning(prev => ({ ...prev, [id]: true }));
    try {
      await api.put(`/grievance-service/api/complaints/${id}/assign`, { officerUsername: officer });
      const officerObj = OFFICERS.find(o => o.username === officer);
      showToast('success', `✅ Assigned to ${officerObj?.name || officer} successfully!`);
      setSelectedOfficers(prev => { const n = { ...prev }; delete n[id]; return n; });
      fetchComplaints(page, sortBy, sortDir, pageSize);
    } catch (e) {
      showToast('error', '❌ ' + (e.response?.data?.message || e.message));
    } finally {
      setAssigning(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading && allComplaints.length === 0) return (
    <AppShell title="Admin Dashboard">
      <PageLoader message="Loading admin dashboard..." />
    </AppShell>
  );

  const overdue = allComplaints.filter(c => c.slaStatus === 'OVERDUE').length;

  return (
    <AppShell title="Admin Dashboard">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type === 'success' ? 'success' : 'error'}`} role="status">
            {toast.msg}
          </div>
        </div>
      )}

      <div className="welcome-banner">
        <div>
          <div className="welcome-label">Administrator</div>
          <h2>Admin Control Panel</h2>
          <p>Monitor all complaints, assign officers, manage departments and track SLA.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/officers" className="btn btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
            Manage Officers
          </Link>
          <Link to="/admin/departments" className="btn btn-accent btn-sm">
            Departments
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <StatCard icon={FileText} title="Total Complaints" value={stats.totalComplaints} />
          <StatCard icon={CheckCircle2} title="Resolved" value={stats.resolvedComplaints} trendType="up" />
          <StatCard icon={Clock} title="Pending" value={stats.pendingComplaints} />
          <StatCard icon={AlertTriangle} title="SLA Overdue" value={overdue} trendType="down" />
          <StatCard icon={Activity} title="Resolution Rate" value={`${stats.resolutionRate}%`} />
        </div>
      )}

      {/* Breakdown cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <SectionCard>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>By Department</h3>
            <div>
              {Object.entries(stats.byDepartment).map(([d, c]) => (
                <div key={d} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '13.5px' }}>
                  <span>{d}</span>
                  <Badge variant="info" label={c} />
                </div>
              ))}
              {Object.keys(stats.byDepartment).length === 0 && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>No data yet</p>}
            </div>
          </SectionCard>
          <SectionCard>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>By Status</h3>
            <div>
              {Object.entries(stats.byStatus).map(([s, c]) => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '13.5px' }}>
                  <Badge variant={statusBadgeVariant(s)} label={s} />
                  <span style={{ fontWeight: '700' }}>{c}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px' }}>By Priority</h3>
            <div>
              {Object.entries(stats.byPriority).map(([p, c]) => (
                <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '13.5px' }}>
                  <Badge variant={priorityBadgeVariant(p)} label={p} />
                  <span style={{ fontWeight: '700' }}>{c}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* All complaints table */}
      <SectionCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <List size={20} /> All Complaints
            </h3>
            {totalElements > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                {totalElements} total record{totalElements !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Sort Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Sort:</label>
              <select
                value={`${sortBy},${sortDir}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split(',');
                  setSortBy(field);
                  setSortDir(dir);
                  setPage(0);
                }}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
              >
                <option value="createdAt,desc">📅 Date (Newest first)</option>
                <option value="createdAt,asc">📅 Date (Oldest first)</option>
                <option value="priority,desc">🚨 Priority (High → Low)</option>
              </select>
            </div>
            {/* Page Size */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Per page:</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <Link to="/complaints" className="btn btn-outline btn-sm">Full View</Link>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '8px', color: 'var(--color-text-secondary)', fontSize: '13px', background: 'var(--color-bg)' }}>
            ⟳ Refreshing data...
          </div>
        )}

        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Dept.</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA</th>
                <th>Date Filed</th>
                <th>👮 Assign to Officer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allComplaints.map((c, i) => (
                <tr key={c.complaintId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>{page * pageSize + i + 1}</td>
                  <td style={{ fontWeight: '500', maxWidth: '180px' }}>
                    <Link to={`/complaints/${c.complaintId}`}>{c.title}</Link>
                  </td>
                  <td style={{ fontSize: '13px' }}>{c.department}</td>
                  <td><Badge variant={priorityBadgeVariant(c.priority)} label={c.priority} /></td>
                  <td><Badge variant={statusBadgeVariant(c.status)} label={c.status} /></td>
                  <td><Badge variant={slaBadgeVariant(c.slaStatus)} label={c.slaStatus || 'N/A'} /></td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td style={{ minWidth: '250px' }}>
                    {/* Show assign/re-assign dropdown for NEW and ASSIGNED complaints */}
                    {(c.status === 'NEW' || c.status === 'ASSIGNED') ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <select
                          onChange={(e) => setSelectedOfficers(prev => ({ ...prev, [c.complaintId]: e.target.value }))}
                          value={selectedOfficers[c.complaintId] || ''}
                          style={{
                            padding: '6px 12px', borderRadius: 'var(--radius-md)', fontSize: '12.5px',
                            border: '1px solid var(--color-border)', flexGrow: 1,
                            backgroundColor: 'var(--color-white)', color: 'var(--color-text-primary)'
                          }}
                        >
                          <option value="" disabled>
                            {c.status === 'ASSIGNED' && c.assignedOfficer
                              ? `👤 ${OFFICERS.find(o => o.username === c.assignedOfficer)?.name || c.assignedOfficer} (change?)`
                              : '👮 Select Officer...'}
                          </option>
                          {OFFICERS.map(o => (
                            <option key={o.username} value={o.username}>
                              {o.name} ({o.dept} · {o.role})
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(c.complaintId)}
                          disabled={assigning[c.complaintId]}
                          style={{
                            padding: '6px 12px', fontSize: '12.5px', borderRadius: 'var(--radius-md)',
                            backgroundColor: assigning[c.complaintId] ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                            color: 'white', border: 'none',
                            cursor: assigning[c.complaintId] ? 'not-allowed' : 'pointer',
                            fontWeight: '600', whiteSpace: 'nowrap'
                          }}
                        >
                          {assigning[c.complaintId] ? '...' : (c.status === 'ASSIGNED' ? '🔄 Re-assign' : 'Assign')}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                        👤 {OFFICERS.find(o => o.username === c.assignedOfficer)?.name || c.assignedOfficer || 'Unassigned'}
                      </span>
                    )}
                  </td>
                  <td>
                    <Link to={`/complaints/${c.complaintId}`} className="btn btn-ghost btn-sm">View</Link>
                  </td>
                </tr>
              ))}
              {allComplaints.length === 0 && !loading && (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>No complaints yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
            Page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong>
            {totalElements > 0 && <span style={{ marginLeft: '8px' }}>· {totalElements} total records</span>}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage(0)}
              disabled={page === 0}
              title="First page"
            >
              ⏮ First
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
            >
              ◀ Previous
            </button>
            {/* Page number buttons (show up to 5 pages) */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
              const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
              const p = startPage + idx;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: '6px 12px', fontSize: '13px', borderRadius: 'var(--radius-md)',
                    backgroundColor: p === page ? 'var(--color-primary)' : 'var(--color-white)',
                    color: p === page ? 'white' : 'var(--color-text-primary)',
                    border: `1px solid ${p === page ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    cursor: 'pointer', fontWeight: p === page ? '700' : '500',
                    minWidth: '32px'
                  }}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
            >
              Next ▶
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              title="Last page"
            >
              Last ⏭
            </button>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}

export default Dashboard;
