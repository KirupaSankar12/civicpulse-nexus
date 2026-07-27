import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Download, AlertTriangle, AlertCircle, FileText, 
  CheckCircle2, Upload, Search, FileSignature, Clock,
  ChevronDown, ChevronUp, Building2, User, Activity, ShieldCheck
} from 'lucide-react';

function getBadgeVariant(status) {
  if (["CERTIFICATE_GENERATED", "DOWNLOADED", "APPROVED"].includes(status)) return "default";
  if (["REJECTED"].includes(status)) return "destructive";
  if (["SUBMITTED", "UNDER_VERIFICATION", "VERIFIED", "RESUBMITTED"].includes(status)) return "secondary";
  return "outline";
}

function statusInfo(status) {
  switch (status) {
    case 'SUBMITTED': return 'Submitted';
    case 'UNDER_VERIFICATION': return 'Under Verification';
    case 'VERIFIED': return 'Verified';
    case 'APPROVED': return 'Approved';
    case 'CERTIFICATE_GENERATED': return 'Generated';
    case 'DOWNLOADED': return 'Downloaded';
    case 'REJECTED': return 'Rejected';
    case 'RESUBMITTED': return 'Resubmitted';
    default: return status;
  }
}

function formatServiceType(type) {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 172800) return 'Yesterday';
  
  const days = Math.floor(diffInSeconds / 86400);
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupApplicationsByDate(applications) {
  const groups = {
    'Today': [],
    'Yesterday': [],
    'Earlier This Week': [],
    'Earlier This Month': [],
    'Older': []
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  applications.forEach(app => {
    const appDate = new Date(app.appliedDate);
    appDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(now - appDate);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 0) {
      groups['Today'].push(app);
    } else if (diffDays === 1) {
      groups['Yesterday'].push(app);
    } else if (diffDays <= 7) {
      groups['Earlier This Week'].push(app);
    } else if (diffDays <= 30) {
      groups['Earlier This Month'].push(app);
    } else {
      groups['Older'].push(app);
    }
  });

  return Object.entries(groups).filter(([_, apps]) => apps.length > 0);
}

// Status colour config
const STATUS_STYLE = {
  SUBMITTED:         { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'Submitted' },
  RESUBMITTED:       { bg: '#fefce8', text: '#854d0e', border: '#fde68a', label: 'Resubmitted' },
  UNDER_VERIFICATION:{ bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', label: 'Under Verification' },
  VERIFIED:          { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Verified' },
  APPROVED:          { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Approved' },
  CERTIFICATE_GENERATED: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Generated' },
  DOWNLOADED:        { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', label: 'Downloaded' },
  REJECTED:          { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: 'Rejected' },
};

function StatusChip({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.01em', whiteSpace: 'nowrap'
    }}>
      {s.label}
    </span>
  );
}

function InlineTimeline({ status }) {
  const steps = [
    { key: 'SUBMITTED',          label: 'Submitted',   active: ['SUBMITTED','UNDER_VERIFICATION','VERIFIED','APPROVED','CERTIFICATE_GENERATED','DOWNLOADED','RESUBMITTED','REJECTED'] },
    { key: 'UNDER_VERIFICATION', label: 'Verification', active: ['UNDER_VERIFICATION','VERIFIED','APPROVED','CERTIFICATE_GENERATED','DOWNLOADED'] },
    { key: 'APPROVED',           label: 'Approved',    active: ['APPROVED','CERTIFICATE_GENERATED','DOWNLOADED'], error: ['REJECTED'] },
    { key: 'CERTIFICATE_GENERATED', label: 'Generated', active: ['CERTIFICATE_GENERATED','DOWNLOADED'] },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', padding: '0 8px' }}>
      {/* Connector line */}
      <div style={{
        position: 'absolute', top: 12, left: '12.5%', right: '12.5%',
        height: 2, background: '#e2e8f0', zIndex: 0
      }} />
      {steps.map((step, i) => {
        const isActive = step.active.includes(status);
        const isError  = step.error?.includes(status);
        const dotColor = isError ? '#ef4444' : isActive ? '#3b82f6' : '#e2e8f0';
        const labelColor = isError ? '#dc2626' : isActive ? '#1e40af' : '#94a3b8';
        const labelWeight = (isActive || isError) ? 700 : 500;
        return (
          <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {/* Segment fill line between prev and current dot */}
            {i > 0 && step.active.includes(status) && steps[i-1].active.includes(status) && (
              <div style={{
                position: 'absolute', top: 11, right: '50%', width: '100%',
                height: 2, background: isError ? '#fca5a5' : '#93c5fd', zIndex: 0
              }} />
            )}
            {/* Dot */}
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: dotColor, border: `2px solid ${dotColor === '#e2e8f0' ? '#cbd5e1' : dotColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 6, flexShrink: 0, boxShadow: isActive || isError ? `0 0 0 3px ${dotColor}22` : 'none'
            }}>
              {isError ? <AlertTriangle size={11} color="#fff" strokeWidth={3} /> :
               isActive ? <CheckCircle2 size={11} color="#fff" strokeWidth={3} /> : null}
            </div>
            {/* Label */}
            <span style={{ fontSize: 11, fontWeight: labelWeight, color: labelColor, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const FILTER_OPTIONS = [
  { label: 'All', value: 'ALL' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Verification', value: 'UNDER_VERIFICATION' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Generated', value: 'CERTIFICATE_GENERATED' },
  { label: 'Rejected', value: 'REJECTED' }
];

function ServiceTracker() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resubmitFile, setResubmitFile] = useState({});
  const [dragOverId, setDragOverId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedAppId, setExpandedAppId] = useState(null);

  const fetchApplications = () => {
    const citizenId = keycloak.tokenParsed?.sub;
    api.get(`/service-management-service/api/services/citizen/${citizenId}`)
      .then(r => {
        const sortedApps = r.data.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));
        setApplications(sortedApps);
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
      toast.success('Certificate PDF downloaded successfully!');
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error('Failed to download certificate PDF.');
    }
  };

  const handleResubmit = async (id, app) => {
    const file = resubmitFile[id];
    if (!file) {
      toast.error('No file selected. Please select a file to re-upload.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
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

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const newDoc = {
        id: `Corrected Document`,
        name: file.name,
        type: file.type,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        data: dataUrl
      };
      existingDocs.push(newDoc);

      await api.put(`/service-management-service/api/services/resubmit/${id}`, {
        citizenId: app.citizenId,
        applicantName: app.applicantName,
        aadhaarNumber: app.aadhaarNumber,
        serviceType: app.serviceType,
        documentsSubmitted: JSON.stringify(existingDocs),
        dynamicData: app.dynamicData ? JSON.parse(app.dynamicData) : {}
      });
      toast.success('Application Resubmitted Successfully. Your corrected documents have been sent to the assigned officer.');
      setResubmitFile({ ...resubmitFile, [id]: null });
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to resubmit application.');
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatServiceType(app.serviceType).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.certificateNumber && app.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter || (statusFilter === 'CERTIFICATE_GENERATED' && app.status === 'DOWNLOADED');
      
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const groupedApps = useMemo(() => groupApplicationsByDate(filteredApps), [filteredApps]);

  const toggleExpand = (id) => {
    setExpandedAppId(prev => prev === id ? null : id);
  };

  return (
    <AppShell title="Track Applications">
      <div style={{ paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── Page Header (Overview-style) ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #334155)',
          borderRadius: 16, padding: '24px 32px', color: '#fff',
          display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 10px 25px rgba(15,23,42,0.3)',
          marginBottom: 0, position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: '#fff', opacity: 0.03, borderRadius: '50%', filter: 'blur(30px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              background: 'rgba(255,255,255,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)',
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block', marginBottom: 10
            }}>
              CIVIC SERVICES
            </span>
            <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Track Applications
            </h2>
            <p style={{ margin: 0, color: '#cbd5e1', maxWidth: 540, fontSize: 14, lineHeight: 1.5 }}>
              Monitor real-time progress, review verification logs, upload documents, and download digitally signed certificates.
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/services/apply" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#ffffff', color: '#0f172a', border: 'none', padding: '10px 22px',
                borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                + Apply New Certificate
              </button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900 flex items-center gap-2 text-sm">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Search and Filter Bar */}
        <div style={{
          background: '#ffffff', borderRadius: 14, padding: '16px 20px',
          border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
              <input 
                type="text" 
                placeholder="Search application number, service, or certificate..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 42px', borderRadius: 10,
                  border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTER_OPTIONS.map(opt => (
              <Button 
                key={opt.value}
                variant={statusFilter === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-xl text-xs font-semibold px-4 h-9 ${statusFilter === opt.value ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading && <PageLoader message="Loading your timeline..." />}

        {!isLoading && filteredApps.length === 0 && (
          <Card className="text-center py-12">
            <CardContent className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                <FileSignature size={32} />
              </div>
              <h3 className="text-lg font-semibold">No Applications Found</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {searchQuery || statusFilter !== 'ALL' 
                  ? "Try adjusting your search or filters to find what you're looking for." 
                  : "You haven't submitted any certificate applications yet. Start by applying for a new certificate."}
              </p>
              {(!searchQuery && statusFilter === 'ALL') && (
                <Button asChild>
                  <Link to="/services/apply">Apply Certificate</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!isLoading && groupedApps.map(([groupName, apps]) => (
          <div key={groupName} style={{ marginBottom: 32 }}>
            {/* Group Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                {groupName}
              </span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {apps.map(app => {
                const isExpanded = expandedAppId === app.id;
                const canDownload = app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED';
                const isRejected  = app.status === 'REJECTED';

                return (
                  <div
                    key={app.id}
                    style={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 16,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                      transition: 'box-shadow 0.2s ease'
                    }}
                  >
                    {/* ── Card Top: clickable summary row ── */}
                    <div
                      style={{ padding: '20px 24px', cursor: 'pointer' }}
                      onClick={() => toggleExpand(app.id)}
                    >
                      {/* Row 1: Icon + Title/Badge  |  App#/Time + Action */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                        {/* Left: icon + info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                            background: '#eff6ff', border: '1px solid #bfdbfe',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <FileSignature size={20} color="#2563eb" />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                                {formatServiceType(app.serviceType)}
                              </h3>
                              <StatusChip status={app.status} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                              <span style={{
                                fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                                color: '#475569', background: '#f1f5f9',
                                padding: '2px 8px', borderRadius: 6, border: '1px solid #e2e8f0'
                              }}>{app.applicationNumber}</span>
                              <span style={{ color: '#cbd5e1', fontSize: 12 }}>•</span>
                              <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} color="#94a3b8" /> {getRelativeTime(app.appliedDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: View Details button */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                          fontSize: 12, fontWeight: 700, color: '#3b82f6',
                          background: '#eff6ff', padding: '7px 14px', borderRadius: 10,
                          border: '1px solid #bfdbfe', cursor: 'pointer', whiteSpace: 'nowrap'
                        }}>
                          {isExpanded ? 'Hide Details' : 'View Details'}
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>

                      {/* Row 2: Progress timeline */}
                      <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                        <InlineTimeline status={app.status} />
                      </div>

                      {/* Row 3: Applicant + Dept meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                          <User size={13} color="#94a3b8" />
                          Applicant:
                          <strong style={{ color: '#334155', fontWeight: 600 }}>{app.applicantName}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
                          <Building2 size={13} color="#94a3b8" />
                          Dept:
                          <strong style={{ color: '#334155', fontWeight: 600 }}>Revenue Dept.</strong>
                        </span>
                      </div>
                    </div>

                    {/* ── Expanded Panel ── */}
                    {isExpanded && (
                      <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                        {/* Detail grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Aadhaar Number</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>XXXX-XXXX-{app.aadhaarNumber?.slice(-4)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Application Date</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{new Date(app.appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          </div>
                          {app.certificateNumber && (
                            <div>
                              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Certificate No.</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', fontFamily: 'monospace' }}>{app.certificateNumber}</div>
                            </div>
                          )}
                        </div>

                        {/* Rejection action card */}
                        {isRejected && (
                          <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#b91c1c', marginBottom: 8 }}>
                              <AlertTriangle size={16} /> Action Required: Re-upload Documents
                            </div>
                            <div style={{ fontSize: 12, color: '#7f1d1d', marginBottom: 4 }}><strong>Reason:</strong> {app.rejectionReason}</div>
                            {app.officerRemarks && <div style={{ fontSize: 12, color: '#7f1d1d' }}><strong>Remarks:</strong> {app.officerRemarks}</div>}

                            <div
                              className={`mt-3 p-4 border-2 border-dashed rounded-lg text-center transition-all ${dragOverId === app.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                              onDragOver={(e) => { e.preventDefault(); setDragOverId(app.id); }}
                              onDragLeave={() => setDragOverId(null)}
                              onDrop={(e) => { e.preventDefault(); setDragOverId(null); setResubmitFile({ ...resubmitFile, [app.id]: e.dataTransfer.files[0] }); }}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <Upload size={24} className="text-muted-foreground" />
                                <div className="text-xs text-muted-foreground">Drag & drop corrected document here, or</div>
                                <label className="cursor-pointer">
                                  <Button type="button" variant="outline" size="sm" asChild><span>Browse File</span></Button>
                                  <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={(e) => setResubmitFile({ ...resubmitFile, [app.id]: e.target.files[0] })} />
                                </label>
                                {resubmitFile[app.id] && (
                                  <div className="w-full space-y-2 pt-2">
                                    <div className="text-xs text-primary font-medium flex items-center gap-1 justify-center">
                                      <FileText size={14} /> {resubmitFile[app.id].name} ({(resubmitFile[app.id].size / (1024 * 1024)).toFixed(2)} MB)
                                    </div>
                                    <div className="flex gap-2">
                                      <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setResubmitFile({ ...resubmitFile, [app.id]: null })}>Remove File</Button>
                                      <Button type="button" size="sm" className="flex-1" onClick={() => handleResubmit(app.id, app)}>Resubmit Application</Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Download card */}
                        {canDownload && (
                          <div style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>
                              <CheckCircle2 size={16} /> Certificate Ready for Download
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px' }}>
                              Your official document has been digitally signed and is ready for use.
                            </p>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={(e) => { e.stopPropagation(); handleDownload(app.id, app.certificateNumber); }}>
                              <Download size={14} className="mr-1.5" /> Download PDF
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export default ServiceTracker;
