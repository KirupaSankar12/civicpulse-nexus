import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';

function statusBadge(s) {
  if (s === 'NEW') return 'badge-blue';
  if (s === 'ASSIGNED') return 'badge-purple';
  if (s === 'IN_PROGRESS') return 'badge-yellow';
  if (s === 'RESOLVED') return 'badge-green';
  if (s === 'CLOSED') return 'badge-gray';
  return 'badge-gray';
}

function dotColor(s) {
  if (s === 'RESOLVED' || s === 'CLOSED') return 'green';
  if (s === 'IN_PROGRESS') return 'orange';
  if (s === 'ASSIGNED') return '';
  return 'gray';
}

function ComplaintTimeline() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [assignOfficer, setAssignOfficer] = useState('');
  const [assignMsg, setAssignMsg] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isAdmin = roles.includes('admin') || roles.includes('ADMIN');
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer');

  const load = () => {
    api.get(`/grievance-service/api/complaints/${id}`)
      .then(r => setComplaint(r.data))
      .catch(() => setError('Could not load complaint details.'));
    api.get(`/grievance-service/api/complaints/${id}/history`)
      .then(r => setHistory(r.data))
      .catch(() => setHistory([]));
  };

  useEffect(() => { load(); }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignMsg('');
    try {
      await api.put(`/grievance-service/api/complaints/${id}/assign?officerUsername=${encodeURIComponent(assignOfficer)}`);
      setAssignMsg('success:Officer assigned successfully.');
      setAssignOfficer('');
      load();
    } catch (err) {
      setAssignMsg('error:' + (err.response?.data?.message || 'Assignment failed.'));
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdateMsg('');
    try {
      await api.put(`/grievance-service/api/complaints/${id}/status?status=${newStatus}&remarks=${encodeURIComponent(remarks)}`);
      setUpdateMsg('success:Status updated successfully.');
      setRemarks('');
      setNewStatus('');
      load();
    } catch (err) {
      setUpdateMsg('error:' + (err.response?.data?.message || 'Update failed.'));
    }
  };

  if (error) return (
    <AppShell title="Complaint Detail">
      <div className="alert alert-error"><span>⚠️</span>{error}</div>
    </AppShell>
  );

  if (!complaint) return (
    <AppShell title="Complaint Detail">
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner-sm" style={{ width: '32px', height: '32px', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
      </div>
    </AppShell>
  );

  return (
    <AppShell title="Complaint Detail">
      <div className="page-header">
        <Link to="/complaints" style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          ← Back to Complaints
        </Link>
        <h1 style={{ color: 'var(--primary)', marginTop: '8px' }}>📋 {complaint.title}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Complaint details */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="card-header">
              <h3>Complaint Details</h3>
              <span className={`badge ${statusBadge(complaint.status)}`}>{complaint.status}</span>
            </div>
            <div className="card-body">
              <table style={{ width: '100%', fontSize: '13.5px' }}>
                <tbody>
                  {[
                    ['Complaint ID', <code style={{ fontSize: '11px', background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>{complaint.complaintId}</code>],
                    ['Department', complaint.department],
                    ['Priority', <span className={`badge ${complaint.priority === 'HIGH' ? 'badge-red' : complaint.priority === 'MEDIUM' ? 'badge-yellow' : 'badge-blue'}`}>{complaint.priority}</span>],
                    ['SLA Status', <span className={`badge ${complaint.slaStatus === 'ON_TIME' ? 'badge-green' : complaint.slaStatus === 'NEAR_DEADLINE' ? 'badge-yellow' : complaint.slaStatus === 'OVERDUE' ? 'badge-red' : 'badge-gray'}`}>{complaint.slaStatus || 'N/A'}</span>],
                    ['Assigned Officer', complaint.assignedOfficer || <span style={{ color: 'var(--text-muted)' }}>Not yet assigned</span>],
                    ['Filed On', complaint.createdAt ? new Date(complaint.createdAt).toLocaleString('en-IN') : '—'],
                    ['SLA Deadline', complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleString('en-IN') : '—'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: '8px 0', color: 'var(--text-secondary)', fontWeight: '500', width: '140px', verticalAlign: 'top' }}>{label}</td>
                      <td style={{ padding: '8px 0', fontWeight: '500' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '6px' }}>Description</div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>{complaint.description}</div>
              </div>
            </div>
          </div>

          {/* Admin: Assign Officer */}
          {isAdmin && complaint.status === 'NEW' && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-header"><h3>👮 Assign to Officer</h3></div>
              <div className="card-body">
                {assignMsg && (
                  <div className={`alert ${assignMsg.startsWith('success') ? 'alert-success' : 'alert-error'}`}>
                    {assignMsg.replace(/^(success|error):/, '')}
                  </div>
                )}
                <form onSubmit={handleAssign} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    className="form-control"
                    value={assignOfficer}
                    onChange={e => setAssignOfficer(e.target.value)}
                    placeholder="Officer username (e.g. jane_officer)"
                    required
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary">Assign</button>
                </form>
              </div>
            </div>
          )}

          {/* Officer/Admin: Update Status */}
          {(isAdmin || isOfficer) && !['CLOSED', 'RESOLVED'].includes(complaint.status) && (
            <div className="card">
              <div className="card-header"><h3>🔄 Update Status</h3></div>
              <div className="card-body">
                {updateMsg && (
                  <div className={`alert ${updateMsg.startsWith('success') ? 'alert-success' : 'alert-error'}`}>
                    {updateMsg.replace(/^(success|error):/, '')}
                  </div>
                )}
                <form onSubmit={handleStatusUpdate}>
                  <div className="form-group">
                    <label>Change Status to</label>
                    <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)} required>
                      <option value="">— Select new status —</option>
                      {complaint.status === 'NEW' && <option value="ASSIGNED">ASSIGNED</option>}
                      {complaint.status === 'ASSIGNED' && <option value="IN_PROGRESS">IN_PROGRESS</option>}
                      {complaint.status === 'IN_PROGRESS' && <option value="RESOLVED">RESOLVED</option>}
                      {isAdmin && complaint.status === 'RESOLVED' && <option value="CLOSED">CLOSED</option>}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Remarks / Notes</label>
                    <input className="form-control" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add a note about this status change (optional)" />
                  </div>
                  <button type="submit" className="btn btn-primary">Update Status</button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card">
          <div className="card-header"><h3>📅 Status Timeline</h3></div>
          <div className="card-body">
            {history.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <span className="empty-icon">📝</span>
                <p>No history recorded yet.</p>
              </div>
            ) : (
              <div className="timeline">
                {history.map((h, i) => (
                  <div className="timeline-item" key={i}>
                    <div className={`timeline-dot ${dotColor(h.newStatus)}`} />
                    <div className="timeline-content">
                      <div className="tl-status">
                        {h.previousStatus ? `${h.previousStatus} → ` : ''}{h.newStatus}
                        {h.changedBy && <span style={{ fontWeight: '400', color: 'var(--text-secondary)' }}> by {h.changedBy}</span>}
                      </div>
                      <div className="tl-meta">
                        {h.changedAt ? new Date(h.changedAt).toLocaleString('en-IN') : ''}
                      </div>
                      {h.remarks && <div className="tl-remarks">"{h.remarks}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default ComplaintTimeline;
