import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ReportPageHeader, KpiCard, SectionCard, GLOBAL_STYLES } from '../components/ReportShared.jsx';
import {
  AlertCircle, FileText, Search, List, Inbox, CheckCircle2, Clock, ShieldAlert,
  ArrowRight, Award, UserCheck, Layers, FileCheck, RefreshCw, AlertTriangle
} from 'lucide-react';

const OFFICER_DEPT_MAP = {
  john: 'Health Department',
  mark: 'Revenue Department',
  ryan: 'Municipal Corporation',
  chris: 'Water Department',
  ethan: 'Roads Department',
  jack: 'Electricity Department',
  david: 'Sanitation Department',
  will: 'Urban Planning Department'
};

function certStatusVariant(status) {
  if (['SUBMITTED', 'RESUBMITTED'].includes(status)) return { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };
  if (status === 'UNDER_VERIFICATION') return { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe' };
  if (['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(status)) return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
  return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
}

function compStatusVariant(status) {
  if (['NEW', 'ASSIGNED'].includes(status)) return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
  if (status === 'IN_PROGRESS') return { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe' };
  if (status === 'CLOSED') return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
}

function OfficerDashboard() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [certStats, setCertStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [officerDept, setOfficerDept] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const navigate = useNavigate();

  const username = keycloak.tokenParsed?.preferred_username || 'Officer';
  const name = keycloak.tokenParsed?.name || username;

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, recentRes, complaintsRes] = await Promise.allSettled([
        api.get('/service-management-service/api/services/officer/stats'),
        api.get('/service-management-service/api/services/officer/recent'),
        api.get('/grievance-service/api/complaints/officer?size=50')
      ]);
      
      if (statsRes.status === 'fulfilled') setCertStats(statsRes.value.data);
      if (recentRes.status === 'fulfilled') setRecentApps(recentRes.value.data || []);
      if (complaintsRes.status === 'fulfilled') {
        setComplaints(complaintsRes.value.data.content || complaintsRes.value.data || []);
      }
      
      let dept = keycloak.tokenParsed?.department || OFFICER_DEPT_MAP[username.toLowerCase()] || 'Municipal Department';
      setOfficerDept(dept);
      
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pendingApps = recentApps.filter(app => ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status));
  const pendingComplaints = complaints.filter(c => !['RESOLVED', 'CLOSED'].includes(c.status));
  const resolvedComplaints = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status));
  const approvedApps = recentApps.filter(app => ['APPROVED', 'CERTIFICATE_GENERATED', 'DOWNLOADED'].includes(app.status));

  const totalCases = complaints.length + recentApps.length;
  const totalResolved = resolvedComplaints.length + approvedApps.length;
  const resolutionRate = totalCases > 0 ? Math.round((totalResolved / totalCases) * 100) : 100;

  if (isLoading && !recentApps.length && !complaints.length) {
    return <AppShell title="Officer Operations Command"><PageLoader message="Loading Officer Workspace..." /></AppShell>;
  }

  return (
    <AppShell title="Officer Operations Command">
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '12px 0 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <ReportPageHeader
          title={`${officerDept || 'Department'} Operations Command`}
          subtitle={`Officer: ${name} (@${username}) — Real-time verification queue and escalation dispatch`}
          icon={UserCheck}
          iconBg="linear-gradient(135deg, #0f172a, #334155)"
          iconColor="#38bdf8"
          isDark={isDark}
          lastRefresh={lastRefresh}
          onRefresh={fetchDashboardData}
          refreshing={isLoading}
        />

        {/* ── KPI Stat Cards ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <KpiCard icon={FileText} label="Pending Applications" value={pendingApps.length} subtitle="Requires officer verification" color="#3b82f6" bg="#eff6ff" isDark={isDark} />
          <KpiCard icon={AlertTriangle} label="Active Complaints" value={pendingComplaints.length} subtitle="Grievance SLA queue" color="#f59e0b" bg="#fff7ed" isDark={isDark} />
          <KpiCard icon={CheckCircle2} label="Cases Resolved" value={totalResolved} subtitle="Certificates & complaints" color="#10b981" bg="#f0fdf4" isDark={isDark} />
          <KpiCard icon={Award} label="Overall Resolution Rate" value={`${resolutionRate}%`} subtitle="Performance compliance" color="#8b5cf6" bg="#f5f3ff" isDark={isDark} />
        </div>

        {/* ── Quick Action Command Hub ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          
          <div
            onClick={() => navigate('/services/officer/dashboard')}
            style={{
              background: isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              borderRadius: 16, border: `1.5px solid ${isDark ? '#334155' : '#bfdbfe'}`, padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.08)', transition: 'transform 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f1f5f9' : '#1e3a8a' }}>Certificate Verification</div>
                <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#2563eb', marginTop: 2 }}>{pendingApps.length} Pending Approval</div>
              </div>
            </div>
            <ArrowRight size={18} color="#3b82f6" />
          </div>

          <div
            onClick={() => navigate('/officer/assignments')}
            style={{
              background: isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              borderRadius: 16, border: `1.5px solid ${isDark ? '#334155' : '#fed7aa'}`, padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245,158,11,0.08)', transition: 'transform 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <List size={22} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f1f5f9' : '#7c2d12' }}>Assigned Grievances</div>
                <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#d97706', marginTop: 2 }}>{pendingComplaints.length} Active SLA Items</div>
              </div>
            </div>
            <ArrowRight size={18} color="#f59e0b" />
          </div>

          <div
            onClick={() => navigate('/services/officer/welfare/dashboard')}
            style={{
              background: isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              borderRadius: 16, border: `1.5px solid ${isDark ? '#334155' : '#bbf7d0'}`, padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16,185,129,0.08)', transition: 'transform 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={22} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: isDark ? '#f1f5f9' : '#064e3b' }}>Welfare Queue</div>
                <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#059669', marginTop: 2 }}>Department Sanction Pipeline</div>
              </div>
            </div>
            <ArrowRight size={18} color="#10b981" />
          </div>

        </div>

        {/* ── Two Column Workstation ────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          
          {/* LEFT: Pending Certificate Verifications */}
          <SectionCard
            title="Certificate Verification Queue"
            subtitle="Applications awaiting digital signature clearance"
            icon={FileText}
            isDark={isDark}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentApps.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No certificate applications assigned to your department.
                </div>
              ) : (
                recentApps.slice(0, 5).map(app => {
                  const badgeStyle = certStatusVariant(app.status);
                  const isPending = ['SUBMITTED', 'RESUBMITTED', 'UNDER_VERIFICATION'].includes(app.status);

                  return (
                    <div
                      key={app.applicationId}
                      style={{
                        padding: '16px 18px', borderRadius: 12,
                        background: isDark ? '#0f172a' : '#f8fafc',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: '#3b82f6' }}>{app.applicationNumber}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                            background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`
                          }}>
                            {app.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', marginTop: 4 }}>
                          {app.applicantName}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                          {app.serviceType?.replace(/_/g, ' ')} · Applied: {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/services/officer/verify/${app.applicationId}`)}
                        style={{
                          padding: '8px 14px', borderRadius: 8, border: 'none',
                          background: isPending ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : (isDark ? '#334155' : '#e2e8f0'),
                          color: isPending ? '#fff' : (isDark ? '#f1f5f9' : '#475569'),
                          fontSize: 12, fontWeight: 800, cursor: 'pointer',
                          boxShadow: isPending ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
                        }}
                      >
                        {isPending ? 'Verify / Approve' : 'View'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>

          {/* RIGHT: Active Grievances Queue */}
          <SectionCard
            title="Active Grievances Queue"
            subtitle="Citizen complaints assigned to field officer"
            icon={List}
            isDark={isDark}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {complaints.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No complaints currently assigned to your queue.
                </div>
              ) : (
                complaints.slice(0, 5).map(c => {
                  const badgeStyle = compStatusVariant(c.status);
                  return (
                    <div
                      key={c.complaintId}
                      style={{
                        padding: '16px 18px', borderRadius: 12,
                        background: isDark ? '#0f172a' : '#f8fafc',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a' }}>{c.title}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
                            background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`
                          }}>
                            {c.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                          Dept: <strong>{c.department || officerDept}</strong> · Priority: <strong style={{ color: c.priority === 'HIGH' ? '#ef4444' : '#f59e0b' }}>{c.priority || 'NORMAL'}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/complaints/${c.complaintId}`)}
                        style={{
                          padding: '8px 14px', borderRadius: 8,
                          border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
                          background: isDark ? '#334155' : '#fff',
                          color: isDark ? '#f1f5f9' : '#0f172a',
                          fontSize: 12, fontWeight: 800, cursor: 'pointer'
                        }}
                      >
                        Inspect Case
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>

        </div>

      </div>
      <style>{`${GLOBAL_STYLES}`}</style>
    </AppShell>
  );
}

export default OfficerDashboard;
