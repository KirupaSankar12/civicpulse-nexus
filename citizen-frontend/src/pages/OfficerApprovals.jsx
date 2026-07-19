import { useEffect, useState } from 'react';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';

function OfficerApprovals() {
  const [submittedApps, setSubmittedApps] = useState([]);
  const [verifiedApps, setVerifiedApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    try {
      const [submittedRes, verifiedRes] = await Promise.all([
        api.get('/service-management-service/api/services/pending'),
        api.get('/service-management-service/api/services/status/verified')
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

  useEffect(() => { 
    fetchAllData(); 
  }, []);

  const handleVerify = async (id, isApprove) => {
    const remarks = prompt(isApprove ? "Verification remarks (pass to Step 2):" : "Rejection reason:");
    if (remarks === null) return;
    
    try {
      await api.put(`/service-management-service/api/services/verify/${id}`, {
        verified: isApprove,
        remarks: remarks
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to verify application');
    }
  };

  const handleApprove = async (id) => {
    if (!confirm("Are you sure you want to approve this application and issue the certificate?")) return;
    try {
      await api.put(`/service-management-service/api/services/approve/${id}`);
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    try {
      await api.put(`/service-management-service/api/services/reject/${id}`, {
        reason: reason
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to reject application');
    }
  };

  return (
    <AppShell title="Service Approvals">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)' }}>✅ Service Approvals Panel</h1>
        <p className="text-muted">
          Review, verify, and approve birth/death registrations, income certificates, and trade licenses.
        </p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px' }}><span>⚠️</span> {error}</div>}

      {isLoading ? (
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <div className="spinner-sm" style={{ width: '32px', height: '32px', margin: '0 auto', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading approvals...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Step 1 — Pending Verification */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                Step 1: Pending Verification ({submittedApps.length})
              </h2>
            </div>

            {submittedApps.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '2rem' }}>🎉</span>
                <p style={{ color: '#6b7280', marginTop: '8px' }}>No applications awaiting verification.</p>
              </div>
            ) : (
              submittedApps.map(app => (
                <div key={app.id} className="card" style={{ marginBottom: '16px', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 'bold' }}>
                      {app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </h3>
                    <span className="badge badge-blue" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>SUBMITTED</span>
                  </div>
                  <div className="card-body">
                    <div style={{ fontSize: '13.5px', lineHeight: '1.8', marginBottom: '1rem' }}>
                      <div><strong>Applicant:</strong> {app.applicantName}</div>
                      <div><strong>Aadhaar Number:</strong> XXXX-XXXX-{app.aadhaarNumber?.slice(-4)}</div>
                      <div><strong>App ID:</strong> <code style={{ fontSize: '11px' }}>{app.applicationNumber}</code></div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleVerify(app.id, true)} style={{ flex: 1, padding: '0.5rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ✓ Verify App
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleVerify(app.id, false)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Step 2 — Pending Final Approval */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                Step 2: Pending Final Approval ({verifiedApps.length})
              </h2>
            </div>

            {verifiedApps.length === 0 ? (
              <div className="card" style={{ padding: '24px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '2rem' }}>🎉</span>
                <p style={{ color: '#6b7280', marginTop: '8px' }}>No applications awaiting final approval.</p>
              </div>
            ) : (
              verifiedApps.map(app => (
                <div key={app.id} className="card" style={{ marginBottom: '16px', padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #eee', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 'bold' }}>
                      {app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </h3>
                    <span className="badge badge-purple" style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>VERIFIED</span>
                  </div>
                  <div className="card-body">
                    <div style={{ fontSize: '13.5px', lineHeight: '1.8', marginBottom: '1rem' }}>
                      <div><strong>Applicant:</strong> {app.applicantName}</div>
                      <div><strong>Aadhaar Number:</strong> XXXX-XXXX-{app.aadhaarNumber?.slice(-4)}</div>
                      <div><strong>Verified By:</strong> {app.verifiedBy || 'Officer'}</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-accent btn-sm" onClick={() => handleApprove(app.id)} style={{ flex: 1, padding: '0.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        🏆 Approve & Issue
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleReject(app.id)} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}
    </AppShell>
  );
}

export default OfficerApprovals;
