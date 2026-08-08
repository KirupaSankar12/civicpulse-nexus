import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import { Search, FileText, CheckCircle, Clock, XCircle, Download } from 'lucide-react';

const STATUS_MAP = {
  SUBMITTED: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  RESUBMITTED: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  UNDER_VERIFICATION: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  VERIFIED: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  APPROVED: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  CERTIFICATE_GENERATED: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  DOWNLOADED: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  REJECTED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

function StatusBadge({ status }) {
  const m = STATUS_MAP[status] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      background: m.bg, color: m.text,
      border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 700,
    }}>
      {status?.replace('_', ' ') || '—'}
    </span>
  );
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
      <div style={{ width: '100%', maxWidth: '100%', padding: '0 24px 40px 24px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* ── Welcome Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #334155)',
        borderRadius: 16, padding: '24px 32px', color: '#fff',
        display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 10px 25px rgba(15,23,42,0.3)',
        marginBottom: 30, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: '#fff', opacity: 0.03, borderRadius: '50%', filter: 'blur(30px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block' }}>
            ADMINISTRATION
          </span>
          <h2 style={{ margin: '10px 0 6px', fontSize: 28, fontWeight: 800, color: '#ffffff' }}>Certificate Applications</h2>
          <p style={{ margin: 0, color: '#cbd5e1', maxWidth: 500, fontSize: 14 }}>
            Manage and track all citizen certificate requests.
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#0f172a" />
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>All Certificates</h3>
          </div>
          
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '250px' }}>
              <input 
                type="text" 
                placeholder="Search App No or Name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff', color: '#0f172a', outline: 'none' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
            <select 
              style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff', color: '#0f172a', outline: 'none' }}
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CERTIFICATE_GENERATED">Generated</option>
            </select>
            <select 
              style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff', color: '#0f172a', outline: 'none' }}
              value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
              <option value="DEATH_CERTIFICATE">Death Certificate</option>
              <option value="INCOME_CERTIFICATE">Income Certificate</option>
              <option value="RESIDENCE_CERTIFICATE">Residence Certificate</option>
              <option value="TRADE_LICENSE">Trade License</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', padding: '0 0 20px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>App No.</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Applicant</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Applied Date</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontFamily: 'monospace', color: '#3b82f6', fontWeight: 600 }}>{app.applicationNumber}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0f172a' }}>{app.applicantName}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14 }}>{app.serviceType?.replace('_', ' ')}</td>
                  <td style={{ padding: '16px 20px', fontSize: 14 }}>{app.department || 'Health Department'}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <Link to={`/services/officer/verify/${app.id}`} style={{ textDecoration: 'none' }}>
                        <button style={{
                          background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '6px 12px',
                          borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer'
                        }}>View</button>
                      </Link>
                      {(app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED') && (
                        <button onClick={() => handleDownload(app.id, app.applicationNumber)} style={{
                          background: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px',
                          borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                        }}>
                          <Download size={14} /> PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                    <div style={{ marginBottom: 12 }}><Search size={40} color="#cbd5e1" /></div>
                    No certificates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AppShell>
  );
}

export default AdminCertificates;
