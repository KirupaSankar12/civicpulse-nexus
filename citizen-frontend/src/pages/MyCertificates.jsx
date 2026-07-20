import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SectionCard } from '../components/SectionCard.jsx';
import { Badge } from '../components/Badge.jsx';
import { AlertCircle, FileBadge, Download, Printer, Eye, X, Search, GraduationCap } from 'lucide-react';

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
  const [filterStatus, setFilterStatus] = useState('all'); // CERTIFICATE_GENERATED vs DOWNLOADED
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
    // Search matching
    const query = searchQuery.toLowerCase();
    const matchSearch = !query || 
      (c.applicantName && c.applicantName.toLowerCase().includes(query)) ||
      (c.certificateNumber && c.certificateNumber.toLowerCase().includes(query)) ||
      (c.applicationNumber && c.applicationNumber.toLowerCase().includes(query)) ||
      (c.serviceType && formatServiceType(c.serviceType).toLowerCase().includes(query));

    // Filters matching
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
    <AppShell title="My Certificates Repository">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileBadge size={28} /> My Certificates
          </h1>
          <p className="text-muted" style={{ marginTop: '4px' }}>Your permanent digital repository for all officially issued municipal certificates.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {isLoading && <PageLoader message="Loading your certificates..." />}

      {!isLoading && certificates.length === 0 && (
        <SectionCard>
          <EmptyState
            icon="graduation-cap" // Will show fallback or map in EmptyState
            title="No Certificates Found"
            message="No certificates have been issued yet. Track your ongoing applications to see when they are ready."
            actionLabel="Track Applications"
            actionTo="/services/tracker"
          />
        </SectionCard>
      )}

      {!isLoading && certificates.length > 0 && (
        <>
          <SectionCard className="mb-4">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div style={{ flex: '1 1 250px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Applicant, Cert No, App No..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <select className="form-control" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="downloads">Sort: Most Downloaded</option>
                    <option value="certNum">Sort: Certificate Number</option>
                    <option value="appNum">Sort: Application Number</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <select className="form-control" style={{ flex: '1 1 120px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="all">All Types</option>
                  {uniqueTypes.map(t => <option key={t} value={t}>{formatServiceType(t)}</option>)}
                </select>
                <select className="form-control" style={{ flex: '1 1 120px' }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                  <option value="all">All Departments</option>
                  {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="form-control" style={{ flex: '1 1 120px' }} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                  <option value="all">All Years</option>
                  {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="form-control" style={{ flex: '1 1 120px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="CERTIFICATE_GENERATED">Ready for Download</option>
                  <option value="DOWNLOADED">Downloaded</option>
                </select>
              </div>
            </div>
          </SectionCard>

          {processedCerts.length === 0 ? (
            <SectionCard>
              <EmptyState
                icon="search"
                title="No Matches Found"
                message="No certificates match your current search or filter criteria."
              />
            </SectionCard>
          ) : (
            <div className="grid-list">
              {processedCerts.map(app => (
                <SectionCard key={app.id} className="animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--color-text-primary)', fontWeight: '600' }}>
                        {formatServiceType(app.serviceType)}
                      </h3>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        Cert No: <code style={{ fontWeight: 'bold', backgroundColor: 'var(--color-white)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>{app.certificateNumber}</code>
                      </div>
                    </div>
                    {app.status === 'DOWNLOADED' ? (
                      <Badge variant="success" label="Downloaded" />
                    ) : (
                      <Badge variant="info" label="New" />
                    )}
                  </div>
                  
                  <div style={{ padding: '20px', fontSize: '13px' }}>
                    <div className="detail-grid-2">
                      <div className="detail-field">
                        <label>Applicant Name</label>
                        <div className="detail-value">{app.applicantName}</div>
                      </div>
                      <div className="detail-field">
                        <label>Application No</label>
                        <div className="detail-value"><code style={{ backgroundColor: 'var(--color-bg)', padding: '2px 6px', borderRadius: '4px' }}>{app.applicationNumber}</code></div>
                      </div>
                      <div className="detail-field">
                        <label>Approved Date</label>
                        <div className="detail-value">{app.approvedDate ? new Date(app.approvedDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                      </div>
                      <div className="detail-field">
                        <label>Approved By</label>
                        <div className="detail-value">{app.approvedBy || 'Municipal Officer'}</div>
                      </div>
                      <div className="detail-field">
                        <label>Department</label>
                        <div className="detail-value">{app.department || 'Municipal Corporation'}</div>
                      </div>
                      <div className="detail-field">
                        <label>Total Downloads</label>
                        <div className="detail-value">{app.downloadCount || 0}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--color-border)', padding: '16px 20px', backgroundColor: 'var(--color-bg)' }}>
                    <button type="button" className="btn btn-outline btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handlePreview(app.id)}>
                      <Eye size={16} /> Preview
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleDownload(app.id, app.certificateNumber, false)}>
                      <Download size={16} /> Download
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleDownload(app.id, app.certificateNumber, true)}>
                      <Printer size={16} /> Print
                    </button>
                  </div>
                </SectionCard>
              ))}
            </div>
          )}
        </>
      )}

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
