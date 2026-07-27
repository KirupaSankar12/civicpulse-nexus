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
          <h2 style={{ margin: '10px 0 6px', fontSize: 28, fontWeight: 800, color: '#ffffff' }}>Manage Departments</h2>
          <p style={{ margin: 0, color: '#cbd5e1', maxWidth: 500, fontSize: 14 }}>
            Overview of all civic service departments, their head officers, and live statistics.
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ overflowX: 'auto', padding: '0 0 20px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Head Officer</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Total Officers</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Pending Cases</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Resolved Cases</th>
                <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', width: 200 }}>Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d, i) => {
                const total = d.pending + d.resolved;
                const rate = total > 0 ? Math.round((d.resolved / total) * 100) : (d.officerCount > 0 ? 100 : 0);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '700', color: '#0f172a' }}>{d.name}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13
                        }}>
                          {d.head.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{d.head}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {d.officerCount}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{ background: '#fff7ed', color: '#f59e0b', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {d.pending}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <span style={{ background: '#f0fdf4', color: '#10b981', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                        {d.resolved}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 6, width: 80, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            background: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444',
                            width: `${rate}%`
                          }}></div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{rate}%</span>
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
