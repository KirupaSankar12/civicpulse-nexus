import { useEffect, useState } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import { Link } from 'react-router-dom';

function slaCss(status) {
  if (status === 'ON_TIME') return 'sla-ontime';
  if (status === 'NEAR_DEADLINE') return 'sla-near';
  if (status === 'OVERDUE') return 'sla-overdue';
  return '';
}

function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const username = keycloak.tokenParsed?.preferred_username;

  const loadComplaints = () => {
    if (!username) return;
    api.get(`/grievance-service/api/complaints/officer/${username}`)
      .then((res) => {
        setComplaints(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch your assigned complaints.');
        setIsLoading(false);
      });
  };

  useEffect(() => { loadComplaints(); }, [username]);

  const handleUpdateStatus = async (id, newStatus) => {
    const remarks = prompt('Add remarks for this status change (press Cancel to abort):');
    if (remarks === null) return;

    try {
      await api.put(`/grievance-service/api/complaints/${id}/status?status=${newStatus}&remarks=${encodeURIComponent(remarks)}`);
      loadComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) return <p className="loading-text">Loading your assignments...</p>;

  return (
    <div>
      <h1>Officer Dashboard — {username}</h1>
      <p style={{ marginBottom: '12px', color: '#555' }}>
        These are the complaints currently assigned to you. Use the action column to update status.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Department</th>
              <th>Priority</th>
              <th>SLA</th>
              <th>Current Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No complaints assigned to you. Good job!
                </td>
              </tr>
            ) : (
              complaints.map((c, idx) => (
                <tr key={c.complaintId}>
                  <td>{idx + 1}</td>
                  <td><Link to={`/complaints/${c.complaintId}`}>{c.title}</Link></td>
                  <td>{c.department}</td>
                  <td>
                    {c.priority === 'HIGH' && <span className="priority-high">HIGH</span>}
                    {c.priority === 'MEDIUM' && <span className="priority-medium">MEDIUM</span>}
                    {c.priority === 'LOW' && <span className="priority-low">LOW</span>}
                  </td>
                  <td><span className={slaCss(c.slaStatus)}>{c.slaStatus || 'N/A'}</span></td>
                  <td>{c.status}</td>
                  <td>
                    {c.status === 'ASSIGNED' && (
                      <button className="btn btn-small btn-primary" onClick={() => handleUpdateStatus(c.complaintId, 'IN_PROGRESS')}>
                        Mark In Progress
                      </button>
                    )}
                    {c.status === 'IN_PROGRESS' && (
                      <button className="btn btn-small btn-primary" onClick={() => handleUpdateStatus(c.complaintId, 'RESOLVED')}>
                        Mark Resolved
                      </button>
                    )}
                    {(c.status === 'RESOLVED' || c.status === 'CLOSED') && (
                      <span style={{ color: 'green' }}>Done ✓</span>
                    )}
                    &nbsp;
                    <Link to={`/complaints/${c.complaintId}`} className="btn btn-small">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OfficerDashboard;
