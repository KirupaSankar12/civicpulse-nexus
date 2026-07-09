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

function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isCitizen = roles.includes('CITIZEN') || roles.includes('citizen');
  const citizenId = keycloak.tokenParsed?.sub;

  useEffect(() => {
    api.get('/grievance-service/api/complaints')
      .then(r => {
        let data = r.data;
        // Citizens see only their own
        if (isCitizen) data = data.filter(c => c.citizenId === citizenId);
        setComplaints(data);
        setLoading(false);
      })
      .catch(e => {
        setError('Failed to load complaints.');
        setLoading(false);
      });
  }, []);

  return (
    <AppShell title={isCitizen ? 'My Complaints' : 'All Complaints'}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: 'var(--primary)' }}>
            {isCitizen ? '📋 My Complaints' : '📋 All Complaints'}
          </h1>
          <p className="text-muted">
            {isCitizen ? 'All grievances you have filed. Click any row to see details.' : 'All complaints in the system.'}
          </p>
        </div>
        {isCitizen && (
          <Link to="/complaints/new" className="btn btn-primary">
            ➕ Raise New Complaint
          </Link>
        )}
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

      <div className="card">
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div className="spinner-sm" style={{ width: '32px', height: '32px', borderColor: 'var(--border)', borderTopColor: 'var(--primary)', margin: '0 auto' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Loading complaints...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Complaint Title</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>SLA</th>
                  <th>Assigned Officer</th>
                  <th>Filed On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <p>No complaints found. {isCitizen && <Link to="/complaints/new">File your first complaint</Link>}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  complaints.map((c, i) => (
                    <tr key={c.complaintId}>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{i + 1}</td>
                      <td>
                        <Link to={`/complaints/${c.complaintId}`} style={{ fontWeight: '600' }}>
                          {c.title}
                        </Link>
                      </td>
                      <td>{c.department}</td>
                      <td><span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span></td>
                      <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                      <td><span className={`badge ${slaBadge(c.slaStatus)}`}>{c.slaStatus || 'N/A'}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{c.assignedOfficer || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <Link to={`/complaints/${c.complaintId}`} className="btn btn-ghost btn-sm">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default ComplaintList;
