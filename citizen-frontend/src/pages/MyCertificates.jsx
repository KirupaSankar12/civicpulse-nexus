import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { Badge } from '../components/Badge.jsx';
import { AlertCircle, FileBadge, Download, Printer, Eye, X, Search, GraduationCap, Building2, User, FileSignature, ShieldCheck, CheckCircle2 } from 'lucide-react';

function formatServiceType(type) {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, Filter, Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fetchCertificates = () => {
    const citizenId = keycloak.tokenParsed?.sub;
    api.get(`/service-management-service/api/services/citizen/${citizenId}`)
      .then(r => {
        // Filter only approved/generated certificates
        const approvedCerts = r.data.filter(app => app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED');
        setCertificates(approvedCerts);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load certificates. Is service-management-service running?');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDownload = async (id, certNum, print = false) => {
    try {
      const response = await api.get(`/service-management-service/api/services/download/${id}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      if (print) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        iframe.onload = () => {
          iframe.contentWindow.print();
        };
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${certNum || 'certificate'}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
      fetchCertificates(); // To update download count / status
    } catch (err) {
      console.error(err);
      alert('Failed to process certificate document.');
    }
  };

  const handlePreview = async (id) => {
    try {
      const response = await api.get(`/service-management-service/api/services/download/${id}`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPreviewUrl(url);
      setShowPreviewModal(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load preview.');
    }
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Extract unique filter options
  const uniqueTypes = [...new Set(certificates.map(c => c.serviceType))];
  const uniqueDepts = [...new Set(certificates.map(c => c.department || 'Municipal Corporation'))];
  const uniqueYears = [...new Set(certificates.map(c => new Date(c.approvedDate || c.appliedDate).getFullYear().toString()))];

  // Apply filters and search
  let processedCerts = certificates.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchSearch = !query || 
      (c.applicantName && c.applicantName.toLowerCase().includes(query)) ||
      (c.certificateNumber && c.certificateNumber.toLowerCase().includes(query)) ||
      (c.applicationNumber && c.applicationNumber.toLowerCase().includes(query)) ||
      (c.serviceType && formatServiceType(c.serviceType).toLowerCase().includes(query));

    const matchType = filterType === 'all' || c.serviceType === filterType;
    const matchDept = filterDept === 'all' || (c.department || 'Municipal Corporation') === filterDept;
    const matchYear = filterYear === 'all' || new Date(c.approvedDate || c.appliedDate).getFullYear().toString() === filterYear;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;

    return matchSearch && matchType && matchDept && matchYear && matchStatus;
  });

  // Apply sorting
  processedCerts = processedCerts.sort((a, b) => {
    const dateA = new Date(a.approvedDate || a.appliedDate).getTime();
    const dateB = new Date(b.approvedDate || b.appliedDate).getTime();
    
    switch (sortOrder) {
      case 'newest': return dateB - dateA;
      case 'oldest': return dateA - dateB;
      case 'downloads': return (b.downloadCount || 0) - (a.downloadCount || 0);
      case 'certNum': return (a.certificateNumber || '').localeCompare(b.certificateNumber || '');
      case 'appNum': return (a.applicationNumber || '').localeCompare(b.applicationNumber || '');
      default: return 0;
    }
  });

  return (
    <AppShell title="My Certificates">
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
              My Certificates
            </h2>
            <p style={{ margin: 0, color: '#cbd5e1', maxWidth: 540, fontSize: 14, lineHeight: 1.5 }}>
              Your encrypted vault for all officially issued municipal certificates. Download PDFs, verify digital signatures, and print on demand.
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
          <div className="alert alert-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Search & Filters */}
        <div style={{
          background: '#ffffff', borderRadius: 14, padding: '16px 20px',
          border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
          display: 'flex', flexDirection: 'column', gap: 14
        }}>
          <div className="relative">
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }} />
            <input
              type="text"
              placeholder="Search by Applicant, Cert No, App No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 42px', borderRadius: 10,
                border: '1px solid #cbd5e1', fontSize: 13, color: '#0f172a', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <select className="h-10 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer shadow-xs" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="downloads">Sort: Most Downloaded</option>
              <option value="certNum">Sort: Certificate Number</option>
              <option value="appNum">Sort: Application Number</option>
            </select>
            <select className="h-10 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer shadow-xs" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {uniqueTypes.map(t => <option key={t} value={t}>{formatServiceType(t)}</option>)}
            </select>
            <select className="h-10 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer shadow-xs" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
              <option value="all">All Departments</option>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="h-10 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer shadow-xs" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="all">All Years</option>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="h-10 px-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer shadow-xs" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="CERTIFICATE_GENERATED">New / Ready</option>
              <option value="DOWNLOADED">Downloaded</option>
            </select>
          </div>
        </div>

        {/* Loader */}
        {isLoading && <PageLoader message="Loading your certificates..." />}

        {/* Empty State (No Certificates Ever) */}
        {!isLoading && certificates.length === 0 && (
          <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
             <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={32} color="var(--color-primary)" />
                </div>
             </div>
             <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>No Certificates Found</h3>
             <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px' }}>
                No certificates have been issued yet. Track your ongoing applications to see when they are ready.
             </p>
             <Link to="/services/tracker" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>Track Applications</Link>
          </div>
        )}

        {/* Empty State (Search / Filter Mismatch) */}
        {!isLoading && certificates.length > 0 && processedCerts.length === 0 && (
          <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
             <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Search size={32} color="var(--color-text-tertiary)" />
                </div>
             </div>
             <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>No Matches Found</h3>
             <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                No certificates match your current search or filter criteria. Try adjusting your selections.
             </p>
          </div>
        )}

        {/* Certificate Feed */}
        {!isLoading && processedCerts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {processedCerts.map(app => {
              const isDownloaded = app.status === 'DOWNLOADED';
              const statusStyle = isDownloaded
                ? { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', label: 'Downloaded' }
                : { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', label: 'Ready' };

              return (
                <div key={app.id} style={{
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 2px 10px rgba(15,23,42,0.04)',
                }}>
                  {/* ── Section 1: Card Header ── */}
                  <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: '1px solid #f1f5f9' }}>
                    {/* Left: Icon + Title + Cert No */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: '#eff6ff', border: '1px solid #bfdbfe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <FileBadge size={20} color="#2563eb" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                          {formatServiceType(app.serviceType)}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Cert No:</span>
                          <span style={{
                            fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                            color: '#1e293b', background: '#f1f5f9',
                            padding: '2px 8px', borderRadius: 6, border: '1px solid #cbd5e1'
                          }}>{app.certificateNumber}</span>
                        </div>
                      </div>
                    </div>
                    {/* Right: Status badge */}
                    <span style={{
                      flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center',
                      padding: '5px 14px', borderRadius: 20,
                      background: statusStyle.bg, color: statusStyle.text,
                      border: `1px solid ${statusStyle.border}`,
                      fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap'
                    }}>
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* ── Section 2: Details Grid (Neat 3-Column Structured Pills) ── */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12, padding: '20px 24px', background: '#f8fafc',
                    borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9'
                  }}>
                    {[
                      { label: 'Applicant Name', value: app.applicantName, icon: <User size={14} color="#64748b" /> },
                      { label: 'Application No',  value: app.applicationNumber, mono: true },
                      { label: 'Approved Date',   value: app.approvedDate ? new Date(app.approvedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' },
                      { label: 'Approved By',     value: app.approvedBy || 'Municipal Officer' },
                      { label: 'Department',      value: app.department || 'Municipal Corporation', icon: <Building2 size={14} color="#64748b" /> },
                      { label: 'Total Downloads', value: String(app.downloadCount || 0) },
                    ].map((item) => (
                      <div key={item.label} style={{
                        background: '#ffffff', padding: '12px 14px', borderRadius: 10,
                        border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 4
                      }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {item.label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#1e293b', fontFamily: item.mono ? 'monospace' : 'inherit' }}>
                          {item.icon}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Section 3: Action Bar ── */}
                  <div style={{
                    display: 'flex', background: '#ffffff'
                  }}>
                    {[
                      { label: 'Preview',  Icon: Eye,      color: '#2563eb', hoverBg: '#eff6ff', onClick: () => handlePreview(app.id) },
                      { label: 'Download', Icon: Download,  color: '#16a34a', hoverBg: '#f0fdf4', onClick: () => handleDownload(app.id, app.certificateNumber, false) },
                      { label: 'Print',    Icon: Printer,   color: '#475569', hoverBg: '#f8fafc', onClick: () => handleDownload(app.id, app.certificateNumber, true) },
                    ].map((btn, i, arr) => (
                      <button
                        key={btn.label}
                        type="button"
                        style={{
                          flex: 1, padding: '14px 8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          border: 'none',
                          borderRight: i < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                          background: 'transparent', cursor: 'pointer',
                          fontSize: 13, fontWeight: 700, color: btn.color,
                          transition: 'background 0.15s ease',
                        }}
                        onClick={btn.onClick}
                        onMouseEnter={e => e.currentTarget.style.background = btn.hoverBg}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <btn.Icon size={16} />
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
      
      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="preview-modal-title">
          <div className="modal animate-slide-up" style={{ maxWidth: '800px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 id="preview-modal-title" style={{ margin: 0, color: 'var(--color-primary)', fontSize: '18px', fontWeight: '600' }}>Certificate Viewer</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={closePreview} aria-label="Close" style={{ padding: '6px' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ flex: 1, padding: '0' }}>
              {previewUrl ? (
                <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Certificate Viewer PDF" />
              ) : (
                <div style={{ padding: '20px', textAlign: 'center' }}>Loading preview...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default MyCertificates;

