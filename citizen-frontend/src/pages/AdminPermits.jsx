import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { Search, ShieldCheck, CheckCircle, Clock, XCircle, Download } from 'lucide-react';

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

function AdminPermits() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function fetchApps() {
      try {
        setLoading(true);
        const res = await api.get('/service-management-service/api/services');
        // Filter only permits
        const permits = (res.data || []).filter(a => a.serviceType === 'PERMIT_APPROVAL');
        setApplications(permits.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate)));
      } catch (err) {
        console.error('Failed to fetch permits', err);
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
      alert('Permit not ready or download failed.');
    }
  };

  const filteredApps = applications.filter(app => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
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
    return <AppShell title="Permit Management"><PageLoader message="Loading Permits..." /></AppShell>;
  }

  return (
    <AppShell title="Permit Management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 fw-bold text-primary">Permit Applications</h1>
          <p className="text-muted mb-0">Manage commercial and construction permit requests.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center flex-wrap gap-3 rounded-top-4">
          <h5 className="mb-0 fw-bold"><ShieldCheck size={20} className="me-2 text-warning"/> All Permits</h5>
          
          <div className="d-flex gap-2 flex-wrap">
            <div className="input-group" style={{ width: '250px' }}>
              <span className="input-group-text bg-white border-end-0"><Search size={16} className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Search Permit No or Name..." 
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
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Permit No.</th>
                <th>Applicant</th>
                <th>Permit Type</th>
                <th>Department</th>
                <th>Inspection Status</th>
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
                  <td>{app.dynamicData?.permitType || 'Commercial'} Permit</td>
                  <td>{app.department || 'Urban Planning Department'}</td>
                  <td className="text-muted small">
                    {app.status === 'UNDER_VERIFICATION' ? 'Pending Inspection' : (app.status === 'SUBMITTED' ? 'Awaiting Assignment' : 'Inspection Cleared')}
                  </td>
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
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="mb-2"><Search size={40} className="text-light" /></div>
                    No permits found.
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

export default AdminPermits;
