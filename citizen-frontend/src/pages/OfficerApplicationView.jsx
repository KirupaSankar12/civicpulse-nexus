import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';

function OfficerApplicationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Checklist state
  const [checklist, setChecklist] = useState({
    identityVerified: false,
    addressVerified: false,
    documentsAuthentic: false,
    noPendingDues: false
  });

  const [rejectReason, setRejectReason] = useState("");
  const [officerRemarks, setOfficerRemarks] = useState("");
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
    if (!confirm("Are you sure you want to approve this application and issue the certificate?")) return;
    try {
      await api.put(`/service-management-service/api/services/approve/${id}`);
      alert("Application approved successfully!");
      navigate('/services/approvals');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("Please select a rejection reason.");
      return;
    }
    try {
      await api.put(`/service-management-service/api/services/reject/${id}`, {
        reason: rejectReason,
        officerRemarks: officerRemarks
      });
      alert("Application rejected.");
      setShowRejectModal(false);
      navigate('/services/approvals');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to reject application');
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Application Details">
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <div className="spinner-sm" style={{ width: '32px', height: '32px', margin: '0 auto', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          <p style={{ marginTop: '12px', color: '#6b7280' }}>Loading details...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !app) {
    return (
      <AppShell title="Application Details">
        <div className="alert alert-error"><span>⚠️</span> {error || "Application not found"}</div>
      </AppShell>
    );
  }

  let dynamicData = {};
  if (app.dynamicData) {
    try {
      dynamicData = JSON.parse(app.dynamicData);
    } catch (e) {
      console.error("Failed to parse dynamic data", e);
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

  return (
    <AppShell title="Application Details">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/services/approvals')} style={{ marginBottom: '1rem' }}>
          ← Back to Dashboard
        </button>
        <h1 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Application Details
          <span className={`badge badge-${isPendingAction ? 'yellow' : app.status === 'REJECTED' ? 'red' : 'green'}`} style={{ fontSize: '14px' }}>
            {app.status}
          </span>
        </h1>
        <p className="text-muted">Application No: {app.applicationNumber}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Data & Documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Applicant Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Service Type</label>
                <div style={{ fontWeight: '500' }}>{app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Applicant Name</label>
                <div style={{ fontWeight: '500' }}>{app.applicantName}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Aadhaar Number</label>
                <div style={{ fontWeight: '500' }}>XXXX-XXXX-{app.aadhaarNumber?.slice(-4)}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Applied Date</label>
                <div style={{ fontWeight: '500' }}>{new Date(app.appliedDate).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {Object.keys(dynamicData).length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Application Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {Object.entries(dynamicData).map(([key, value]) => (
                  <div key={key}>
                    <label style={{ fontSize: '0.875rem', color: '#6b7280', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div style={{ fontWeight: '500' }}>{value.toString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Submitted Documents</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.map((doc, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    <span style={{ fontWeight: '500' }}>{doc}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => alert("Document preview not implemented in this demo")}>View</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div>
          {isPendingAction ? (
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Verification Checklist</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Please verify all documents and details. You must check all boxes to approve the application.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={checklist.identityVerified} onChange={(e) => setChecklist({...checklist, identityVerified: e.target.checked})} style={{ marginTop: '4px' }} />
                  <span style={{ fontSize: '0.95rem' }}>Applicant identity matches Aadhaar and records.</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={checklist.addressVerified} onChange={(e) => setChecklist({...checklist, addressVerified: e.target.checked})} style={{ marginTop: '4px' }} />
                  <span style={{ fontSize: '0.95rem' }}>Address proof is valid and matches applicant details.</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={checklist.documentsAuthentic} onChange={(e) => setChecklist({...checklist, documentsAuthentic: e.target.checked})} style={{ marginTop: '4px' }} />
                  <span style={{ fontSize: '0.95rem' }}>All submitted documents appear authentic and un-tampered.</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={checklist.noPendingDues} onChange={(e) => setChecklist({...checklist, noPendingDues: e.target.checked})} style={{ marginTop: '4px' }} />
                  <span style={{ fontSize: '0.95rem' }}>No pending municipal dues or legal blocks found.</span>
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button 
                  className={`btn btn-primary ${!allChecked ? 'disabled' : ''}`} 
                  disabled={!allChecked}
                  onClick={handleApprove}
                  style={{ width: '100%', padding: '12px', fontWeight: 'bold', fontSize: '1rem', background: allChecked ? '#10b981' : '#d1d5db', border: 'none', color: allChecked ? '#fff' : '#9ca3af' }}
                >
                  ✓ Approve & Issue Certificate
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowRejectModal(true)}
                  style={{ width: '100%', padding: '12px', fontWeight: 'bold', color: '#ef4444', borderColor: '#ef4444' }}
                >
                  ✕ Reject Application
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Processing History</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {app.status === 'APPROVED' || app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED' ? (
                  <>
                    <div className="alert alert-success" style={{ margin: 0 }}>
                      <strong>Approved By:</strong> {app.approvedBy || 'Officer'}
                    </div>
                    {app.certificateNumber && (
                      <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Certificate No</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{app.certificateNumber}</div>
                      </div>
                    )}
                  </>
                ) : app.status === 'REJECTED' ? (
                  <div className="alert alert-error" style={{ margin: 0 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Rejected</div>
                    <div style={{ fontSize: '0.875rem', marginBottom: '8px' }}><strong>Reason:</strong> {app.rejectionReason}</div>
                    {app.officerRemarks && <div style={{ fontSize: '0.875rem' }}><strong>Remarks:</strong> {app.officerRemarks}</div>}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: '#fff' }}>
            <h2 style={{ color: '#ef4444', marginTop: 0 }}>Reject Application</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Please select a reason for rejecting this application.</p>
            
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

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Additional Remarks (Optional)</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Provide details to help the citizen fix the issue..."
                value={officerRemarks}
                onChange={e => setOfficerRemarks(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReject} style={{ background: '#ef4444', borderColor: '#ef4444' }}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default OfficerApplicationView;
