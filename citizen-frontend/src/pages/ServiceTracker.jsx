import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import ProgressTracker from '../components/ProgressTracker.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageLoader from '../components/PageLoader.jsx';

function statusInfo(status) {
  switch (status) {
    case 'SUBMITTED': return { label: 'Submitted', cls: 'badge-blue' };
    case 'UNDER_VERIFICATION': return { label: 'Under Verification', cls: 'badge-purple' };
    case 'VERIFIED': return { label: 'Verified', cls: 'badge-purple' };
    case 'APPROVED': return { label: 'Approved', cls: 'badge-yellow' };
    case 'CERTIFICATE_GENERATED': return { label: 'Ready for Download', cls: 'badge-green' };
    case 'DOWNLOADED': return { label: 'Downloaded', cls: 'badge-green' };
    case 'REJECTED': return { label: 'Rejected — Action Required', cls: 'badge-red' };
    case 'RESUBMITTED': return { label: 'Resubmitted', cls: 'badge-yellow' };
    default: return { label: status, cls: 'badge-gray' };
  }
}

function formatServiceType(type) {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function ServiceTracker() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resubmitFile, setResubmitFile] = useState({});
  const [dragOverId, setDragOverId] = useState(null);

  const fetchApplications = () => {
    const citizenId = keycloak.tokenParsed?.sub;
    api.get(`/service-management-service/api/services/citizen/${citizenId}`)
      .then(r => {
        setApplications(r.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load applications. Is service-management-service running?');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDownload = async (id, certNum) => {
    try {
      const response = await api.get(`/service-management-service/api/services/download/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certNum || 'certificate'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert('Failed to download certificate PDF.');
    }
  };

  const handleResubmit = async (id, app) => {
    if (!resubmitFile[id]) {
      alert('Please select a file to re-upload');
      return;
    }

    let existingDocs = [];
    if (app.documentsSubmitted) {
      try {
        existingDocs = JSON.parse(app.documentsSubmitted);
      } catch (e) {
        existingDocs = app.documentsSubmitted.split(',').map(s => s.trim());
      }
    }
    if (!Array.isArray(existingDocs)) existingDocs = [];

    const newDocName = `Corrected_${resubmitFile[id].name}`;
    if (!existingDocs.includes(newDocName)) {
      existingDocs.push(newDocName);
    }

    try {
      await api.put(`/service-management-service/api/services/resubmit/${id}`, {
        serviceType: app.serviceType,
        documentsSubmitted: JSON.stringify(existingDocs),
        dynamicData: app.dynamicData ? JSON.parse(app.dynamicData) : {}
      });
      alert('Application resubmitted successfully!');
      setResubmitFile({ ...resubmitFile, [id]: null });
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to resubmit application.');
    }
  };

  return (
    <AppShell title="My Certificate Applications">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: 'var(--primary)' }}>My Applications</h1>
          <p className="text-muted">Track the status of your certificates and permits in real time.</p>
        </div>
        <Link to="/services/apply" className="btn btn-primary">
          + Apply for Certificate
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>⚠️</span> {error}
        </div>
      )}

      {isLoading && <PageLoader message="Loading your applications..." />}

      {!isLoading && applications.length === 0 && (
        <div className="card">
          <EmptyState
            icon="📭"
            title="No Applications Yet"
            message="You haven't submitted any certificate applications. Start by selecting a service type and completing the online form."
            actionLabel="Apply for Certificate"
            actionTo="/services/apply"
          />
        </div>
      )}

      {applications.map(app => {
        const si = statusInfo(app.status);
        const canDownload = app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED';

        return (
          <div key={app.id} className="card animate-fade-in" style={{ marginBottom: '18px' }}>
            <div className="card-header">
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--primary)' }}>
                  {formatServiceType(app.serviceType)}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Application No: <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: '4px' }}>{app.applicationNumber}</code>
                  {' · '}Applied: {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                </div>
              </div>
              <span className={`badge ${si.cls}`}>{si.label}</span>
            </div>

            <div className="card-body">
              <div className="detail-grid-2">
                <div>
                  <div className="detail-field" style={{ marginBottom: '10px' }}>
                    <label>Applicant Name</label>
                    <div className="detail-value">{app.applicantName}</div>
                  </div>
                  <div className="detail-field" style={{ marginBottom: '10px' }}>
                    <label>Aadhaar Number</label>
                    <div className="detail-value">XXXX-XXXX-{app.aadhaarNumber?.slice(-4)}</div>
                  </div>
                  {app.certificateNumber && (
                    <div className="detail-field">
                      <label>Certificate No</label>
                      <div className="detail-value"><code>{app.certificateNumber}</code></div>
                    </div>
                  )}
                  {app.downloadCount > 0 && (
                    <div className="detail-field" style={{ marginTop: '10px' }}>
                      <label>Downloads</label>
                      <div className="detail-value">{app.downloadCount} time(s)</div>
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '600' }}>
                    Application Progress
                  </div>
                  <ProgressTracker status={app.status} />
                </div>
              </div>

              {app.status === 'REJECTED' && (
                <div className="alert alert-error" style={{ marginTop: '20px' }}>
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '6px' }}>Action Required: Re-upload Documents</div>
                    <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Reason:</strong> {app.rejectionReason}</div>
                    {app.officerRemarks && <div style={{ fontSize: '13px', marginBottom: '12px' }}><strong>Remarks:</strong> {app.officerRemarks}</div>}

                    <div
                      className={`upload-card${dragOverId === app.id ? ' drag-over' : ''}`}
                      style={{ marginTop: '12px' }}
                      onDragOver={(e) => { e.preventDefault(); setDragOverId(app.id); }}
                      onDragLeave={() => setDragOverId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverId(null);
                        setResubmitFile({ ...resubmitFile, [app.id]: e.dataTransfer.files[0] });
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                          Browse Corrected File
                          <input type="file" accept=".pdf,.jpg,.png" style={{ display: 'none' }} onChange={(e) => setResubmitFile({ ...resubmitFile, [app.id]: e.target.files[0] })} />
                        </label>
                        {resubmitFile[app.id] && (
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{resubmitFile[app.id].name}</span>
                        )}
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleResubmit(app.id, app)} disabled={!resubmitFile[app.id]}>
                          Re-submit Application
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {canDownload && (
                <div style={{ marginTop: '20px' }}>
                  <div className="certificate-viewer">
                    <div className="cert-seal">🏛️</div>
                    <div className="cert-title">{formatServiceType(app.serviceType)}</div>
                    {app.certificateNumber && (
                      <div className="cert-number">Cert. No: {app.certificateNumber}</div>
                    )}
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '0' }}>
                      Your certificate is ready. Download, preview, or print the official PDF document.
                    </p>
                    <div className="cert-actions">
                      <button type="button" className="btn btn-accent" onClick={() => handleDownload(app.id, app.certificateNumber)}>
                        📥 Download PDF
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDownload(app.id, app.certificateNumber)}>
                        🖨 Print
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </AppShell>
  );
}

export default ServiceTracker;
