import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import api from '../api.js';
import { Activity, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DEPT_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#06b6d4','#f97316'];

function PerformanceBadge({ rate }) {
  const isGood = rate >= 85;
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: isGood ? '#dcfce7' : '#fef9c3',
      color: isGood ? '#15803d' : '#a16207',
    }}>
      {isGood ? '✓ Good' : '⚠ Needs Attention'}
    </span>
  );
}

export default function PerformanceReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/reports/performance')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load performance data'))
      .finally(() => setLoading(false));
  }, []);

  const depts = data?.departmentPerformance
    ? Object.values(data.departmentPerformance)
    : [];

  const chartData = depts.map((d, i) => ({
    name: (d.department || 'Unknown').replace(' Department','').replace(' Dept',''),
    rate: Math.round(d.resolutionRate * 10) / 10,
    total: d.totalHandled,
    fill: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  return (
    <AppShell title="Performance Reports">
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 0 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Performance Reports</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Department performance metrics and resolution rates
          </p>
        </div>

        {/* Overall resolution rate stat */}
        {data?.overallResolutionRate != null && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: '16px 24px', borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
              <div style={{ padding: 10, borderRadius: 10, background: '#e0e7ff' }}>
                <TrendingUp size={22} color="#4f46e5" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Overall Resolution Rate</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                  {(data.overallResolutionRate).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 120, borderRadius: 12, background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {data?.grievanceDataUnavailable && !loading && (
          <div style={{ padding: '10px 16px', borderRadius: 8, background: '#fef9c3', border: '1px solid #fde047', color: '#713f12', fontSize: 13, marginBottom: 16 }}>
            ⚠️ Grievance service is temporarily unreachable. Performance data may be incomplete.
          </div>
        )}

        {/* Department cards */}
        {depts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}>
            {depts.map((dept, i) => {
              const rate = dept.resolutionRate || 0;
              const color = rate >= 85 ? '#10b981' : rate >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <div key={dept.department} style={{
                  background: '#fff', borderRadius: 14, padding: 20,
                  border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{dept.department}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{(dept.totalHandled || 0).toLocaleString()} cases handled</div>
                    </div>
                    <PerformanceBadge rate={rate} />
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Resolution Rate</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{rate.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 9999 }}>
                      <div style={{ width: `${Math.min(100, rate)}%`, height: '100%', borderRadius: 9999, background: color, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                  {dept.avgTurnaroundHours > 0 && (
                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Clock size={11} />
                      Avg turnaround: {dept.avgTurnaroundHours}h
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bar chart */}
        {chartData.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
              Department Resolution Rate Comparison
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={v => [`${v}%`, 'Resolution Rate']} />
                <Bar dataKey="rate" radius={[4,4,0,0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && depts.length === 0 && !error && (
          <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' }}>
            <Activity size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No department performance data yet</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Data populates as complaints are resolved by departments</p>
          </div>
        )}

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    </AppShell>
  );
}
