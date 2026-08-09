import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ReportPageHeader, KpiCard, SectionCard, GLOBAL_STYLES } from '../components/ReportShared.jsx';
import { toast } from 'sonner';
import {
  AlertCircle, ArrowLeft, Check, X, FileText, Download, RotateCw, ZoomIn, ZoomOut,
  CheckCircle2, XCircle, ShieldCheck, Eye, Clock, User, Building2, Calendar, Hash, FileCheck, Layers
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const STATUS_MAP = {
  SUBMITTED:             { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', darkBg: 'rgba(37,99,235,0.15)', darkText: '#60a5fa', darkBorder: 'rgba(59,130,246,0.3)' },
  RESUBMITTED:           { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', darkBg: 'rgba(37,99,235,0.15)', darkText: '#60a5fa', darkBorder: 'rgba(59,130,246,0.3)' },
  UNDER_VERIFICATION:    { bg: '#fef3c7', text: '#d97706', border: '#fde68a', darkBg: 'rgba(217,119,6,0.15)', darkText: '#fbbf24', darkBorder: 'rgba(245,158,11,0.3)' },
  VERIFIED:              { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', darkBg: 'rgba(22,163,74,0.15)', darkText: '#4ade80', darkBorder: 'rgba(34,197,94,0.3)' },
  APPROVED:              { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', darkBg: 'rgba(22,163,74,0.15)', darkText: '#4ade80', darkBorder: 'rgba(34,197,94,0.3)' },
  CERTIFICATE_GENERATED: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', darkBg: 'rgba(16,185,129,0.15)', darkText: '#34d399', darkBorder: 'rgba(16,185,129,0.3)' },
  DOWNLOADED:            { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', darkBg: 'rgba(124,58,237,0.15)', darkText: '#a78bfa', darkBorder: 'rgba(139,92,246,0.3)' },
  REJECTED:              { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', darkBg: 'rgba(220,38,38,0.15)', darkText: '#f87171', darkBorder: 'rgba(239,68,68,0.3)' },
};

function StatusBadge({ status, isDark }) {
  const m = STATUS_MAP[status] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', darkBg: '#334155', darkText: '#94a3b8', darkBorder: '#475569' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 20,
      background: isDark ? m.darkBg : m.bg,
      color: isDark ? m.darkText : m.text,
      border: `1px solid ${isDark ? m.darkBorder : m.border}`,
      fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: isDark ? m.darkText : m.text }} />
      {status?.replace(/_/g, ' ') || '—'}
    </span>
  );
}

function OfficerApplicationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

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

  const handleDocumentPreview = (docObj) => {
    const isObject = typeof docObj === 'object' && docObj !== null;
    const docName = isObject ? docObj.id : docObj;
    
    if (isObject && docObj.data) {
      try {
        const arr = docObj.data.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], {type: mime});
        const url = URL.createObjectURL(blob);
        setDocViewerUrl(url);
        setDocViewerName(docObj.name || docName);
        setDocZoom(1);
        setDocRotation(0);
        setShowDocViewer(true);
        return;
      } catch (e) {
        console.error("Error creating blob from data URL", e);
      }
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${docName}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; background: #0f172a; color: #f8fafc; text-align: center; }
            .doc { background: #1e293b; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
          </style>
        </head>
        <body>
          <div class="doc">
            <h2 style="color:#38bdf8;">${docName}</h2>
            <p style="color: #94a3b8;">Document Preview Verified</p>
          </div>
        </body>
      </html>
    `;
    const dummyBlob = new Blob([htmlContent], { type: 'text/html' });
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
      toast.success('Application approved successfully!');
      setShowApproveModal(false);
      navigate('/services/officer/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      toast.error('Please select a rejection reason.');
      return;
    }
    try {
      await api.put(`/service-management-service/api/services/reject/${id}`, {
        reason: rejectReason,
        officerRemarks: officerRemarks
      });
      toast.error('Application rejected.');
      setShowRejectModal(false);
      navigate('/services/officer/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to reject application');
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Application Verification">
        <PageLoader message="Loading application details..." />
      </AppShell>
    );
  }

  if (error || !app) {
    return (
      <AppShell title="Application Verification">
        <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', background: isDark ? '#1e293b' : '#fff', padding: 40, borderRadius: 20, border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 20, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 8 }}>Application Not Found</h3>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>{error || 'The requested application could not be loaded.'}</p>
          <button
            onClick={() => navigate('/services/officer/dashboard')}
            style={{
              padding: '10px 20px', borderRadius: 10, background: '#3b82f6', color: '#fff',
              border: 'none', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
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
    <AppShell title="Application Verification">
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '12px 0 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── Top Header Navigation ────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <button
            onClick={() => navigate('/services/officer/dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10,
              background: isDark ? '#1e293b' : '#fff', color: isDark ? '#f1f5f9' : '#0f172a',
              border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Application Status:</span>
            <StatusBadge status={app.status} isDark={isDark} />
          </div>
        </div>

        {/* ── Header Summary Card ──────────────────────────────────────────── */}
        <SectionCard
          title={`Application #${app.applicationNumber}`}
          subtitle={`Applicant: ${app.applicantName} · ${app.serviceType?.replace(/_/g, ' ')}`}
          icon={FileCheck}
          isDark={isDark}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginTop: 4 }}>
            <div style={{ background: isDark ? '#0f172a' : '#f8fafc', padding: '14px 18px', borderRadius: 12, border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Applicant Name</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginTop: 4 }}>{app.applicantName}</div>
            </div>

            <div style={{ background: isDark ? '#0f172a' : '#f8fafc', padding: '14px 18px', borderRadius: 12, border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aadhaar Number</div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'monospace', color: '#3b82f6', marginTop: 4 }}>XXXX-XXXX-{app.aadhaarNumber?.slice(-4) || 'XXXX'}</div>
            </div>

            <div style={{ background: isDark ? '#0f172a' : '#f8fafc', padding: '14px 18px', borderRadius: 12, border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Certificate Type</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginTop: 4 }}>{app.serviceType?.replace(/_/g, ' ')}</div>
            </div>

            <div style={{ background: isDark ? '#0f172a' : '#f8fafc', padding: '14px 18px', borderRadius: 12, border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Applied Date</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginTop: 4 }}>{new Date(app.appliedDate).toLocaleDateString('en-IN')}</div>
            </div>

            <div style={{ background: isDark ? '#0f172a' : '#f8fafc', padding: '14px 18px', borderRadius: 12, border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Department</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginTop: 4 }}>{app.department || 'Municipal Corporation'}</div>
            </div>

            <div style={{ background: isDark ? '#0f172a' : '#f8fafc', padding: '14px 18px', borderRadius: 12, border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assigned Officer</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginTop: 4 }}>{app.assignedOfficer || 'Auto-Assigned'}</div>
            </div>
          </div>
        </SectionCard>

        {isPendingAction ? (
          <>
            {/* ── Two Column Verification Layout ─────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              
              {/* LEFT: Uploaded Documents */}
              <SectionCard title="Uploaded Documents" subtitle="Review attached applicant credentials" icon={FileText} isDark={isDark}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {documents.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No documents uploaded.</div>
                  ) : (
                    documents.map((doc, idx) => {
                      const isObject = typeof doc === 'object' && doc !== null;
                      const docId = isObject ? doc.id : doc;
                      const docName = isObject ? doc.name : `${doc.toLowerCase().replace(/\s+/g, '_')}.pdf`;
                      
                      return (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 18px', borderRadius: 12,
                          background: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                          transition: 'border-color 0.15s'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: isDark ? '#334155' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={20} color="#3b82f6" />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>{docId}</div>
                              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{docName}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDocumentPreview(doc)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                              background: isDark ? '#334155' : '#fff', color: isDark ? '#38bdf8' : '#0284c7',
                              border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`, fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Eye size={14} /> Preview
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </SectionCard>

              {/* RIGHT: Verification Checklist */}
              <SectionCard title="Verification Checklist" subtitle="Complete all 3 checks to enable digital sign" icon={ShieldCheck} isDark={isDark}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 12,
                    background: checklist.documentsVerified ? (isDark ? 'rgba(16,185,129,0.12)' : '#f0fdf4') : (isDark ? '#0f172a' : '#f8fafc'),
                    border: `1.5px solid ${checklist.documentsVerified ? '#10b981' : (isDark ? '#334155' : '#e2e8f0')}`,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={checklist.documentsVerified} 
                      onChange={e => setChecklist({ ...checklist, documentsVerified: e.target.checked })} 
                      style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>1. Documents Verified</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>All mandatory identity and proof documents inspected</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 12,
                    background: checklist.infoMatches ? (isDark ? 'rgba(16,185,129,0.12)' : '#f0fdf4') : (isDark ? '#0f172a' : '#f8fafc'),
                    border: `1.5px solid ${checklist.infoMatches ? '#10b981' : (isDark ? '#334155' : '#e2e8f0')}`,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={checklist.infoMatches} 
                      onChange={e => setChecklist({ ...checklist, infoMatches: e.target.checked })} 
                      style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>2. Information Matches Application</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Data matches official municipal database records</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 12,
                    background: checklist.readyForApproval ? (isDark ? 'rgba(16,185,129,0.12)' : '#f0fdf4') : (isDark ? '#0f172a' : '#f8fafc'),
                    border: `1.5px solid ${checklist.readyForApproval ? '#10b981' : (isDark ? '#334155' : '#e2e8f0')}`,
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={checklist.readyForApproval} 
                      onChange={e => setChecklist({ ...checklist, readyForApproval: e.target.checked })} 
                      style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>3. Ready for Approval</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Final clearance confirmed for certificate generation</div>
                    </div>
                  </label>

                </div>
              </SectionCard>
            </div>

            {/* ── Officer Remarks & Actions Section ─────────────────────────────── */}
            <SectionCard title="Officer Remarks & Decision" subtitle="Enter final evaluation and sign or reject application" icon={FileCheck} isDark={isDark}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 8 }}>
                    Officer Remarks (Optional)
                  </div>
                  <textarea
                    placeholder="Enter verification notes or observations..."
                    value={officerRemarks}
                    maxLength={500}
                    onChange={e => setOfficerRemarks(e.target.value)}
                    style={{
                      width: '100%', minHeight: 110, padding: 14, borderRadius: 12,
                      border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                      background: isDark ? '#0f172a' : '#fff', color: isDark ? '#f1f5f9' : '#0f172a',
                      fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 4, fontWeight: 600 }}>
                    {officerRemarks.length} / 500
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 12 }}>
                    Administrative Action
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      style={{
                        padding: '14px 20px', borderRadius: 12,
                        background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                        color: '#ef4444', border: `1.5px solid ${isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'}`,
                        fontSize: 14, fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'background 0.15s'
                      }}
                    >
                      <X size={18} /> Reject Application
                    </button>

                    <button
                      type="button"
                      disabled={!allChecked}
                      onClick={() => setShowApproveModal(true)}
                      style={{
                        padding: '14px 20px', borderRadius: 12,
                        background: allChecked ? 'linear-gradient(135deg, #10b981, #059669)' : (isDark ? '#334155' : '#e2e8f0'),
                        color: allChecked ? '#fff' : (isDark ? '#64748b' : '#94a3b8'),
                        border: 'none', fontSize: 14, fontWeight: 800,
                        cursor: allChecked ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: allChecked ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Check size={18} /> Approve & Digitally Sign
                    </button>
                  </div>
                  {!allChecked && (
                    <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8, fontWeight: 600, textAlign: 'center' }}>
                      ⚠️ Complete all 3 verification checklist items above to enable approval.
                    </div>
                  )}
                </div>

              </div>
            </SectionCard>
          </>
        ) : (
          <SectionCard title="Processing History" subtitle="Final audit result" icon={CheckCircle2} isDark={isDark}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(app.status) ? (
                <>
                  <div style={{ padding: '16px 20px', borderRadius: 12, background: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4', border: '1px solid #bbf7d0', color: isDark ? '#4ade80' : '#15803d', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 14 }}>
                    <CheckCircle2 size={20} color="#10b981" /> Approved By: {app.approvedBy || 'Officer'}
                  </div>
                  {app.officerRemarks && (
                    <div style={{ padding: '16px 20px', borderRadius: 12, background: isDark ? '#0f172a' : '#eff6ff', border: `1px solid ${isDark ? '#334155' : '#bfdbfe'}`, fontSize: 14, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Officer Remarks:</div>
                      <div>{app.officerRemarks}</div>
                    </div>
                  )}
                  {app.certificateNumber && (
                    <div style={{ padding: 28, borderRadius: 16, background: isDark ? '#0f172a' : '#f8fafc', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, textAlign: 'center' }}>
                      <FileText size={36} color="#3b82f6" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: 700, fontSize: 15, color: isDark ? '#f1f5f9' : '#0f172a' }}>Certificate Issued</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: '#3b82f6', marginTop: 4 }}>{app.certificateNumber}</div>
                    </div>
                  )}
                </>
              ) : app.status === 'REJECTED' ? (
                <div style={{ padding: '18px 22px', borderRadius: 12, background: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', border: '1px solid #fecaca', color: isDark ? '#f87171' : '#dc2626', fontSize: 14 }}>
                  <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, marginBottom: 6 }}>
                    <XCircle size={20} color="#ef4444" /> Application Rejected
                  </div>
                  <div><strong>Reason:</strong> {app.rejectionReason}</div>
                  {app.officerRemarks && <div style={{ marginTop: 4 }}><strong>Remarks:</strong> {app.officerRemarks}</div>}
                </div>
              ) : null}
            </div>
          </SectionCard>
        )}
      </div>

      {/* ── Approve Dialog Modal ────────────────────────────────────────── */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Certificate Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>This action will perform the following steps:</p>
              <ul className="list-disc pl-5 space-y-1 text-foreground">
                <li>Approve the application in Municipal Registry</li>
                <li>Generate official PDF certificate</li>
                <li>Apply digital seal & verification signature</li>
                <li>Notify citizen via portal & SMS</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Approve & Sign
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog Modal ─────────────────────────────────────────── */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Reject Reason *</label>
              <Select value={rejectReason} onValueChange={val => setRejectReason(val)}>
                <SelectTrigger><SelectValue placeholder="Select reason..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Missing Document">Missing Document</SelectItem>
                  <SelectItem value="Information Mismatch">Information Mismatch</SelectItem>
                  <SelectItem value="Invalid Document">Invalid Document</SelectItem>
                  <SelectItem value="Unreadable Document">Unreadable Document</SelectItem>
                  <SelectItem value="Duplicate Application">Duplicate Application</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Remarks</label>
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[80px]"
                placeholder="Provide details to help the citizen fix the issue..."
                value={officerRemarks}
                onChange={e => setOfficerRemarks(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                Reject Application
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Document Viewer Modal ───────────────────────────────────────── */}
      <Dialog open={showDocViewer} onOpenChange={closeDocViewer}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b bg-background">
            <h3 className="font-semibold text-base">{docViewerName}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setDocZoom(z => z + 0.25)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}><ZoomIn size={16} /></button>
              <button onClick={() => setDocZoom(z => Math.max(0.5, z - 0.25))} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}><ZoomOut size={16} /></button>
              <button onClick={() => setDocRotation(r => r + 90)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}><RotateCw size={16} /></button>
              <button onClick={downloadDocument} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Download size={15} /> Download</button>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-auto bg-muted/20 flex items-center justify-center">
            <div className="bg-background p-6 rounded shadow-lg min-w-[60%] min-h-[60%] flex items-center justify-center transition-transform" style={{ transform: `scale(${docZoom}) rotate(${docRotation}deg)` }}>
              {docViewerUrl && <iframe src={docViewerUrl} className="w-full h-[450px] border-none" title="Document Preview" />}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        ${GLOBAL_STYLES}
      `}</style>
    </AppShell>
  );
}

export default OfficerApplicationView;
