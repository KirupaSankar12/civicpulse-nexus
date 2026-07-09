import { useEffect, useState } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import CertificateDownloadCard from '../components/CertificateDownloadCard.jsx';

function statusInfo(status) {
  switch (status) {
    case 'SUBMITTED': return { label: 'Submitted', cls: 'badge-blue' };
    case 'VERIFIED': return { label: 'Verified', cls: 'badge-purple' };
    case 'APPROVED': return { label: 'Approved', cls: 'badge-yellow' };
    case 'GENERATED': return { label: '🎉 Certificate Ready', cls: 'badge-green' };
    case 'REJECTED': return { label: 'Rejected', cls: 'badge-red' };
    default: return { label: status, cls: 'badge-gray' };
  }
}

function ServiceTracker() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppId, setSelectedAppId] = useState(null);

  const fetchApplications = () => {
    const citizenId = keycloak.tokenParsed?.sub;
    api.get(`/service-management-service/api/services/citizen/${citizenId}`)
      .then(r => { setApplications(r.data); setIsLoading(false); })
      .catch(() => { setError('Could not load applications. Is service-management-service running?'); setIsLoading(false); });
  };

  useEffect(() => { fetchApplications(); }, []);

  const parseDetails = (json) => { try { return JSON.parse(json); } catch { return {}; } };

  return (
    <AppShell title="My Certificate Applications">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ color: 'var(--primary)' }}>📜 My Applications</h1>
          <p className="text-muted">Track status of your certificate and license applications.</p>
        </div>
        <a href="/services/apply" className="btn btn-primary">➕ New Application</a>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span>{error}</div>}
      {isLoading && <div style={{ padding: '48px', textAlign: 'center' }}><div className="spinner-sm" style={{ width: '32px', height: '32px', margin: '0 auto', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} /></div>}

      {!isLoading && applications.length === 0 && (
        <div className="card">
          <div className="empty-state" style={{ padding: '60px' }}>
            <span className="empty-icon">📭</span>
            <p>No applications yet. <a href="/services/apply">Apply for a certificate</a></p>
          </div>
        </div>
      )}

      {applications.map(app => {
        const details = parseDetails(app.detailsJson);
        const si = statusInfo(app.status);
        const stages = ['SUBMITTED', 'VERIFIED', 'GENERATED'];
        const currentIdx = stages.indexOf(app.status === 'APPROVED' ? 'VERIFIED' : app.status);

        return (
          <div key={app.appId} className="card" style={{ marginBottom: '16px' }}>
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1rem' }}>{app.type.replace(/_/g, ' ')}</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  ID: <code>{app.appId?.slice(0, 12)}...</code> · Applied: {new Date(app.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
              <span className={`badge ${si.cls}`}>{si.label}</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13.5px' }}>
                  <div><strong>Applicant:</strong> {app.applicantName}</div>
                  {app.assignedOfficer && <div><strong>Officer:</strong> {app.assignedOfficer}</div>}
                  {app.remarks && <div><strong>Remarks:</strong> <em>{app.remarks}</em></div>}
                  {app.type === 'BIRTH_CERTIFICATE' && details.childName && <div><strong>Child:</strong> {details.childName}</div>}
                  {app.type === 'INCOME_CERTIFICATE' && details.annualIncome && <div><strong>Income:</strong> ₹{details.annualIncome}</div>}
                  {app.type === 'TRADE_LICENSE' && details.businessName && <div><strong>Business:</strong> {details.businessName}</div>}
                </div>

                {/* Progress tracker */}
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '600' }}>Progress</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {stages.map((stage, i) => (
                      <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto 4px',
                            background: currentIdx >= i ? 'var(--accent)' : 'var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '12px', fontWeight: '700'
                          }}>
                            {currentIdx >= i ? '✓' : (i + 1)}
                          </div>
                          <div style={{ fontSize: '10px', color: currentIdx >= i ? 'var(--accent)' : 'var(--text-muted)' }}>
                            {stage === 'GENERATED' ? 'READY' : stage}
                          </div>
                        </div>
                        {i < stages.length - 1 && (
                          <div style={{ width: '20px', height: '2px', background: currentIdx > i ? 'var(--accent)' : 'var(--border)', margin: '0 2px' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {app.status === 'GENERATED' && (
                <button className="btn btn-accent btn-sm" onClick={() => setSelectedAppId(app.appId)}>
                  📥 Download Certificate
                </button>
              )}
            </div>
          </div>
        );
      })}

      {selectedAppId && (
        <CertificateDownloadCard appId={selectedAppId} onClose={() => { setSelectedAppId(null); fetchApplications(); }} />
      )}
    </AppShell>
  );
}

export default ServiceTracker;
