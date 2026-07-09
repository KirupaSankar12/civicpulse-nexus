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
  const username = keycloak.tokenParsed?.preferred_username;
  const name = keycloak.tokenParsed?.name || username;

  useEffect(() => {
    api.get(`/grievance-service/api/complaints/officer/${username}`)
      .then(r => { setComplaints(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [username]);

  const pending = complaints.filter(c => c.status === 'ASSIGNED').length;
  const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;
  const highPriority = complaints.filter(c => c.priority === 'HIGH').length;

  const handleStatusChange = async (id, newStatus) => {
    const remarks = prompt('Add remarks for this update:');
    if (remarks === null) return;
    try {
      await api.put(`/grievance-service/api/complaints/${id}/status?status=${newStatus}&remarks=${encodeURIComponent(remarks)}`);
      const r = await api.get(`/grievance-service/api/complaints/officer/${username}`);
      setComplaints(r.data);
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
          <h2 style={{ color: 'white' }}>👮 Officer Dashboard — {name}</h2>
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
                    <td>{i + 1}</td>
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
      </div>
    </AppShell>
  );
}

/* ==================== ADMIN DASHBOARD ==================== */
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/grievance-service/api/complaints/dashboard/stats'),
      api.get('/grievance-service/api/complaints'),
    ])
      .then(([s, c]) => {
        setStats(s.data);
        setAllComplaints(c.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAssign = async (id) => {
    const officer = prompt('Enter officer username to assign:');
    if (!officer) return;
    try {
      await api.put(`/grievance-service/api/complaints/${id}/assign?officerUsername=${encodeURIComponent(officer)}`);
      const r = await api.get('/grievance-service/api/complaints');
      setAllComplaints(r.data);
      alert('Assigned successfully!');
    } catch (e) { alert('Failed: ' + (e.response?.data?.message || e.message)); }
  };

  if (loading) return (
    <AppShell title="Admin Dashboard">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner-sm" style={{ width: '32px', height: '32px', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
      </div>
    </AppShell>
  );

  const overdue = allComplaints.filter(c => c.slaStatus === 'OVERDUE').length;

  return (
    <AppShell title="Admin Dashboard">
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

      {/* All complaints */}
      <div className="card">
        <div className="card-header">
          <h3>📋 All Complaints</h3>
          <Link to="/complaints" className="btn btn-outline btn-sm">Full View</Link>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Title</th><th>Dept.</th><th>Priority</th><th>Status</th><th>SLA</th><th>Officer</th><th>Action</th></tr>
            </thead>
            <tbody>
              {allComplaints.slice(0, 10).map((c, i) => (
                <tr key={c.complaintId}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: '500' }}>
                    <Link to={`/complaints/${c.complaintId}`}>{c.title}</Link>
                  </td>
                  <td>{c.department}</td>
                  <td><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                  <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                  <td><span className={`badge ${slaBadge(c.slaStatus)}`}>{c.slaStatus || 'N/A'}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{c.assignedOfficer || '—'}</td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    {c.status === 'NEW' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleAssign(c.complaintId)}>
                        Assign
                      </button>
                    )}
                    <Link to={`/complaints/${c.complaintId}`} className="btn btn-ghost btn-sm">View</Link>
                  </td>
                </tr>
              ))}
              {allComplaints.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No complaints yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

export default Dashboard;
