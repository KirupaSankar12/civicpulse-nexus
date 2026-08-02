import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { StatCard } from '../components/StatCard.jsx';
import api from '../api.js';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, AlertOctagon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const STATUS_COLORS = {
  NEW: '#3b82f6', ASSIGNED: '#f97316', IN_PROGRESS: '#8b5cf6',
  RESOLVED: '#10b981', CLOSED: '#64748b', REJECTED: '#ef4444',
};

const DEPT_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#06b6d4','#f97316'];

export default function GrievanceReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/reports/grievances')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load grievance data'))
      .finally(() => setLoading(false));
  }, []);

  const isUnavailable = data?.status === 'unavailable';

  // Build chart data
  const statusData = data?.byStatus
    ? Object.entries(data.byStatus).map(([k, v]) => ({ name: k, count: v, fill: STATUS_COLORS[k] || '#94a3b8' }))
    : [];
  const deptData = data?.byDepartment
    ? Object.entries(data.byDepartment).map(([k, v]) => ({ name: k.replace(' Department',''), value: v }))
    : [];

  return (
    <AppShell title="Grievance Reports">
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 0 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Grievance Reports</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Complaint analytics aggregated from grievance-service
          </p>
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 100, borderRadius: 12, background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {isUnavailable && !loading && (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <AlertTriangle size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Grievance service temporarily unreachable</p>
          </div>
        )}

        {data && !isUnavailable && !loading && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
              <StatCard icon={AlertTriangle} title="Total Complaints" value={(data.totalComplaints || 0).toLocaleString()} />
              <StatCard icon={CheckCircle2} title="Resolved" value={(data.resolvedComplaints || 0).toLocaleString()} subtitle="Including closed" />
              <StatCard icon={Clock} title="Pending" value={(data.pendingComplaints || 0).toLocaleString()} />
              <StatCard icon={TrendingUp} title="Resolution Rate" value={`${(data.resolutionRate || 0).toFixed(1)}%`} />
              {data.overdueCount != null && (
                <StatCard icon={AlertOctagon} title="Overdue" value={data.overdueCount.toLocaleString()} subtitle="Passed SLA" />
              )}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              {/* Status distribution bar chart */}
              {statusData.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Complaints by Status</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4,4,0,0]}>
                        {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Department pie chart */}
              {deptData.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>By Department</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {deptData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    </AppShell>
  );
}
