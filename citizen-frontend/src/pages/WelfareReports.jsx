import { useEffect, useState } from 'react';
import api from '../api.js';
import AppShell from '../components/AppShell.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import { Users, Layers, Wallet, TrendingUp, Download, Printer, BarChart2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

function fmt(n) {
  if (!n) return '₹0';
  return '₹' + Number(n).toLocaleString('en-IN');
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '18px 22px',
      border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 160px',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function WelfareReports() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/welfare-service/api/welfare/dashboard/stats')
      .then(r => { setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const exportCSV = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) + '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBudgetReport = () => {
    const rows = stats?.budgetByDepartment
      ? Object.entries(stats.budgetByDepartment).map(([dept, amount]) => ({ Department: dept, AllocatedAmount: amount }))
      : [];
    exportCSV('welfare_budget_report.csv', rows);
  };

  const handleExportBeneficiaryReport = () => {
    const rows = stats?.beneficiariesByScheme
      ? Object.entries(stats.beneficiariesByScheme).map(([scheme, count]) => ({ SchemeName: scheme, TotalBeneficiaries: count }))
      : [];
    exportCSV('welfare_beneficiary_report.csv', rows);
  };

  const handleExportPaymentReport = () => {
    const rows = (stats?.recentDisbursements || []).map(d => ({
      TransactionID: d.transactionId,
      Amount: d.amount,
      PaymentMode: d.paymentMode,
      PaymentStatus: d.paymentStatus,
      ApprovedBy: d.approvedBy,
      Date: d.disbursedDate
    }));
    exportCSV('welfare_payment_report.csv', rows);
  };

  if (loading) {
    return (
      <AppShell title="Welfare Reports">
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', margin: '0 auto 12px',
            border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ color: '#64748b', fontSize: 14 }}>Loading reports…</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </AppShell>
    );
  }

  const budgetPieData = stats?.budgetByDepartment
    ? Object.entries(stats.budgetByDepartment).map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  const beneficiaryBarData = stats?.beneficiariesByScheme
    ? Object.entries(stats.beneficiariesByScheme).map(([name, count]) => ({ name, count }))
    : [];

  const monthlyData = {};
  (stats?.recentDisbursements || []).forEach(d => {
    if (d.disbursedDate) {
      const month = d.disbursedDate.substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    }
  });
  const lineData = Object.entries(monthlyData).sort().map(([month, count]) => ({ month, count }));

  const chartTickColor = isDark ? '#94a3b8' : '#6b7280';
  const gridColor = isDark ? '#334155' : '#e5e7eb';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipTextColor = isDark ? '#f8fafc' : '#111827';
  const tooltipBorder = isDark ? '#334155' : '#e5e7eb';

  const CardWrap = ({ title, children }) => (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0',
      boxShadow: '0 2px 12px rgba(15,23,42,0.07)', overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '2px solid #f1f5f9', background: '#fafbfc' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{title}</h3>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );

  const btnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 8, background: '#fff', color: '#475569', fontSize: 13, fontWeight: 700,
    border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.12s'
  };

  return (
    <AppShell title="Welfare Reports & Analytics">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139,92,246,0.35)',
            }}>
              <BarChart2 size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Government Executive Reports
              </h1>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0, marginTop: 2 }}>
                Download official CSV reports or generate printable summary documents.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleExportBudgetReport} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <Download size={15} /> Budget CSV
            </button>
            <button onClick={handleExportBeneficiaryReport} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <Download size={15} /> Beneficiary CSV
            </button>
            <button onClick={handleExportPaymentReport} style={btnStyle} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <Download size={15} /> Payment CSV
            </button>
            <button onClick={() => window.print()} style={{ ...btnStyle, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(139,92,246,0.35)' }}>
              <Printer size={15} /> Print Report
            </button>
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <StatCard icon={Users} title="Total Beneficiaries" value={stats?.totalBeneficiaries ?? 0} color="#3b82f6" />
          <StatCard icon={Layers} title="Total Schemes" value={stats?.totalSchemes ?? 0} color="#ec4899" />
          <StatCard icon={Wallet} title="Total Budget" value={fmt(stats?.totalBudgetAllocated)} color="#10b981" />
          <StatCard icon={TrendingUp} title="Utilization" value={`${Number(stats?.overallUtilizationPercent || 0).toFixed(1)}%`} color="#f59e0b" />
        </div>

        {/* ── Charts Grid ──────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
          
          <CardWrap title="Budget Allocation by Department">
            {budgetPieData.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: 40 }}>No budget data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={budgetPieData} cx="50%" cy="50%" outerRadius={105} dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false} style={{ fontSize: 11, fontWeight: 600 }}>
                    {budgetPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipTextColor, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, fontSize: 13, fontWeight: 600 }} formatter={v => [fmt(v), 'Allocated']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardWrap>

          <CardWrap title="Beneficiaries by Scheme">
            {beneficiaryBarData.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: 40 }}>No beneficiary data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={beneficiaryBarData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: chartTickColor }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: chartTickColor, fontWeight: 600 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipTextColor, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, fontSize: 13, fontWeight: 600 }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardWrap>
        </div>

        <CardWrap title="Disbursements Over Time (Monthly)">
          {lineData.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: 40 }}>No disbursement data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartTickColor, fontWeight: 600 }} tickMargin={10} />
                <YAxis tick={{ fontSize: 11, fill: chartTickColor, fontWeight: 600 }} tickMargin={10} />
                <RechartsTooltip contentStyle={{ backgroundColor: tooltipBg, color: tooltipTextColor, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, fontSize: 13, fontWeight: 600 }} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardWrap>

      </div>
    </AppShell>
  );
}
