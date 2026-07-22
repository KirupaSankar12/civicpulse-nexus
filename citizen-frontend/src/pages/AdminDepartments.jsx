import React, { useState, useEffect } from 'react';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';

function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const predefinedDepartments = [
    { name: 'Health Department', head: 'John' },
    { name: 'Revenue Department', head: 'Mark' },
    { name: 'Municipal Corporation', head: 'Ryan' },
    { name: 'Water Department', head: 'Chris' },
    { name: 'Roads Department', head: 'Ethan' },
    { name: 'Electricity Department', head: 'Jack' },
    { name: 'Sanitation Department', head: 'David' },
    { name: 'Urban Planning Department', head: 'Will' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Officers
      const officersRes = await api.get('/service-management-service/api/officers');
      const officers = officersRes.data || [];
      
      const appsRes = await api.get('/service-management-service/api/services');
      const applications = appsRes.data || [];

      const compRes = await api.get('/grievance-service/api/complaints?page=0&size=1000');
      const complaints = compRes.data.content || compRes.data || [];

      // Calculate stats per department
      const deptData = predefinedDepartments.map(dept => {
        const deptOfficers = officers.filter(o => o.department === dept.name);
        
        const deptApps = applications.filter(a => a.department === dept.name);
        const deptComps = complaints.filter(c => c.department === dept.name);
        
        const pendingApps = deptApps.filter(a => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(a.status)).length;
        const resolvedApps = deptApps.filter(a => ['APPROVED', 'REJECTED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(a.status)).length;

        const pendingComps = deptComps.filter(c => !['RESOLVED', 'CLOSED'].includes(c.status)).length;
        const resolvedComps = deptComps.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

        return {
          ...dept,
          officerCount: deptOfficers.length,
          pending: pendingApps + pendingComps,
          resolved: resolvedApps + resolvedComps
        };
      });

      setDepartments(deptData);
    } catch (err) {
      console.error('Failed to fetch department data', err);
      // Fallback
      setDepartments(predefinedDepartments.map(d => ({ ...d, officerCount: 0, pending: 0, resolved: 0 })));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Manage Departments">
        <PageLoader message="Synchronizing department data..." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Manage Departments">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1 fw-bold text-primary">🏢 Manage Departments</h1>
          <p className="text-muted mb-0">Overview of all civic service departments, their head officers, and live statistics.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4 py-3">Department</th>
                <th className="py-3">Head Officer</th>
                <th className="text-center py-3">Total Officers</th>
                <th className="text-center py-3">Pending Cases</th>
                <th className="text-center py-3">Resolved Cases</th>
                <th className="pe-4 py-3" style={{ width: '200px' }}>Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d, i) => {
                const total = d.pending + d.resolved;
                const rate = total > 0 ? Math.round((d.resolved / total) * 100) : (d.officerCount > 0 ? 100 : 0);
                return (
                  <tr key={i}>
                    <td className="ps-4 fw-bold text-dark">{d.name}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, fontSize: '13px' }}>
                          {d.head.charAt(0)}
                        </div>
                        <span className="fw-medium">{d.head}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge rounded-pill bg-primary px-3 py-2">{d.officerCount}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge rounded-pill bg-warning text-dark px-3 py-2">{d.pending}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge rounded-pill bg-success px-3 py-2">{d.resolved}</span>
                    </td>
                    <td className="pe-4">
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar ${rate >= 80 ? 'bg-success' : rate >= 50 ? 'bg-warning' : 'bg-danger'}`} 
                            role="progressbar" 
                            style={{ width: `${rate}%` }} 
                            aria-valuenow={rate} 
                            aria-valuemin="0" 
                            aria-valuemax="100">
                          </div>
                        </div>
                        <span className="fw-bold small" style={{ width: '40px' }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

export default AdminDepartments;
