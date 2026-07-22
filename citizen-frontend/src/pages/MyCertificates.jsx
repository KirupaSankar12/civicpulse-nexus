import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { Badge } from '../components/Badge.jsx';
import { AlertCircle, FileBadge, Download, Printer, Eye, X, Search, GraduationCap, Building2, User, FileSignature } from 'lucide-react';

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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ color: 'var(--color-primary)', margin: '0 0 4px 0', fontSize: '24px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileBadge size={28} /> My Certificates
            </h1>
            <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>Your permanent digital repository for all officially issued municipal certificates.</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderRadius: 'var(--radius-md)' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Search & Filters */}
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '32px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input
              type="text"
              placeholder="Search by Applicant, Cert No, App No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <select style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', outline: 'none', cursor: 'pointer' }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="downloads">Sort: Most Downloaded</option>
              <option value="certNum">Sort: Certificate Number</option>
              <option value="appNum">Sort: Application Number</option>
            </select>
            <select style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', outline: 'none', cursor: 'pointer' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              {uniqueTypes.map(t => <option key={t} value={t}>{formatServiceType(t)}</option>)}
            </select>
            <select style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', outline: 'none', cursor: 'pointer' }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
              <option value="all">All Departments</option>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', outline: 'none', cursor: 'pointer' }} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="all">All Years</option>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', outline: 'none', cursor: 'pointer' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {processedCerts.map(app => (
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
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileBadge size={20} color="var(--color-primary)" />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{formatServiceType(app.serviceType)}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                          <span style={{ fontWeight: '500' }}>Cert No:</span>
                          <span style={{ fontFamily: 'monospace', backgroundColor: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>{app.certificateNumber}</span>
                        </div>
                      </div>
                    </div>
                    {app.status === 'DOWNLOADED' ? (
                      <Badge variant="success" label="Downloaded" />
                    ) : (
                      <Badge variant="info" label="New" />
                    )}
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', padding: '16px 0', borderTop: '1px dashed var(--color-border)', borderBottom: '1px dashed var(--color-border)' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Applicant Name</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} color="var(--color-text-secondary)" /> {app.applicantName}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Application No</div>
                      <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>{app.applicationNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Approved Date</div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{app.approvedDate ? new Date(app.approvedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Approved By</div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{app.approvedBy || 'Municipal Officer'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Department</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={14} color="var(--color-text-secondary)" /> {app.department || 'Municipal Corporation'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Total Downloads</div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{app.downloadCount || 0}</div>
                    </div>
                  </div>
                </div>
                
                {/* Action Bar */}
                <div style={{ display: 'flex', padding: '0', backgroundColor: 'var(--color-bg-secondary)' }}>
                  <button type="button" style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', borderRight: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)', transition: 'background-color 0.2s' }} onClick={() => handlePreview(app.id)} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Eye size={16} /> Preview
                  </button>
                  <button type="button" style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', borderRight: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--color-success)', transition: 'background-color 0.2s' }} onClick={() => handleDownload(app.id, app.certificateNumber, false)} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Download size={16} /> Download
                  </button>
                  <button type="button" style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', transition: 'background-color 0.2s' }} onClick={() => handleDownload(app.id, app.certificateNumber, true)} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-border)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Printer size={16} /> Print
                  </button>
                </div>
              </div>
            ))}
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
