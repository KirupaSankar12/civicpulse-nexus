import { useEffect, useState, useCallback } from 'react';
import AppShell from '../components/AppShell.jsx';
import api from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  Users, AlertTriangle, Award, Heart, BarChart2,
  RefreshCw, CheckCircle2, Wifi, WifiOff, Activity, Landmark,
} from 'lucide-react';
import { ReportPageHeader, GLOBAL_STYLES } from '../components/ReportShared.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// Individual milestone card component
// ─────────────────────────────────────────────────────────────────────────────
function MilestoneCard({ title, milestone, icon: Icon, color, bg, items, loading, unavailable, isDark }) {
  return (
    <div style={{
      background: isDark ? '#1e293b' : '#fff',
      borderRadius: 16, padding: 24,
      border: `1.5px solid ${unavailable ? (isDark ? '#854d0e' : '#fde047') : (isDark ? '#334155' : '#e2e8f0')}`,
      boxShadow: unavailable
        ? (isDark ? '0 4px 20px rgba(234,179,8,0.05)' : '0 4px 20px rgba(234,179,8,0.12)')
        : '0 4px 20px rgba(15,23,42,0.07)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 30px rgba(15,23,42,0.12)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=unavailable?(isDark ? '0 4px 20px rgba(234,179,8,0.05)' : '0 4px 20px rgba(234,179,8,0.12)'):'0 4px 20px rgba(15,23,42,0.07)'; }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '16px 16px 0 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, marginTop: 4 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
            {milestone}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>{title}</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
      </div>

      {unavailable && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: '#fef9c3', border: '1px solid #fde047', marginBottom: 12 }}>
          <WifiOff size={13} color={isDark ? '#fde047' : '#a16207'} />
          <span style={{ fontSize: 12, color: isDark ? '#fde047' : '#a16207', fontWeight: 600 }}>Service temporarily unreachable</span>
        </div>
      )}

      {loading && !unavailable && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 16, borderRadius: 6, background: isDark ? '#334155' : '#f1f5f9', animation: 'shimmer 1.4s infinite' }} />)}
        </div>
      )}

      {!loading && items && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>{value ?? '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Center hub card
// ─────────────────────────────────────────────────────────────────────────────
function CenterHubCard({ health, loading, isDark }) {
  return (
    <div style={{
      background: isDark ? '#1e293b' : '#fff',
      borderRadius: 20, padding: 32,
      border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
      gridColumn: 'span 1', alignSelf: 'stretch', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Subtle background glow */}
      <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 120, height: 120, background: '#6366f1', opacity: isDark ? 0.15 : 0.05, filter: 'blur(30px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: 48, height: 48, borderRadius: 14, background: isDark ? '#334155' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, zIndex: 1 }}>
        <Landmark size={24} color="#6366f1" />
      </div>
      
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4, zIndex: 1 }}>
        Governance Command
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.02em', marginBottom: 24, zIndex: 1 }}>
        CivicPulse Nexus
      </div>

      {/* System health indicator */}
      <div style={{ width: '100%', padding: '16px 20px', borderRadius: 14, background: isDark ? '#0f172a' : '#fafbfc', border: `1px solid ${isDark ? '#1e293b' : '#f1f5f9'}`, zIndex: 1 }}>
        {loading ? (
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Computing health…</div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>System Health</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: health >= 75 ? '#10b981' : health >= 50 ? '#f59e0b' : '#ef4444', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {health?.toFixed(1) ?? '—'}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: health >= 75 ? '#10b981' : health >= 50 ? '#f59e0b' : '#ef4444', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b' }}>
                {health >= 75 ? 'Optimal' : health >= 50 ? 'Degraded' : 'Attention Needed'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main GovernanceCommand page
// ─────────────────────────────────────────────────────────────────────────────
export default function GovernanceCommand() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [grievance, setGrievance]   = useState(null);
  const [certs, setCerts]           = useState(null);
  const [welfare, setWelfare]       = useState(null);
  const [governance, setGovernance] = useState(null);

  const [loadingStates, setLoadingStates] = useState({ grievance: true, certs: true, welfare: true, governance: true });
  const [unavail, setUnavail]             = useState({ grievance: false, certs: false, welfare: false, governance: false });

  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchAll = useCallback(() => {
    setLoadingStates({ grievance: true, certs: true, welfare: true, governance: true });
    setUnavail({ grievance: false, certs: false, welfare: false, governance: false });

    // M1: Grievance stats
    api.get('/api/complaints/dashboard/stats')
      .then(r => setGrievance(r.data))
      .catch(() => setUnavail(u => ({ ...u, grievance: true })))
      .finally(() => setLoadingStates(s => ({ ...s, grievance: false })));

    // M2: Certificate stats
    api.get('/api/services/dashboard/stats')
      .then(r => setCerts(r.data))
      .catch(() => setUnavail(u => ({ ...u, certs: true })))
      .finally(() => setLoadingStates(s => ({ ...s, certs: false })));

    // M3: Welfare stats
    api.get('/api/welfare/dashboard/stats')
      .then(r => setWelfare(r.data))
      .catch(() => setUnavail(u => ({ ...u, welfare: true })))
      .finally(() => setLoadingStates(s => ({ ...s, welfare: false })));

    // M4: Governance summary
    api.get('/api/reports/governance/summary')
      .then(r => setGovernance(r.data))
      .catch(() => setUnavail(u => ({ ...u, governance: true })))
      .finally(() => { setLoadingStates(s => ({ ...s, governance: false })); setLastRefresh(new Date()); });
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Compute composite health score — average of available resolution/utilization rates
  const computeHealth = () => {
    const rates = [];
    if (grievance?.resolutionRate != null) rates.push(grievance.resolutionRate);
    if (certs?.resolutionRate != null)     rates.push(certs.resolutionRate);
    if (welfare?.overallUtilizationPercent != null) rates.push(welfare.overallUtilizationPercent);
    if (governance?.overallResolutionRate != null)  rates.push(governance.overallResolutionRate);
    if (rates.length === 0) return null;
    return rates.reduce((a, b) => a + b, 0) / rates.length;
  };

  const anyLoading = Object.values(loadingStates).some(Boolean);
  const health = computeHealth();

  return (
    <AppShell title="Governance Command">
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 0 40px' }}>

        {/* Header */}
        <ReportPageHeader
          title="Governance Command Center"
          subtitle="Integrated view of all 4 milestones"
          icon={Landmark}
          iconBg="linear-gradient(135deg, #0f172a, #334155)"
          iconColor="#38bdf8"
          isDark={isDark}
          lastRefresh={lastRefresh}
          onRefresh={fetchAll}
          refreshing={anyLoading}
        />

        {/* Hub-and-spoke grid (2 × 2 + center = 5 cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20, marginBottom: 28,
        }}>
          {/* Row 1: M1 — Grievance (left), M4 center (center), M2 — Certs (right) */}
          <MilestoneCard
            title="Citizen Management"
            milestone="Milestone 1 — Grievance"
            icon={AlertTriangle}
            color="#f97316"
            bg="#fff7ed"
            loading={loadingStates.grievance}
            unavailable={unavail.grievance}
            isDark={isDark}
            items={grievance ? [
              { label: 'Total Complaints', value: (grievance.totalComplaints || 0).toLocaleString() },
              { label: 'Resolved', value: (grievance.resolvedComplaints || 0).toLocaleString() },
              { label: 'Resolution Rate', value: `${(grievance.resolutionRate || 0).toFixed(1)}%` },
              { label: 'Overdue', value: (grievance.overdueComplaints || 0).toLocaleString() },
            ] : null}
          />

          {/* Center: Governance Command hub */}
          <CenterHubCard health={health} loading={anyLoading} isDark={isDark} />

          <MilestoneCard
            title="Certificate Management"
            milestone="Milestone 2 — Services"
            icon={Award}
            color="#3b82f6"
            bg="#eff6ff"
            loading={loadingStates.certs}
            unavailable={unavail.certs}
            isDark={isDark}
            items={certs ? [
              { label: 'Total Applications', value: (certs.totalApplications || 0).toLocaleString() },
              { label: 'Certificates Issued', value: (certs.certificatesIssued || 0).toLocaleString() },
              { label: 'Pending', value: (certs.pending || 0).toLocaleString() },
              { label: 'Resolution Rate', value: `${(certs.resolutionRate || 0).toFixed(1)}%` },
            ] : null}
          />

          {/* Row 2: M3 — Welfare (left), empty (center), M4 — Analytics (right) */}
          <MilestoneCard
            title="Welfare & Budget"
            milestone="Milestone 3 — Welfare"
            icon={Heart}
            color="#10b981"
            bg="#f0fdf4"
            loading={loadingStates.welfare}
            unavailable={unavail.welfare}
            isDark={isDark}
            items={welfare ? [
              { label: 'Beneficiaries', value: (welfare.totalBeneficiaries || 0).toLocaleString() },
              { label: 'Amount Disbursed', value: welfare.totalDisbursed != null ? `₹${Number(welfare.totalDisbursed).toLocaleString('en-IN')}` : '—' },
              { label: 'Budget Utilization', value: `${(welfare.overallUtilizationPercent || 0).toFixed(1)}%` },
            ] : null}
          />

          {/* Empty center-bottom cell — intentional for hub layout */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
              <Activity size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>CONNECTED</div>
            </div>
          </div>

          <MilestoneCard
            title="Governance Analytics"
            milestone="Milestone 4 — Reporting"
            icon={BarChart2}
            color="#8b5cf6"
            bg="#f5f3ff"
            loading={loadingStates.governance}
            unavailable={unavail.governance}
            isDark={isDark}
            items={governance ? [
              { label: 'Total Citizens', value: (governance.totalCitizens || 0).toLocaleString() },
              { label: 'Citizen Satisfaction', value: governance.citizenSatisfactionScore > 0 ? `${governance.citizenSatisfactionScore.toFixed(1)} / 5 ★` : 'No data yet' },
              { label: 'Revenue Collected', value: `₹${Number(governance.totalRevenue || 0).toLocaleString('en-IN')}` },
              { label: 'Overall Resolution', value: `${(governance.overallResolutionRate || 0).toFixed(1)}%` },
            ] : null}
          />
        </div>

        {/* Tech stack footer */}
        <div style={{
          textAlign: 'center', padding: '18px 24px',
          borderRadius: 14, background: isDark ? '#1e293b' : '#f8fafc',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            Technology Stack
          </div>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
            React &nbsp;·&nbsp; Java &nbsp;·&nbsp; Spring Boot &nbsp;·&nbsp; PostgreSQL &nbsp;·&nbsp; Kafka &nbsp;·&nbsp; Kubernetes
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: '#cbd5e1' }}>
            CivicPulse Nexus · All 4 Milestones Integrated · Smart Governance Platform
          </div>
        </div>
      </div>

      <style>{`
        ${GLOBAL_STYLES}
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
      `}</style>
    </AppShell>
  );
}
