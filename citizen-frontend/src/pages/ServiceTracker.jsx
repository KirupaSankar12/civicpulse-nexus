import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { Badge } from '../components/Badge.jsx';
import { 
  Download, Printer, AlertTriangle, AlertCircle, FileText, 
  CheckCircle2, Upload, Info, Search, FileSignature, Clock,
  ChevronDown, ChevronUp, MapPin, Building2, User
} from 'lucide-react';

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

// Relative time formatting
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

// Grouping logic
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

// Inline Timeline Component
function InlineTimeline({ status }) {
  const steps = [
    { key: 'SUBMITTED', label: 'Submitted', activeStatuses: ['SUBMITTED', 'UNDER_VERIFICATION', 'VERIFIED', 'APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED', 'RESUBMITTED', 'REJECTED'] },
    { key: 'UNDER_VERIFICATION', label: 'Verification', activeStatuses: ['UNDER_VERIFICATION', 'VERIFIED', 'APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'] },
    { key: 'APPROVED', label: 'Approved', activeStatuses: ['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'], errorStatuses: ['REJECTED'] },
    { key: 'CERTIFICATE_GENERATED', label: 'Generated', activeStatuses: ['CERTIFICATE_GENERATED', 'DOWNLOADED'] }
  ];

  return (
    <div className="inline-timeline" style={{ display: 'flex', alignItems: 'center', margin: '24px 0 16px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', left: '10%', right: '10%', height: '2px', backgroundColor: 'var(--color-border)', zIndex: 0 }}></div>
      {steps.map((step, index) => {
        const isActive = step.activeStatuses.includes(status);
        const isError = step.errorStatuses && step.errorStatuses.includes(status);
        const isLast = index === steps.length - 1;
        
        let bgColor = 'var(--color-bg)';
        let borderColor = 'var(--color-border)';
        let icon = null;

        if (isActive) {
          bgColor = 'var(--color-primary)';
          borderColor = 'var(--color-primary)';
          icon = <CheckCircle2 size={12} color="white" strokeWidth={3} />;
        } else if (isError) {
          bgColor = 'var(--color-danger)';
          borderColor = 'var(--color-danger)';
          icon = <AlertTriangle size={12} color="white" strokeWidth={3} />;
        }

        return (
          <div key={step.key} style={{ flex: '1', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             {/* Fill line left */}
             {index > 0 && steps[index-1].activeStatuses.includes(status) && isActive && (
                <div style={{ position: 'absolute', right: '50%', top: '10px', width: '100%', height: '2px', backgroundColor: 'var(--color-primary)', zIndex: -1 }}></div>
             )}

             <div style={{ 
               width: '22px', height: '22px', borderRadius: '50%', 
               backgroundColor: bgColor, border: `2px solid ${borderColor}`,
               display: 'flex', alignItems: 'center', justifyContent: 'center',
               marginBottom: '8px',
               boxShadow: isActive ? '0 0 0 4px var(--color-primary-light)' : (isError ? '0 0 0 4px var(--color-danger-light)' : 'none')
             }}>
               {icon}
             </div>
             <span style={{ fontSize: '11px', fontWeight: isActive || isError ? '600' : '500', color: isActive ? 'var(--color-text-primary)' : (isError ? 'var(--color-danger)' : 'var(--color-text-tertiary)'), whiteSpace: 'nowrap' }}>
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
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  const fetchApplications = () => {
    const citizenId = keycloak.tokenParsed?.sub;
    api.get(`/service-management-service/api/services/citizen/${citizenId}`)
      .then(r => {
        // 1. Sort newest first
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
      fetchApplications();
    } catch (err) {
      console.error(err);
      showToast('Failed to download certificate PDF.', 'error');
    }
  };

  const handleResubmit = async (id, app) => {
    const file = resubmitFile[id];
    if (!file) {
      showToast('No file selected. Please select a file to re-upload.', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB.', 'error');
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
      showToast('Application Resubmitted Successfully. Your corrected documents have been sent to the assigned officer.', 'success');
      setResubmitFile({ ...resubmitFile, [id]: null });
      fetchApplications();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to resubmit application.', 'error');
    }
  };

  // Filter and group applications
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ color: 'var(--color-primary)', margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700' }}>Recent Activities</h1>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Track your certificate applications and history.</p>
          </div>
          <Link to="/services/apply" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
            + Apply New
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}
        
        {/* Toast Notification */}
        {toast.show && (
          <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 1050,
            backgroundColor: toast.type === 'success' ? '#198754' : '#dc3545',
            color: 'white', padding: '16px 24px', borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px',
            maxWidth: '400px'
          }}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{toast.message}</span>
            <button onClick={() => setToast({ ...toast, show: false })} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 'auto', fontSize: '20px' }}>&times;</button>
          </div>
        )}

        {/* Search & Filters */}
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search application number or certificate..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }} className="hide-scrollbar">
            {FILTER_OPTIONS.map(opt => (
              <button 
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                style={{ 
                  padding: '6px 16px', 
                  borderRadius: 'var(--radius-full)', 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: statusFilter === opt.value ? 'none' : '1px solid var(--color-border)',
                  backgroundColor: statusFilter === opt.value ? 'var(--color-primary)' : 'transparent',
                  color: statusFilter === opt.value ? 'white' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loader */}
        {isLoading && <PageLoader message="Loading your timeline..." />}

        {/* Empty State */}
        {!isLoading && filteredApps.length === 0 && (
          <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
             <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
               <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <FileSignature size={32} color="var(--color-primary)" />
               </div>
             </div>
             <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>No Applications Found</h3>
             <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px' }}>
               {searchQuery || statusFilter !== 'ALL' 
                 ? "Try adjusting your search or filters to find what you're looking for." 
                 : "You haven't submitted any certificate applications yet. Start by applying for a new certificate."}
             </p>
             {(!searchQuery && statusFilter === 'ALL') && (
               <Link to="/services/apply" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>Apply Certificate</Link>
             )}
          </div>
        )}

        {/* Timeline Feed */}
        {!isLoading && groupedApps.map(([groupName, apps]) => (
          <div key={groupName} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {groupName}
              <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)' }}></div>
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {apps.map(app => {
                const isExpanded = expandedAppId === app.id;
                const canDownload = app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED';
                const isRejected = app.status === 'REJECTED';

                return (
                  <div key={app.id} style={{ 
                    backgroundColor: 'var(--color-bg)', 
                    borderRadius: 'var(--radius-lg)', 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)', 
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }
                  }}>
                    {/* Card Header */}
                    <div style={{ padding: '20px', cursor: 'pointer' }} onClick={() => toggleExpand(app.id)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileSignature size={20} color="var(--color-primary)" />
                          </div>
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{formatServiceType(app.serviceType)}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                              <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>{app.applicationNumber}</span>
                              <span>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {getRelativeTime(app.appliedDate)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={statusBadgeVariant(app.status)} label={statusInfo(app.status)} />
                      </div>

                      {/* Inline Timeline */}
                      <InlineTimeline status={app.status} />

                      {/* Quick Info & Expand Toggle */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--color-border)' }}>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {app.applicantName}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> Revenue Dept.</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '13px', fontWeight: '500' }}>
                          {isExpanded ? 'Hide Details' : 'View Details'}
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', padding: '20px 0' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Aadhaar Number</div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>XXXX-XXXX-{app.aadhaarNumber?.slice(-4)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Application Date</div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{new Date(app.appliedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          </div>
                          {app.certificateNumber && (
                            <div>
                              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Certificate No.</div>
                              <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: '600' }}>{app.certificateNumber}</div>
                            </div>
                          )}
                        </div>

                        {/* Rejection / Resubmit Section */}
                        {isRejected && (
                          <div className="alert alert-error" style={{ borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertTriangle size={18} /> Action Required: Re-upload Documents
                            </div>
                            <div style={{ fontSize: '13px', marginBottom: '4px' }}><strong>Reason:</strong> {app.rejectionReason}</div>
                            {app.officerRemarks && <div style={{ fontSize: '13px', marginBottom: '12px' }}><strong>Remarks:</strong> {app.officerRemarks}</div>}

                            <div
                              style={{ 
                                marginTop: '16px', padding: '20px', 
                                border: `2px dashed ${dragOverId === app.id ? 'var(--color-primary)' : 'var(--color-border)'}`, 
                                borderRadius: 'var(--radius-md)', 
                                backgroundColor: dragOverId === app.id ? 'var(--color-primary-light)' : 'var(--color-bg)', 
                                textAlign: 'center', transition: 'all 0.2s'
                              }}
                              onDragOver={(e) => { e.preventDefault(); setDragOverId(app.id); }}
                              onDragLeave={() => setDragOverId(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragOverId(null);
                                setResubmitFile({ ...resubmitFile, [app.id]: e.dataTransfer.files[0] });
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <Upload size={24} color="var(--color-text-tertiary)" />
                                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Drag and drop corrected document here, or</div>
                                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                                  Browse File
                                  <input type="file" accept=".pdf,.jpg,.png" style={{ display: 'none' }} onChange={(e) => setResubmitFile({ ...resubmitFile, [app.id]: e.target.files[0] })} />
                                </label>
                                {resubmitFile[app.id] && (
                                  <div style={{ width: '100%' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500', marginTop: '8px', marginBottom: '4px' }}>
                                      <FileText size={14} /> {resubmitFile[app.id].name} ({(resubmitFile[app.id].size / (1024 * 1024)).toFixed(2)} MB)
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                      <button type="button" className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => setResubmitFile({ ...resubmitFile, [app.id]: null })}>
                                        Remove File
                                      </button>
                                      <button type="button" className="btn btn-primary btn-sm flex-grow-1" onClick={() => handleResubmit(app.id, app)}>
                                        Resubmit Application
                                      </button>
                                    </div>
                                  </div>
                                )}
                                {!resubmitFile[app.id] && (
                                  <button type="button" className="btn btn-secondary btn-sm" disabled style={{ marginTop: '8px', width: '100%', opacity: 0.6 }}>
                                    Select a file to Resubmit
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Download Section */}
                        {canDownload && (
                          <div style={{ backgroundColor: 'var(--color-success-light)', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: '600' }}>
                              <CheckCircle2 size={20} /> Certificate Ready for Download
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'center' }}>
                              Your official document has been digitally signed and is ready for use.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                              <button type="button" className="btn btn-accent" onClick={(e) => { e.stopPropagation(); handleDownload(app.id, app.certificateNumber); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-full)' }}>
                                <Download size={16} /> Download PDF
                              </button>
                            </div>
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
