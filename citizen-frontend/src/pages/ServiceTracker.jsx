import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import ProgressTracker from '../components/ProgressTracker.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageLoader from '../components/PageLoader.jsx';

import { SectionCard } from '../components/SectionCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { Download, Printer, AlertTriangle, AlertCircle, FileText, CheckCircle2, Upload, Info } from 'lucide-react';

function statusBadgeVariant(status) {
  switch (status) {
    case 'SUBMITTED': return 'info';
    case 'UNDER_VERIFICATION': return 'info';
    case 'VERIFIED': return 'info';
    case 'APPROVED': return 'warning';
    case 'CERTIFICATE_GENERATED': return 'success';
    case 'DOWNLOADED': return 'success';
    case 'REJECTED': return 'danger';
    case 'RESUBMITTED': return 'warning';
    default: return 'neutral';
  }
}

function statusInfo(status) {
  switch (status) {
    case 'SUBMITTED': return 'Submitted';
    case 'UNDER_VERIFICATION': return 'Under Verification';
    case 'VERIFIED': return 'Verified';
    case 'APPROVED': return 'Approved';
    case 'CERTIFICATE_GENERATED': return 'Ready for Download';
    case 'DOWNLOADED': return 'Downloaded';
    case 'REJECTED': return 'Rejected — Action Required';
    case 'RESUBMITTED': return 'Resubmitted';
    default: return status;
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
        <div className="alert alert-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {isLoading && <PageLoader message="Loading your applications..." />}

      {!isLoading && applications.length === 0 && (
        <SectionCard>
          <EmptyState
            icon="inbox" // Handled by EmptyState if updated, else text
            title="No Applications Yet"
            message="You haven't submitted any certificate applications. Start by selecting a service type and completing the online form."
            actionLabel="Apply for Certificate"
            actionTo="/services/apply"
          />
        </SectionCard>
      )}

      {applications.map(app => {
        const statusLabel = statusInfo(app.status);
        const statusVariant = statusBadgeVariant(app.status);
        const canDownload = app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED';

        return (
          <SectionCard key={app.id} className="animate-fade-in mb-4" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--color-text-primary)', fontWeight: '600' }}>
                  {formatServiceType(app.serviceType)}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Application No: <code style={{ backgroundColor: 'var(--color-white)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>{app.applicationNumber}</code>
                  {' · '}Applied: {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                </div>
              </div>
              <Badge variant={statusVariant} label={statusLabel} />
            </div>

            <div style={{ padding: '20px' }}>
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
                <div className="alert alert-error" style={{ marginTop: '20px', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} /> Action Required: Re-upload Documents
                    </div>
                    <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Reason:</strong> {app.rejectionReason}</div>
                    {app.officerRemarks && <div style={{ fontSize: '13px', marginBottom: '12px' }}><strong>Remarks:</strong> {app.officerRemarks}</div>}

                    <div
                      className={`upload-card${dragOverId === app.id ? ' drag-over' : ''}`}
                      style={{ marginTop: '16px', padding: '16px', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg)', textAlign: 'center' }}
                      onDragOver={(e) => { e.preventDefault(); setDragOverId(app.id); }}
                      onDragLeave={() => setDragOverId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverId(null);
                        setResubmitFile({ ...resubmitFile, [app.id]: e.dataTransfer.files[0] });
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Upload size={16} /> Browse Corrected File
                          <input type="file" accept=".pdf,.jpg,.png" style={{ display: 'none' }} onChange={(e) => setResubmitFile({ ...resubmitFile, [app.id]: e.target.files[0] })} />
                        </label>
                        {resubmitFile[app.id] && (
                          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> {resubmitFile[app.id].name}</span>
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
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center', backgroundColor: 'var(--color-success-light)' }}>
                    <div style={{ color: 'var(--color-success)', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                      <CheckCircle2 size={40} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>{formatServiceType(app.serviceType)}</div>
                    {app.certificateNumber && (
                      <div style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Cert. No: {app.certificateNumber}</div>
                    )}
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                      Your certificate is ready. Download, preview, or print the official PDF document.
                    </p>
                    <div className="alert alert-info" style={{ marginBottom: '20px', padding: '12px', fontSize: '12px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Note:</strong> This certificate has also been saved in <Link to="/services/my-certificates" style={{ textDecoration: 'underline' }}>My Certificates</Link> for permanent access.</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-accent" onClick={() => handleDownload(app.id, app.certificateNumber)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={16} /> Download PDF
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDownload(app.id, app.certificateNumber)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Printer size={16} /> Print
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        );
      })}
    </AppShell>
  );
}

export default ServiceTracker;
