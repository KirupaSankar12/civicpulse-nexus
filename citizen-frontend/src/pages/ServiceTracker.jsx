import { useEffect, useState } from 'react';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';

function statusInfo(status) {
  switch (status) {
    case 'SUBMITTED': return { label: 'Submitted', cls: 'badge-blue' };
    case 'UNDER_VERIFICATION': return { label: 'Under Verification', cls: 'badge-purple' };
    case 'VERIFIED': return { label: 'Verified', cls: 'badge-purple' };
    case 'APPROVED': return { label: 'Approved', cls: 'badge-yellow' };
    case 'CERTIFICATE_GENERATED': return { label: '🎉 Ready for Download', cls: 'badge-green' };
    case 'DOWNLOADED': return { label: '📥 Downloaded', cls: 'badge-green' };
    case 'REJECTED': return { label: 'Rejected (Action Required)', cls: 'badge-red' };
    case 'RESUBMITTED': return { label: 'Resubmitted', cls: 'badge-yellow' };
    default: return { label: status, cls: 'badge-gray' };
  }
}

function ServiceTracker() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [resubmitFile, setResubmitFile] = useState({});

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
      // Refresh list to show updated download count/status
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert('Failed to download certificate PDF.');
    }
  };

  const handleResubmit = async (id, app) => {
    if (!resubmitFile[id]) {
      alert("Please select a file to re-upload");
      return;
    }
    
    // Simulate uploading the new file and merging with existing documents
    let existingDocs = [];
    if (app.documentsSubmitted) {
      try {
        existingDocs = JSON.parse(app.documentsSubmitted);
      } catch (e) {
        existingDocs = app.documentsSubmitted.split(',').map(s => s.trim());
      }
    }
    // ensure it's an array
    if (!Array.isArray(existingDocs)) existingDocs = [];
    
    const newDocName = `Corrected_${resubmitFile[id].name}`;
    if (!existingDocs.includes(newDocName)) {
      existingDocs.push(newDocName);
    }
    
    try {
      await api.put(`/service-management-service/api/services/resubmit/${id}`, {
        serviceType: app.serviceType,
        documentsSubmitted: JSON.stringify(existingDocs),
        // keep dynamic data unchanged
        dynamicData: app.dynamicData ? JSON.parse(app.dynamicData) : {}
      });
      alert("Application resubmitted successfully!");
      setResubmitFile({ ...resubmitFile, [id]: null });
      fetchApplications();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to resubmit application.');
    }
  };

  return (
    <AppShell title="My Certificate Applications">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)' }}>📜 My Applications</h1>
          <p className="text-muted">Track the status of your certificates and permits.</p>
        </div>
        <a href="/services/apply" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--primary-color)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Apply for Certificate
        </a>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '1rem', borderRadius: '8px' }}><span>⚠️</span> {error}</div>}
      {isLoading && <div style={{ padding: '48px', textAlign: 'center' }}><div className="spinner-sm" style={{ width: '32px', height: '32px', margin: '0 auto', borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} /></div>}

      {!isLoading && applications.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
          <div className="empty-state">
            <span className="empty-icon" style={{ fontSize: '3rem' }}>📭</span>
            <p style={{ marginTop: '1rem', color: '#666' }}>No applications submitted yet. <a href="/services/apply" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Apply now</a></p>
          </div>
        </div>
      )}

      {applications.map(app => {
        const si = statusInfo(app.status);
        const stages = ['SUBMITTED', 'VERIFIED', 'CERTIFICATE_GENERATED'];
        const currentIdx = app.status === 'DOWNLOADED' ? 2 : (app.status === 'APPROVED' ? 1 : stages.indexOf(app.status));

        return (
          <div key={app.id} className="card" style={{ marginBottom: '16px', padding: '1.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>
                  {app.serviceType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </h3>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  Application No: <code>{app.applicationNumber}</code> · Applied: {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                </div>
              </div>
              <span className={`badge ${si.cls}`} style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600' }}>{si.label}</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <div><strong>Applicant Name:</strong> {app.applicantName}</div>
                  <div><strong>Aadhaar Number:</strong> XXXX-XXXX-{app.aadhaarNumber?.slice(-4)}</div>
                  {app.certificateNumber && <div><strong>Certificate No:</strong> <code style={{ color: 'var(--primary-color)' }}>{app.certificateNumber}</code></div>}
                  {app.status === 'REJECTED' && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
                      <div style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '8px' }}>Action Required: Re-upload Documents</div>
                      <div style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '4px' }}><strong>Reason:</strong> {app.rejectionReason}</div>
                      {app.officerRemarks && <div style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '12px' }}><strong>Remarks:</strong> {app.officerRemarks}</div>}
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setResubmitFile({ ...resubmitFile, [app.id]: e.target.files[0] })} style={{ fontSize: '13px' }} />
                        <button className="btn btn-sm btn-primary" onClick={() => handleResubmit(app.id, app)} disabled={!resubmitFile[app.id]} style={{ padding: '0.4rem 0.8rem', background: '#dc2626', border: 'none' }}>
                          Re-submit
                        </button>
                      </div>
                    </div>
                  )}
                  {app.downloadCount > 0 && <div><strong>Downloads:</strong> {app.downloadCount} times</div>}
                </div>

                {/* Progress tracker */}
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', fontWeight: '600' }}>Process Timeline</div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {stages.map((stage, i) => (
                      <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto 4px',
                            background: currentIdx >= i ? '#10b981' : '#e5e7eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '11px', fontWeight: 'bold'
                          }}>
                            {currentIdx >= i ? '✓' : (i + 1)}
                          </div>
                          <div style={{ fontSize: '9px', color: currentIdx >= i ? '#10b981' : '#9ca3af', fontWeight: '500' }}>
                            {stage === 'CERTIFICATE_GENERATED' ? 'ISSUED' : stage}
                          </div>
                        </div>
                        {i < stages.length - 1 && (
                          <div style={{ width: '100%', height: '2px', background: currentIdx > i ? '#10b981' : '#e5e7eb', margin: '0 2px' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {(app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED') && (
                <button 
                  className="btn btn-accent btn-sm" 
                  onClick={() => handleDownload(app.id, app.certificateNumber)} 
                  style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  📥 Download Certificate PDF
                </button>
              )}
            </div>
          </div>
        );
      })}
    </AppShell>
  );
}

export default ServiceTracker;
