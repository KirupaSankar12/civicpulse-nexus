import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';

function OfficerApplicationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checklist, setChecklist] = useState({
    identityVerified: false,
    addressVerified: false,
    documentsAuthentic: false,
    noPendingDues: false
  });

  const [rejectReason, setRejectReason] = useState('');
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get(`/service-management-service/api/services/${id}`);
        setApp(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load application details.');
        setIsLoading(false);
      }
    };
    fetchApp();
  }, [id]);

  const allChecked = Object.values(checklist).every(Boolean);

  const handleApprove = async () => {
    if (!allChecked) return;
    if (!confirm('Are you sure you want to approve this application and issue the certificate?')) return;
    try {
      await api.put(`/service-management-service/api/services/approve/${id}`);
      alert('Application approved successfully!');
      navigate('/services/officer/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert('Please select a rejection reason.');
      return;
    }
    try {
      await api.put(`/service-management-service/api/services/reject/${id}`, {
        reason: rejectReason,
        officerRemarks: officerRemarks
      });
      alert('Application rejected.');
      setShowRejectModal(false);
      navigate('/services/officer/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to reject application');
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Application Details">
        <PageLoader message="Loading application details..." />
      </AppShell>
    );
  }

  if (error || !app) {
    return (
      <AppShell title="Application Details">
        <div className="card">
          <div className="empty-state-enhanced">
            <div className="empty-state-illustration">⚠️</div>
            <h3>Application Not Found</h3>
            <p>{error || 'The requested application could not be loaded.'}</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/services/officer/dashboard')}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  let dynamicData = {};
  if (app.dynamicData) {
    try {
      dynamicData = JSON.parse(app.dynamicData);
    } catch (e) {
      console.error('Failed to parse dynamic data', e);
    }
  }

  let documents = [];
  if (app.documentsSubmitted) {
    try {
      documents = JSON.parse(app.documentsSubmitted);
    } catch (e) {
      documents = app.documentsSubmitted.split(',').map(d => d.trim());
    }
  }

  const isPendingAction = ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status);

  const checklistItems = [
    { key: 'identityVerified', label: 'Applicant identity matches Aadhaar and records.' },
    { key: 'addressVerified', label: 'Address proof is valid and matches applicant details.' },
    { key: 'documentsAuthentic', label: 'All submitted documents appear authentic and un-tampered.' },
    { key: 'noPendingDues', label: 'No pending municipal dues or legal blocks found.' },
  ];

  return (
    <AppShell title="Application Details">
      <div className="page-header">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/services/officer/dashboard')} style={{ marginBottom: '8px' }}>
          ← Back to Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ color: 'var(--primary)', margin: 0 }}>Application Details</h1>
          <span className={`badge badge-${isPendingAction ? 'yellow' : app.status === 'REJECTED' ? 'red' : 'green'}`}>
            {app.status}
          </span>
        </div>
        <p className="text-muted">Application No: {app.applicationNumber}</p>
      </div>

      <div className="officer-detail-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-body">
              <div className="detail-section-title">👤 Citizen Details</div>
              <div className="detail-grid-2">
                <div className="detail-field">
                  <label>Applicant Name</label>
                  <div className="detail-value">{app.applicantName}</div>
                </div>
                <div className="detail-field">
                  <label>Aadhaar Number</label>
                  <div className="detail-value">XXXX-XXXX-{app.aadhaarNumber?.slice(-4)}</div>
                </div>
                <div className="detail-field">
                  <label>Applied Date</label>
                  <div className="detail-value">{new Date(app.appliedDate).toLocaleString('en-IN')}</div>
                </div>
                <div className="detail-field">
                  <label>Service Type</label>
                  <div className="detail-value">{app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                </div>
              </div>
            </div>
          </div>

          {Object.keys(dynamicData).length > 0 && (
            <div className="card">
              <div className="card-body">
                <div className="detail-section-title">📋 Certificate Details</div>
                <div className="detail-grid-2">
                  {Object.entries(dynamicData).map(([key, value]) => (
                    <div className="detail-field" key={key}>
                      <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                      <div className="detail-value">{value.toString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <div className="detail-section-title">📄 Uploaded Documents</div>
              {documents.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '14px' }}>No documents listed.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {documents.map((doc, idx) => (
                    <li key={idx} className="upload-card uploaded" style={{ margin: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.5rem' }}>📄</span>
                          <span style={{ fontWeight: '500', fontSize: '14px' }}>{doc}</span>
                        </div>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => alert('Document preview not implemented in this demo')}>
                          Preview
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="sticky-action-panel">
          {isPendingAction ? (
            <div className="card">
              <div className="card-body">
                <div className="detail-section-title" style={{ border: 'none', marginBottom: '8px', paddingBottom: 0 }}>✅ Verification Checklist</div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                  Verify all documents and details. All items must be checked to approve.
                </p>

                <div className="verification-checklist">
                  {checklistItems.map(item => (
                    <label
                      key={item.key}
                      className={`checklist-item${checklist[item.key] ? ' checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checklist[item.key]}
                        onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-accent btn-full btn-lg"
                    disabled={!allChecked}
                    onClick={handleApprove}
                  >
                    ✓ Approve & Issue Certificate
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-full"
                    onClick={() => setShowRejectModal(true)}
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    ✕ Reject Application
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="detail-section-title" style={{ border: 'none', marginBottom: '12px', paddingBottom: 0 }}>Processing History</div>

                {app.status === 'APPROVED' || app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED' ? (
                  <>
                    <div className="alert alert-success" style={{ margin: '0 0 16px' }}>
                      <strong>Approved By:</strong> {app.approvedBy || 'Officer'}
                    </div>
                    {app.certificateNumber && (
                      <div className="certificate-viewer" style={{ padding: '20px' }}>
                        <div className="cert-seal">🏛️</div>
                        <div className="cert-title">Certificate Issued</div>
                        <div className="cert-number">{app.certificateNumber}</div>
                      </div>
                    )}
                  </>
                ) : app.status === 'REJECTED' ? (
                  <div className="alert alert-error" style={{ margin: 0 }}>
                    <div style={{ fontWeight: '700', marginBottom: '4px' }}>Application Rejected</div>
                    <div style={{ fontSize: '13px', marginBottom: '8px' }}><strong>Reason:</strong> {app.rejectionReason}</div>
                    {app.officerRemarks && <div style={{ fontSize: '13px' }}><strong>Officer Remarks:</strong> {app.officerRemarks}</div>}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
          <div className="modal animate-slide-up">
            <div className="modal-header">
              <h3 id="reject-modal-title" style={{ color: 'var(--danger)' }}>Reject Application</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowRejectModal(false)} aria-label="Close">✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                Please select a reason for rejecting this application. The citizen will be notified.
              </p>

              <div className="form-group">
                <label>Rejection Reason *</label>
                <select className="form-control" value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                  <option value="">Select reason...</option>
                  <option value="Documents Missing">Documents Missing</option>
                  <option value="Invalid Documents">Invalid Documents</option>
                  <option value="Details Mismatch">Details Mismatch</option>
                  <option value="Eligibility Criteria Not Met">Eligibility Criteria Not Met</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Officer Remarks (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Provide details to help the citizen fix the issue..."
                  value={officerRemarks}
                  onChange={e => setOfficerRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleReject}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default OfficerApplicationView;
