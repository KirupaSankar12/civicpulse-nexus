import { useEffect, useState } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';

function OfficerApprovals() {
  const [submittedApps, setSubmittedApps] = useState([]);
  const [verifiedApps, setVerifiedApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const officerName = keycloak.tokenParsed?.preferred_username || 'officer';

  const fetchAllData = async () => {
    try {
      const [submittedRes, verifiedRes] = await Promise.all([
        api.get('/service-management-service/api/services/pending'),
        api.get('/service-management-service/api/services/verified-pending')
      ]);
      setSubmittedApps(submittedRes.data);
      setVerifiedApps(verifiedRes.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load pending service approvals. Is service-management-service running?');
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleVerify = async (id) => {
    const remarks = prompt("Verification remarks (press Cancel to abort):");
    if (remarks === null) return;
    try {
      await api.put(`/service-management-service/api/services/${id}/verify?officer=${officerName}&remarks=${encodeURIComponent(remarks)}`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify application');
    }
  };

  const handleApprove = async (id) => {
    const remarks = prompt("Final approval remarks (press Cancel to abort):");
    if (remarks === null) return;
    try {
      await api.put(`/service-management-service/api/services/${id}/approve?officer=${officerName}&remarks=${encodeURIComponent(remarks)}`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve application');
    }
  };

  const parseDetails = (json) => {
    try { return JSON.parse(json); } catch (e) { return {}; }
  };

  return (
    <AppShell title="Service Approvals">
      <div className="page-header">
        <h1 style={{ color: 'var(--primary)' }}>✅ Service Approvals Panel</h1>
        <p className="text-muted">
          Review, verify, and approve birth/death registrations, income certificates, and trade licenses.
        </p>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}

      {isLoading ? (
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <div className="spinner-sm" style={{ width: '32px', height: '32px', margin: '0 auto', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Loading approvals...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Step 1 — Pending Verification */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                Step 1: Pending Verification ({submittedApps.length})
              </h2>
            </div>

            {submittedApps.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>🎉</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>No applications awaiting verification.</p>
              </div>
            ) : (
              submittedApps.map(app => {
                const details = parseDetails(app.detailsJson);
                return (
                  <div key={app.appId} className="card" style={{ marginBottom: '16px' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>{app.type.replace(/_/g, ' ')}</h3>
                      <span className="badge badge-blue">SUBMITTED</span>
                    </div>
                    <div className="card-body" style={{ marginTop: '12px' }}>
                      <table style={{ width: '100%', fontSize: '13.5px', marginBottom: '14px' }}>
                        <tbody>
                          <tr><td style={{ color: 'var(--text-secondary)', width: '110px' }}>Applicant</td><td><strong>{app.applicantName}</strong></td></tr>
                          <tr><td style={{ color: 'var(--text-secondary)' }}>App ID</td><td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{app.appId}</td></tr>
                          {Object.entries(details).map(([k, v]) => (
                            <tr key={k}>
                              <td style={{ color: 'var(--text-secondary)' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</td>
                              <td>{v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {app.documentUrl && (
                        <div style={{ marginBottom: '14px' }}>
                          <a href={app.documentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600' }}>
                            📄 View Uploaded Document
                          </a>
                        </div>
                      )}
                      <button className="btn btn-primary btn-sm btn-full" onClick={() => handleVerify(app.appId)}>
                        ✓ Verify &amp; Pass to Step 2
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Step 2 — Pending Final Approval */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                Step 2: Pending Final Approval ({verifiedApps.length})
              </h2>
            </div>

            {verifiedApps.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>🎉</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>No applications awaiting final approval.</p>
              </div>
            ) : (
              verifiedApps.map(app => {
                return (
                  <div key={app.appId} className="card" style={{ marginBottom: '16px', borderLeft: '4px solid var(--accent)' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>{app.type.replace(/_/g, ' ')}</h3>
                      <span className="badge badge-purple">VERIFIED</span>
                    </div>
                    <div className="card-body" style={{ marginTop: '12px' }}>
                      <table style={{ width: '100%', fontSize: '13.5px', marginBottom: '14px' }}>
                        <tbody>
                          <tr><td style={{ color: 'var(--text-secondary)', width: '110px' }}>Applicant</td><td><strong>{app.applicantName}</strong></td></tr>
                          <tr><td style={{ color: 'var(--text-secondary)' }}>Verified By</td><td>{app.assignedOfficer || 'System'}</td></tr>
                          <tr><td style={{ color: 'var(--text-secondary)' }}>Remarks</td><td><em>{app.remarks || 'None'}</em></td></tr>
                        </tbody>
                      </table>
                      <button className="btn btn-accent btn-sm btn-full" onClick={() => handleApprove(app.appId)}>
                        🏆 Approve &amp; Issue Certificate
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}
    </AppShell>
  );
}

export default OfficerApprovals;
