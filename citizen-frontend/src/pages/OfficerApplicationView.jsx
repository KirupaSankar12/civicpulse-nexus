import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { SectionCard } from '../components/SectionCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { AlertCircle, ArrowLeft, Check, X, FileText, Download, RotateCw, ZoomIn, ZoomOut, CheckCircle, XCircle } from 'lucide-react';

function OfficerApplicationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [checklist, setChecklist] = useState({
    documentsVerified: false,
    infoMatches: false,
    readyForApproval: false
  });

  const [officerRemarks, setOfficerRemarks] = useState('');
  
  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const [showApproveModal, setShowApproveModal] = useState(false);

  // Document Viewer Modal
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [docViewerUrl, setDocViewerUrl] = useState(null);
  const [docViewerName, setDocViewerName] = useState('');
  const [docZoom, setDocZoom] = useState(1);
  const [docRotation, setDocRotation] = useState(0);

  const handleDocumentPreview = (docName) => {
    // In a real implementation, we would fetch the document from an object store.
    const dummyBlob = new Blob([`Preview of document: ${docName}\n\n(In a full implementation, this would render the actual uploaded image or PDF from the secure storage bucket.)`], { type: 'text/plain' });
    const url = URL.createObjectURL(dummyBlob);
    setDocViewerUrl(url);
    setDocViewerName(docName);
    setDocZoom(1);
    setDocRotation(0);
    setShowDocViewer(true);
  };

  const closeDocViewer = () => {
    setShowDocViewer(false);
    if (docViewerUrl) {
      URL.revokeObjectURL(docViewerUrl);
      setDocViewerUrl(null);
    }
  };

  const downloadDocument = () => {
    if (!docViewerUrl) return;
    const link = document.createElement('a');
    link.href = docViewerUrl;
    link.setAttribute('download', docViewerName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
    try {
      await api.put(`/service-management-service/api/services/approve/${id}`, {
        officerRemarks: officerRemarks
      });
      alert('Application approved successfully!');
      setShowApproveModal(false);
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
        <SectionCard>
          <div className="empty-state-enhanced">
            <AlertCircle size={48} color="var(--color-warning)" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>Application Not Found</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>{error || 'The requested application could not be loaded.'}</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/services/officer/dashboard')}>
              <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back to Dashboard
            </button>
          </div>
        </SectionCard>
      </AppShell>
    );
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
      {/* 1. HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/services/officer/dashboard')} style={{ padding: '8px' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Application Details</h1>
        </div>
        <div>
          <Badge 
            variant={isPendingAction ? 'warning' : (app.status === 'REJECTED' ? 'danger' : 'success')} 
            label={app.status} 
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 2. APPLICATION SUMMARY CARD */}
        <SectionCard>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Application Number</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{app.applicationNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applicant Name</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{app.applicantName}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aadhaar Number</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>XXXX-XXXX-{app.aadhaarNumber?.slice(-4) || 'XXXX'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{app.status}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certificate Type</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applied Date</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{new Date(app.appliedDate).toLocaleDateString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{app.department || 'Municipal Corporation'}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Officer</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{app.assignedOfficer || 'Auto-Assigned'}</div>
              </div>
            </div>
          </div>
        </SectionCard>

        {isPendingAction ? (
          <>
            {/* 3. TWO COLUMN SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
              {/* LEFT CARD: Uploaded Documents */}
              <SectionCard style={{ height: '100%' }}>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--color-text-primary)' }}>Uploaded Documents</h3>
                  {documents.length === 0 ? (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No documents uploaded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {documents.map((doc, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '24px', color: 'var(--color-text-secondary)' }}><FileText size={24} /></div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{doc}</div>
                              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{doc.toLowerCase().replace(/\s+/g, '_')}.pdf</div>
                            </div>
                          </div>
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDocumentPreview(doc)} style={{ padding: '6px 12px', fontSize: '13px' }}>
                            👁 Preview
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* RIGHT CARD: Verification */}
              <SectionCard style={{ height: '100%' }}>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--color-text-primary)' }}>Verification</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: checklist.documentsVerified ? 'var(--color-success-light)' : 'var(--color-bg)', borderRadius: '8px', border: `1px solid ${checklist.documentsVerified ? 'var(--color-success)' : 'var(--color-border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-success)' }} checked={checklist.documentsVerified} onChange={(e) => setChecklist({ ...checklist, documentsVerified: e.target.checked })} />
                      <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)' }}>Documents Verified</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: checklist.infoMatches ? 'var(--color-success-light)' : 'var(--color-bg)', borderRadius: '8px', border: `1px solid ${checklist.infoMatches ? 'var(--color-success)' : 'var(--color-border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-success)' }} checked={checklist.infoMatches} onChange={(e) => setChecklist({ ...checklist, infoMatches: e.target.checked })} />
                      <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)' }}>Information Matches Application</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: checklist.readyForApproval ? 'var(--color-success-light)' : 'var(--color-bg)', borderRadius: '8px', border: `1px solid ${checklist.readyForApproval ? 'var(--color-success)' : 'var(--color-border)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="checkbox" style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--color-success)' }} checked={checklist.readyForApproval} onChange={(e) => setChecklist({ ...checklist, readyForApproval: e.target.checked })} />
                      <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)' }}>Ready for Approval</span>
                    </label>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* 4. BOTTOM SECTION */}
            <SectionCard>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                  
                  {/* LEFT SIDE: Remarks */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Officer Remarks (Optional)</h3>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <textarea
                        style={{ width: '100%', height: '100%', minHeight: '120px', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', resize: 'vertical' }}
                        placeholder="Enter remarks (optional)..."
                        value={officerRemarks}
                        maxLength={500}
                        onChange={e => setOfficerRemarks(e.target.value)}
                      />
                      <div style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {officerRemarks.length} / 500
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: Actions */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-primary)' }}>Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', justifyContent: 'flex-start' }}>
                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--color-danger)', border: '2px solid var(--color-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s' }}
                      >
                        <X size={20} /> Reject
                      </button>
                      <button
                        type="button"
                        disabled={!allChecked}
                        onClick={() => setShowApproveModal(true)}
                        style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', borderRadius: '8px', backgroundColor: allChecked ? 'var(--color-success)' : 'var(--color-border)', color: 'white', border: 'none', cursor: allChecked ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s' }}
                      >
                        <Check size={20} /> Approve & Digitally Sign
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </>
        ) : (
          <SectionCard>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--color-text-primary)' }}>Processing History</h3>
              {app.status === 'APPROVED' || app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED' ? (
                <>
                  <div style={{ backgroundColor: 'var(--color-success-light)', borderLeft: '4px solid var(--color-success)', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
                    <div style={{ color: 'var(--color-success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} /> Approved By: {app.approvedBy || 'Officer'}
                    </div>
                  </div>
                  {app.officerRemarks && (
                    <div style={{ backgroundColor: 'var(--color-info-light)', borderLeft: '4px solid var(--color-info)', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
                      <div style={{ color: 'var(--color-info)', fontWeight: '600' }}>Officer Remarks:</div>
                      <div style={{ color: 'var(--color-info)', marginTop: '4px' }}>{app.officerRemarks}</div>
                    </div>
                  )}
                  {app.certificateNumber && (
                    <div style={{ padding: '24px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                      <FileText size={32} color="var(--color-text-secondary)" style={{ marginBottom: '8px' }} />
                      <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Certificate Issued</div>
                      <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontWeight: '600' }}>{app.certificateNumber}</div>
                    </div>
                  )}
                </>
              ) : app.status === 'REJECTED' ? (
                <div style={{ backgroundColor: 'var(--color-danger-light)', borderLeft: '4px solid var(--color-danger)', padding: '16px', borderRadius: '4px' }}>
                  <div style={{ color: 'var(--color-danger)', fontWeight: '700', fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={18} /> Application Rejected
                  </div>
                  <div style={{ color: 'var(--color-danger)', marginBottom: '4px' }}><strong>Reason:</strong> {app.rejectionReason}</div>
                  {app.officerRemarks && <div style={{ color: 'var(--color-danger)' }}><strong>Remarks:</strong> {app.officerRemarks}</div>}
                </div>
              ) : null}
            </div>
          </SectionCard>
        )}
      </div>

      {/* 6. APPROVE BUTTON MODAL */}
      {showApproveModal && (
        <div className="modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>Approve Certificate</h3>
            <div style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}>This action will:</div>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#16a34a' }}>•</span> Approve the application</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#16a34a' }}>•</span> Generate the certificate</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#16a34a' }}>•</span> Apply your digital signature</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#16a34a' }}>•</span> Notify the citizen</li>
              </ul>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setShowApproveModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleApprove} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#16a34a', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                Approve & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. REJECT BUTTON MODAL */}
      {showRejectModal && (
        <div className="modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '450px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626', margin: 0 }}>Reject Application</h3>
              <button type="button" onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Reject Reason</label>
              <select 
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
                value={rejectReason} 
                onChange={e => setRejectReason(e.target.value)}
              >
                <option value="">Select reason...</option>
                <option value="Missing Document">Missing Document</option>
                <option value="Information Mismatch">Information Mismatch</option>
                <option value="Invalid Document">Invalid Document</option>
                <option value="Unreadable Document">Unreadable Document</option>
                <option value="Duplicate Application">Duplicate Application</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Remarks</label>
              <textarea
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', minHeight: '80px', resize: 'vertical' }}
                placeholder="Provide details to help the citizen fix the issue..."
                value={officerRemarks}
                onChange={e => setOfficerRemarks(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setShowRejectModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'white', border: '1px solid #d1d5db', color: '#374151', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleReject} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: '#dc2626', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocViewer && (
        <div className="modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.7)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: 'var(--color-bg)', width: '90%', height: '85vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{docViewerName}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setDocZoom(z => z + 0.25)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ZoomIn size={16} /> Zoom In</button>
                <button type="button" onClick={() => setDocZoom(z => Math.max(0.5, z - 0.25))} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ZoomOut size={16} /> Zoom Out</button>
                <button type="button" onClick={() => setDocRotation(r => r + 90)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><RotateCw size={16} /> Rotate</button>
                <button type="button" onClick={downloadDocument} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Download size={16} /> Download</button>
                <button type="button" onClick={closeDocViewer} className="btn btn-ghost" style={{ padding: '6px', marginLeft: '12px' }}><X size={20} /></button>
              </div>
            </div>
            <div style={{ flex: 1, padding: '40px', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ 
                backgroundColor: 'white', padding: '40px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                minWidth: '60%', minHeight: '60%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${docZoom}) rotate(${docRotation}deg)`, transition: 'transform 0.2s ease-out'
              }}>
                {docViewerUrl && <iframe src={docViewerUrl} style={{ border: 'none', width: '100%', height: '400px' }} title="Document Preview" />}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default OfficerApplicationView;
