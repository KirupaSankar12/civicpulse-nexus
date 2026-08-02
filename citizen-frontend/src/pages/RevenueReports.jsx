import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell.jsx';
import { StatCard } from '../components/StatCard.jsx';
import api from '../api.js';
import { Wallet, BarChart2, Receipt, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TYPE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'];

function formatINR(value) {
  if (!value && value !== 0) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function RevenueReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/reports/revenue')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load revenue data'))
      .finally(() => setLoading(false));
  }, []);

  const isUnavailable = data?.status === 'unavailable';

  const feeBreakdown = data?.feesByServiceType
    ? Object.entries(data.feesByServiceType)
        .filter(([, v]) => Number(v) > 0)
        .map(([type, amount], i) => ({
          name: type.replace(/_/g, ' '),
          amount: Number(amount),
          fill: TYPE_COLORS[i % TYPE_COLORS.length],
        }))
    : [];

  return (
    <AppShell title="Revenue Reports">
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 0 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Revenue Reports</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Fee collection data from service-management-service
          </p>
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
            {[1,2,3].map(i => (
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
            <Wallet size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Service-management service temporarily unreachable</p>
          </div>
        )}

        {data && !isUnavailable && !loading && (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
              <StatCard
                icon={IndianRupee}
                title="Total Fees Collected"
                value={formatINR(data.totalFeesCollected)}
                subtitle="From issued certificates"
              />
              <StatCard
                icon={Receipt}
                title="Certificates with Fees"
                value={(data.applicationsWithFeesCollected || 0).toLocaleString()}
                subtitle="Paid certificates issued"
              />
              <StatCard
                icon={BarChart2}
                title="Service Types"
                value={feeBreakdown.length}
                subtitle="With non-zero revenue"
              />
            </div>

            {/* Service type breakdown bar chart */}
            {feeBreakdown.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)', marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
                  Revenue by Certificate Type
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={feeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `₹${v}`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={v => [formatINR(v), 'Collected']} />
                    <Bar dataKey="amount" radius={[4,4,0,0]}>
                      {feeBreakdown.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Full fee breakdown table */}
            {data.feesByServiceType && Object.keys(data.feesByServiceType).length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Fee Breakdown by Service Type</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Service Type', 'Amount Collected'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.feesByServiceType).map(([type, amount]) => (
                      <tr key={type} style={{ borderTop: '1px solid #f1f5f9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                          {type.replace(/_/g, ' ')}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#10b981' }}>
                          {formatINR(amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    </AppShell>
  );
}
