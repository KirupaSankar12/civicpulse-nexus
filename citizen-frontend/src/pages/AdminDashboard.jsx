import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';

function statusBadge(s) {
  if (s === 'SUBMITTED') return 'badge-blue';
  if (s === 'UNDER_VERIFICATION') return 'badge-yellow';
  if (s === 'VERIFIED') return 'badge-purple';
  if (s === 'APPROVED') return 'badge-green';
  if (s === 'CERTIFICATE_GENERATED') return 'badge-accent';
  if (s === 'DOWNLOADED') return 'badge-gray';
  if (s === 'REJECTED') return 'badge-danger';
  if (s === 'RESUBMITTED') return 'badge-orange';
  return 'badge-gray';
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchStats = async () => {
    try {
      const res = await api.get('/service-management-service/api/services/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let url = '/service-management-service/api/services';
      
      if (statusFilter !== 'ALL') {
        url = `/service-management-service/api/services/status/${statusFilter}`;
      } else if (typeFilter !== 'ALL') {
        url = `/service-management-service/api/services/type/${typeFilter}`;
      }

      const res = await api.get(url);
      setApplications(res.data || []);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, [statusFilter, typeFilter]);

  if (loading && !applications.length) {
    return (
      <AppShell title="Admin Dashboard">
        <PageLoader message="Loading Admin Dashboard..." />
      </AppShell>
    );
  }

  // Local search filter
  const filteredApps = applications.filter(app => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      (app.applicationNumber && app.applicationNumber.toLowerCase().includes(lower)) ||
      (app.applicantName && app.applicantName.toLowerCase().includes(lower))
    );
  });

  return (
    <AppShell title="Admin Dashboard">
      <div className="welcome-banner">
        <div>
          <div className="welcome-label">System Administrator</div>
          <h2>Certificate & Permit Administration</h2>
          <p>Monitor all certificate applications, verify system performance, and track digital generation metrics.</p>
        </div>
      </div>

      {stats && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '24px' }}>
          <div className="stat-card" style={{ '--stat-color': 'var(--primary)', '--stat-bg': 'rgba(30,58,95,0.08)' }}>
            <div className="stat-icon">📑</div>
            <div className="stat-value">{stats.totalApplications}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--warning)', '--stat-bg': 'rgba(243,156,18,0.08)' }}>
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pendingVerification + stats.pendingApproval}</div>
            <div className="stat-label">Pending (Total)</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--accent)', '--stat-bg': 'rgba(39,174,96,0.08)' }}>
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--danger)', '--stat-bg': 'rgba(231,76,60,0.08)' }}>
            <div className="stat-icon">❌</div>
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
          <div className="stat-card" style={{ '--stat-color': '#2980b9', '--stat-bg': 'rgba(41,128,185,0.08)' }}>
            <div className="stat-icon">🎓</div>
            <div className="stat-value">{stats.certificatesGenerated}</div>
            <div className="stat-label">Certificates Issued</div>
          </div>
        </div>
      )}

      {/* Reports Section */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h3>📈 Applications by Type</h3>
            </div>
            <div className="card-body">
              {Object.entries(stats.byType || {}).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13.5px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text)' }}>{type.replace('_', ' ')}</span>
                  <span className="badge badge-blue">{count}</span>
                </div>
              ))}
              {Object.keys(stats.byType || {}).length === 0 && <p className="text-muted" style={{ fontSize: '13px' }}>No data yet</p>}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>📊 Applications by Status</h3>
            </div>
            <div className="card-body">
              {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13.5px' }}>
                  <span className={`badge ${statusBadge(status)}`}>{status.replace('_', ' ')}</span>
                  <span style={{ fontWeight: '700' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>⚡ System Metrics</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13.5px' }}>
                <span style={{ fontWeight: '500' }}>Total Downloads</span>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{stats.totalDownloads || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13.5px' }}>
                <span style={{ fontWeight: '500' }}>Approval Rate</span>
                <span style={{ fontWeight: '700', color: 'var(--accent)' }}>
                   {stats.totalApplications > 0 ? Math.round((stats.approved / stats.totalApplications) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3>📋 All Applications</h3>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <input 
              type="text" 
              placeholder="Search by App No or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ padding: '6px 12px', fontSize: '13px', minWidth: '200px' }}
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                if (e.target.value !== 'ALL') setTypeFilter('ALL'); // Mutually exclusive for simple API usage
              }}
              className="form-control"
              style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CERTIFICATE_GENERATED">Certificate Generated</option>
              <option value="DOWNLOADED">Downloaded</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                if (e.target.value !== 'ALL') setStatusFilter('ALL');
              }}
              className="form-control"
              style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
            >
              <option value="ALL">All Types</option>
              <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
              <option value="DEATH_CERTIFICATE">Death Certificate</option>
              <option value="INCOME_CERTIFICATE">Income Certificate</option>
              <option value="RESIDENCE_CERTIFICATE">Residence Certificate</option>
              <option value="TRADE_LICENSE">Trade License</option>
              <option value="PERMIT_APPROVAL">Permit Approval</option>
            </select>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '13px', background: 'var(--surface2)' }}>
            ⟳ Fetching records...
          </div>
        )}

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>App No.</th>
                <th>Applicant Name</th>
                <th>Certificate Type</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Cert No.</th>
                <th>Downloads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => (
                <tr key={app.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {app.applicationNumber}
                  </td>
                  <td style={{ fontWeight: '500' }}>{app.applicantName}</td>
                  <td style={{ fontSize: '13px' }}>{app.serviceType?.replace('_', ' ')}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(app.status)}`}>{app.status?.replace('_', ' ')}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {app.certificateNumber || '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {app.downloadCount > 0 ? (
                      <span className="badge badge-gray">{app.downloadCount}</span>
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Link to={`/services/officer/verify/${app.id}`} className="btn btn-ghost btn-sm">View Details</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '30px', marginBottom: '10px' }}>📭</div>
                    No applications found matching criteria.
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

export default AdminDashboard;
