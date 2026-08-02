import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { StatCard } from '../components/StatCard.jsx';
import api from '../api.js';
import {
  Users, AlertTriangle, Award, Wallet, TrendingUp,
  Activity, RefreshCw, BarChart2, CheckCircle2, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts';

const DEPT_COLORS = [
  '#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#06b6d4','#f97316'
];

function PerformanceBar({ dept, rate }) {
  const pct = Math.min(100, Math.max(0, rate));
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{dept}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 9999 }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 9999,
          background: color, transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  );
}

export default function GovernanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = () => {
    setLoading(true);
    setError(null);
    api.get('/api/reports/governance/summary')
      .then(r => { setData(r.data); setLastRefresh(new Date()); })
      .catch(e => setError(e.response?.data?.message || 'Failed to load governance data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deptData = data?.departmentPerformance
    ? Object.values(data.departmentPerformance).map(d => ({
        name: d.department?.replace(' Department','').replace(' Dept','') || 'Unknown',
        rate: Math.round(d.resolutionRate * 10) / 10,
        total: d.totalHandled,
      }))
    : [];

  return (
    <AppShell title="Governance Analytics Dashboard">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Governance Analytics
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
              Cross-service aggregated view · Last refreshed: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: loading ? '#e2e8f0' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: loading ? '#94a3b8' : '#fff', fontWeight: 600, fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(99,102,241,0.3)',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* Unavailability banners */}
        {data && (data.grievanceDataUnavailable || data.welfareDataUnavailable || data.certificateDataUnavailable) && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, background: '#fef9c3',
            border: '1px solid #fde047', marginBottom: 20, fontSize: 13, color: '#713f12',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            ⚠️ Some services are temporarily unreachable. Showing partial data.
            {data.grievanceDataUnavailable && ' [Grievance Service]'}
            {data.certificateDataUnavailable && ' [Certificate Service]'}
            {data.welfareDataUnavailable && ' [Welfare Service]'}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 8, background: '#fef2f2',
            border: '1px solid #fecaca', marginBottom: 20, fontSize: 13, color: '#dc2626',
          }}>
            {error}
          </div>
        )}

        {/* Stat cards */}
        {loading && !data ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 100, borderRadius: 12, background: 'linear-gradient(90deg,#f1f5f9 0%,#e2e8f0 50%,#f1f5f9 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
        ) : data && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard icon={Users} title="Total Citizens" value={data.totalCitizens?.toLocaleString() || '—'} />
            <StatCard icon={AlertTriangle} title="Total Requests" value={data.totalRequests?.toLocaleString() || '—'} />
            <StatCard icon={CheckCircle2} title="Resolution Rate" value={`${(data.overallResolutionRate || 0).toFixed(1)}%`} subtitle="Across all services" />
            <StatCard icon={Wallet} title="Revenue Collected" value={`₹${(data.totalRevenue || 0).toLocaleString()}`} />
            <StatCard icon={Activity} title="Satisfaction Score" value={data.citizenSatisfactionScore > 0 ? `${data.citizenSatisfactionScore.toFixed(1)} / 5` : 'No data'} subtitle="Based on feedback" />
          </div>
        )}

        {/* Charts row */}
        {data && deptData.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Department resolution rate bar chart */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
                Resolution Rates by Department
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Resolution Rate']} />
                  <Bar dataKey="rate" radius={[4,4,0,0]}>
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Performance progress bars */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
                Department Performance Progress
              </h3>
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {deptData.map((d, i) => (
                  <PerformanceBar key={d.name} dept={d.name} rate={d.rate} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary table */}
        {data && deptData.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Department Summary Table
              </h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Department','Total Cases','Resolution Rate','Avg Turnaround'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.values(data.departmentPerformance).map((d, i) => (
                  <tr key={d.department} style={{ borderTop: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#374151' }}>{d.department}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{d.totalHandled?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: d.resolutionRate >= 75 ? '#dcfce7' : d.resolutionRate >= 50 ? '#fef9c3' : '#fee2e2',
                        color: d.resolutionRate >= 75 ? '#15803d' : d.resolutionRate >= 50 ? '#a16207' : '#dc2626',
                      }}>
                        {d.resolutionRate?.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748b' }}>
                      {d.avgTurnaroundHours > 0 ? `${d.avgTurnaroundHours}h` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && !deptData.length && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <BarChart2 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: 15, fontWeight: 500 }}>No department data available yet</p>
            <p style={{ fontSize: 13 }}>Data populates as complaints and applications are processed</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </AppShell>
  );
}
