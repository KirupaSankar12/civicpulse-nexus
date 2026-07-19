import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';

function slaBadge(s) {
  if (s === 'ON_TIME') return 'badge-green';
  if (s === 'NEAR_DEADLINE') return 'badge-yellow';
  if (s === 'OVERDUE') return 'badge-red';
  return 'badge-gray';
}

function statusBadge(s) {
  if (s === 'NEW') return 'badge-blue';
  if (s === 'ASSIGNED') return 'badge-purple';
  if (s === 'IN_PROGRESS') return 'badge-yellow';
  if (s === 'RESOLVED') return 'badge-green';
  if (s === 'CLOSED') return 'badge-gray';
  return 'badge-gray';
}

function priorityBadge(p) {
  if (p === 'HIGH') return 'badge-red';
  if (p === 'MEDIUM') return 'badge-yellow';
  return 'badge-blue';
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="spinner-sm" style={{ width: '32px', height: '32px', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
      </div>
    </AppShell>
  );

  return (
    <AppShell title="Citizen Dashboard">
      {/* Welcome card */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', border: 'none' }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Welcome back,</div>
            <h2 style={{ color: 'white', fontSize: '1.6rem', marginTop: '4px' }}>👋 {name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '6px', fontSize: '13.5px' }}>
              Your grievances are being handled. Track your complaints below.
            </p>
          </div>
          <Link to="/complaints/new" className="btn btn-accent btn-lg" style={{ flexShrink: 0 }}>
            ➕ Raise Complaint
          </Link>
        </div>
      </div>

      {/* Citizen stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': 'var(--primary)', '--stat-bg': 'rgba(30,58,95,0.08)' }}>
          <div className="stat-icon">📋</div>
          <div className="stat-value">{myComplaints.length}</div>
          <div className="stat-label">Total My Complaints</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--warning)', '--stat-bg': 'rgba(243,156,18,0.08)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending Resolution</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent)', '--stat-bg': 'rgba(39,174,96,0.08)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><h3>⚡ Quick Actions</h3></div>
        <div className="card-body">
          <div className="quick-actions">
            <Link to="/complaints/new" className="qa-card">
              <span className="qa-icon">📝</span>
              <span className="qa-label">Raise Complaint</span>
            </Link>
            <Link to="/complaints" className="qa-card">
              <span className="qa-icon">📋</span>
              <span className="qa-label">My Complaints</span>
            </Link>
            <Link to="/services/apply" className="qa-card">
              <span className="qa-icon">📜</span>
              <span className="qa-label">Apply for Certificate</span>
            </Link>
            <Link to="/services/tracker" className="qa-card">
              <span className="qa-icon">🔍</span>
              <span className="qa-label">Track Application</span>
            </Link>
            <Link to="/profile" className="qa-card">
              <span className="qa-icon">👤</span>
              <span className="qa-label">Update Profile</span>
            </Link>
            <div className="qa-card" onClick={() => window.open('tel:112')}>
              <span className="qa-icon">🆘</span>
              <span className="qa-label">Emergency: 112</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent complaints */}
      <div className="card">
        <div className="card-header">
          <h3>📋 Recent Complaints</h3>
          <Link to="/complaints" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div className="table-wrapper">
          {myComplaints.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
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
                  <tr key={c.complaintId}>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {c.complaintId?.slice(0, 8)}...
                    </td>
                    <td style={{ fontWeight: '500', maxWidth: '200px' }}>{c.title}</td>
                    <td>{c.department}</td>
                    <td><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td><span className={`badge ${slaBadge(c.slaStatus)}`}>{c.slaStatus || 'N/A'}</span></td>
                    <td>
                      <Link to={`/complaints/${c.complaintId}`} className="btn btn-ghost btn-sm">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner-sm" style={{ width: '32px', height: '32px', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
      </div>
    </AppShell>
  );

  return (
    <AppShell title="Officer Dashboard">
      {/* Welcome */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', border: 'none' }}>
        <div className="card-body">
          <h2 style={{ color: 'white' }}>👮 Welcome, {keycloak.tokenParsed?.name || name} ({keycloak.tokenParsed?.preferred_username || username})</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
            Manage and resolve assigned complaints. Update status and add remarks.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--stat-color': 'var(--primary)' }}>
          <div className="stat-icon">📋</div>
          <div className="stat-value">{complaints.length}</div>
          <div className="stat-label">Total Assigned</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--warning)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending Action</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': '#2980b9' }}>
          <div className="stat-icon">🔧</div>
          <div className="stat-value">{inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--danger)' }}>
          <div className="stat-icon">🚨</div>
          <div className="stat-value">{highPriority}</div>
          <div className="stat-label">High Priority</div>
        </div>
      </div>

      {/* Complaints table */}
      <div className="card">
        <div className="card-header"><h3>📋 My Assigned Complaints</h3></div>
        <div className="table-wrapper">
          {complaints.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎉</span>
              <p>No complaints assigned. Great job staying on top of things!</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Title</th><th>Dept</th><th>Priority</th><th>SLA</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {complaints.map((c, i) => (
                  <tr key={c.complaintId}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{page * pageSize + i + 1}</td>
                    <td style={{ fontWeight: '500' }}>
                      <Link to={`/complaints/${c.complaintId}`}>{c.title}</Link>
                    </td>
                    <td>{c.department}</td>
                    <td><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                    <td><span className={`badge ${slaBadge(c.slaStatus)}`}>{c.slaStatus || 'N/A'}</span></td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
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
      </div>
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner-sm" style={{ width: '32px', height: '32px', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
      </div>
    </AppShell>
  );

  const overdue = allComplaints.filter(c => c.slaStatus === 'OVERDUE').length;

  return (
    <AppShell title="Admin Dashboard">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'success' ? '#27ae60' : '#e74c3c',
          color: 'white', padding: '12px 20px', borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontSize: '14px', fontWeight: '500',
          maxWidth: '380px', lineHeight: '1.4'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Welcome */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #142840 0%, #1e3a5f 100%)', border: 'none' }}>
        <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'white' }}>🏛️ Admin Control Panel</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
              Monitor all complaints, assign officers, manage departments and track SLA.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/admin/officers" className="btn btn-outline btn-sm" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
              👮 Manage Officers
            </Link>
            <Link to="/admin/departments" className="btn btn-accent btn-sm">
              🏢 Departments
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
          <div className="stat-card" style={{ '--stat-color': 'var(--primary)' }}>
            <div className="stat-icon">📊</div>
            <div className="stat-value">{stats.totalComplaints}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--accent)' }}>
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.resolvedComplaints}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--warning)' }}>
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pendingComplaints}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--danger)' }}>
            <div className="stat-icon">🚨</div>
            <div className="stat-value">{overdue}</div>
            <div className="stat-label">SLA Overdue</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': '#2980b9' }}>
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats.resolutionRate}%</div>
            <div className="stat-label">Resolution Rate</div>
          </div>
        </div>
      )}

      {/* Breakdown cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="card">
            <div className="card-header"><h3>By Department</h3></div>
            <div className="card-body">
              {Object.entries(stats.byDepartment).map(([d, c]) => (
                <div key={d} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13.5px' }}>
                  <span>{d}</span>
                  <span className="badge badge-blue">{c}</span>
                </div>
              ))}
              {Object.keys(stats.byDepartment).length === 0 && <p className="text-muted" style={{ fontSize: '13px' }}>No data yet</p>}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3>By Status</h3></div>
            <div className="card-body">
              {Object.entries(stats.byStatus).map(([s, c]) => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13.5px' }}>
                  <span className={`badge ${statusBadge(s)}`}>{s}</span>
                  <span style={{ fontWeight: '700' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3>By Priority</h3></div>
            <div className="card-body">
              {Object.entries(stats.byPriority).map(([p, c]) => (
                <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13.5px' }}>
                  <span className={`badge ${priorityBadge(p)}`}>{p}</span>
                  <span style={{ fontWeight: '700' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All complaints table */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3>📋 All Complaints</h3>
            {totalElements > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                {totalElements} total record{totalElements !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Sort Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>🔃 Sort:</label>
              <select
                value={`${sortBy},${sortDir}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split(',');
                  setSortBy(field);
                  setSortDir(dir);
                  setPage(0);
                }}
                style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer' }}
              >
                <option value="createdAt,desc">📅 Date (Newest first)</option>
                <option value="createdAt,asc">📅 Date (Oldest first)</option>
                <option value="priority,desc">🚨 Priority (High → Low)</option>
              </select>
            </div>
            {/* Page Size */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Per page:</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer' }}
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
          <div style={{ textAlign: 'center', padding: '8px', color: 'var(--text-secondary)', fontSize: '13px', background: 'rgba(30,58,95,0.04)' }}>
            ⟳ Refreshing data...
          </div>
        )}

        <div className="table-wrapper">
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
                <tr key={c.complaintId}>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{page * pageSize + i + 1}</td>
                  <td style={{ fontWeight: '500', maxWidth: '180px' }}>
                    <Link to={`/complaints/${c.complaintId}`}>{c.title}</Link>
                  </td>
                  <td style={{ fontSize: '13px' }}>{c.department}</td>
                  <td><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                  <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                  <td><span className={`badge ${slaBadge(c.slaStatus)}`}>{c.slaStatus || 'N/A'}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
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
                            padding: '4px 8px', borderRadius: '6px', fontSize: '12.5px',
                            border: '1px solid var(--border)', flexGrow: 1,
                            background: 'var(--bg-card)', color: 'var(--text)'
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
                            padding: '4px 12px', fontSize: '12.5px', borderRadius: '6px',
                            background: assigning[c.complaintId] ? '#aaa' : 'var(--primary)',
                            color: 'white', border: 'none',
                            cursor: assigning[c.complaintId] ? 'not-allowed' : 'pointer',
                            fontWeight: '600', whiteSpace: 'nowrap'
                          }}
                        >
                          {assigning[c.complaintId] ? '...' : (c.status === 'ASSIGNED' ? '🔄 Re-assign' : 'Assign')}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
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
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No complaints yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
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
                    padding: '4px 10px', fontSize: '13px', borderRadius: '6px',
                    background: p === page ? 'var(--primary)' : 'transparent',
                    color: p === page ? 'white' : 'var(--text)',
                    border: `1px solid ${p === page ? 'var(--primary)' : 'var(--border)'}`,
                    cursor: 'pointer', fontWeight: p === page ? '700' : '400',
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
      </div>
    </AppShell>
  );
}

export default Dashboard;
