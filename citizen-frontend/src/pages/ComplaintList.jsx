import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';

import { SectionCard } from '../components/SectionCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { AlertCircle, Plus, ClipboardList, Inbox, ArrowRight } from 'lucide-react';

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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={28} />
            {isCitizen ? 'My Complaints' : 'All Complaints'}
          </h1>
          <p className="text-muted" style={{ marginTop: '4px' }}>
            {isCitizen ? 'All grievances you have filed. Click any row to see details.' : 'All complaints in the system.'}
          </p>
        </div>
        {isCitizen && (
          <Link to="/complaints/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={18} /> Raise New Complaint
          </Link>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <SectionCard style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div className="spinner-sm" style={{ width: '32px', height: '32px', borderColor: 'var(--border)', borderTopColor: 'var(--primary)', margin: '0 auto' }} />
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Loading complaints...</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
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
                      <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <Inbox size={48} color="var(--color-text-secondary)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <h3 style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>No complaints found</h3>
                        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                          {isCitizen && <Link to="/complaints/new" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>File your first complaint</Link>}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  complaints.map((c, i) => (
                    <tr key={c.complaintId} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>{i + 1}</td>
                      <td>
                        <Link to={`/complaints/${c.complaintId}`} style={{ fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none' }}>
                          {c.title}
                        </Link>
                      </td>
                      <td>{c.department}</td>
                      <td><Badge variant={priorityBadgeVariant(c.priority)} label={c.priority} /></td>
                      <td><Badge variant={statusBadgeVariant(c.status)} label={c.status} /></td>
                      <td><Badge variant={slaBadgeVariant(c.slaStatus)} label={c.slaStatus || 'N/A'} /></td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>{c.assignedOfficer || '—'}</td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <Link to={`/complaints/${c.complaintId}`} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          View <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}

export default ComplaintList;
