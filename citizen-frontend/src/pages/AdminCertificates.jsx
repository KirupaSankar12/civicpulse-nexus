import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { Search, FileText, CheckCircle, Clock, XCircle, Download } from 'lucide-react';

function statusBadge(s) {
  if (s === 'SUBMITTED') return 'bg-primary text-white';
  if (s === 'UNDER_VERIFICATION') return 'bg-warning text-dark';
  if (s === 'VERIFIED') return 'bg-info text-dark';
  if (s === 'APPROVED') return 'bg-success text-white';
  if (s === 'CERTIFICATE_GENERATED') return 'bg-secondary text-white';
  if (s === 'DOWNLOADED') return 'bg-dark text-white';
  if (s === 'REJECTED') return 'bg-danger text-white';
  if (s === 'RESUBMITTED') return 'bg-warning text-dark';
  return 'bg-secondary text-white';
}

function AdminCertificates() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    async function fetchApps() {
      try {
        setLoading(true);
        const res = await api.get('/service-management-service/api/services');
        // Filter out permits
        const certs = (res.data || []).filter(a => a.serviceType !== 'PERMIT_APPROVAL');
        setApplications(certs.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)));
      } catch (err) {
        console.error('Failed to fetch certificates', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const handleDownload = async (appId, appNum) => {
    try {
      const res = await api.get(`/service-management-service/api/services/download/${appId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${appNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Certificate not ready or download failed.');
    }
  };

  const filteredApps = applications.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && app.serviceType !== typeFilter) return false;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      return (
        (app.applicationNumber && app.applicationNumber.toLowerCase().includes(lower)) ||
        (app.applicantName && app.applicantName.toLowerCase().includes(lower))
      );
    }
    return true;
  });

  if (loading) {
    return <AppShell title="Certificate Management"><PageLoader message="Loading Certificates..." /></AppShell>;
  }

  return (
    <AppShell title="Certificate Management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 fw-bold text-primary">Certificate Applications</h1>
          <p className="text-muted mb-0">Manage and track all citizen certificate requests.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center flex-wrap gap-3 rounded-top-4">
          <h5 className="mb-0 fw-bold"><FileText size={20} className="me-2 text-primary"/> All Certificates</h5>
          
          <div className="d-flex gap-2 flex-wrap">
            <div className="input-group" style={{ width: '250px' }}>
              <span className="input-group-text bg-white border-end-0"><Search size={16} className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Search App No or Name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CERTIFICATE_GENERATED">Generated</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
              <option value="DEATH_CERTIFICATE">Death Certificate</option>
              <option value="INCOME_CERTIFICATE">Income Certificate</option>
              <option value="RESIDENCE_CERTIFICATE">Residence Certificate</option>
              <option value="TRADE_LICENSE">Trade License</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">App No.</th>
                <th>Applicant</th>
                <th>Type</th>
                <th>Department</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => (
                <tr key={app.id}>
                  <td className="ps-4 font-monospace text-muted">{app.applicationNumber}</td>
                  <td className="fw-semibold">{app.applicantName}</td>
                  <td>{app.serviceType?.replace('_', ' ')}</td>
                  <td>{app.department || 'Health Department'}</td>
                  <td className="text-muted small">
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-2 ${statusBadge(app.status)}`}>
                      {app.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <Link to={`/services/officer/verify/${app.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                        View
                      </Link>
                      {(app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED') && (
                        <button onClick={() => handleDownload(app.id, app.applicationNumber)} className="btn btn-sm btn-primary rounded-pill px-3">
                          <Download size={14} className="me-1" /> PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="mb-2"><Search size={40} className="text-light" /></div>
                    No certificates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

export default AdminCertificates;
