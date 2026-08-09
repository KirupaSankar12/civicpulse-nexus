import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import OfficerDashboard from './OfficerDashboard.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ReportPageHeader, KpiCard, SectionCard, GLOBAL_STYLES } from '../components/ReportShared.jsx';
import { 
  FileText, Clock, CheckCircle2, PenSquare, 
  List, FilePlus, Search, User, Phone, Inbox,
  AlertTriangle, FileBadge, Gift, Heart, Settings,
  Landmark, ArrowRight, ShieldCheck, Check, Sparkles, Award, ChevronRight, Zap
} from 'lucide-react';

const CITIZEN_MENU = [
  {
    category: 'Grievances',
    subtitle: 'Lodge & track civic complaints',
    icon: AlertTriangle,
    color: '#ef4444',
    bg: '#fef2f2',
    darkBg: 'rgba(239,68,68,0.15)',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    links: [
      { to: '/complaints/new', label: 'Raise Complaint', icon: PenSquare, desc: 'File new civic issue' },
      { to: '/complaints', label: 'My Complaints', icon: List, desc: 'Track resolution status' }
    ]
  },
  {
    category: 'Services',
    subtitle: 'Certificates & municipal permits',
    icon: FileBadge,
    color: '#3b82f6',
    bg: '#eff6ff',
    darkBg: 'rgba(59,130,246,0.15)',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    links: [
      { to: '/services/apply', label: 'Apply for Certificate', icon: FilePlus, desc: 'Birth, Income, Caste' },
      { to: '/services/tracker', label: 'Track Application', icon: Search, desc: 'Live status tracker' },
      { to: '/services/my-certificates', label: 'My Certificates', icon: Award, desc: 'Download issued PDFs' }
    ]
  },
  {
    category: 'Welfare',
    subtitle: 'Direct benefit transfer programs',
    icon: Gift,
    color: '#10b981',
    bg: '#f0fdf4',
    darkBg: 'rgba(16,185,129,0.15)',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    links: [
      { to: '/welfare/apply', label: 'Apply for Welfare', icon: Heart, desc: 'Scholarship & pension' },
      { to: '/welfare/my-applications', label: 'Welfare Applications', icon: FileText, desc: 'DBT payment status' }
    ]
  },
  {
    category: 'Account',
    subtitle: 'Personal profile & credentials',
    icon: User,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    darkBg: 'rgba(139,92,246,0.15)',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    links: [
      { to: '/profile', label: 'Profile Settings', icon: Settings, desc: 'Keycloak credentials' }
    ]
  }
];

const STATUS_MAP = {
  NEW:        { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', darkBg: 'rgba(37,99,235,0.15)', darkText: '#60a5fa' },
  ASSIGNED:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', darkBg: 'rgba(234,88,12,0.15)', darkText: '#fb923c' },
  IN_PROGRESS:{ bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe', darkBg: 'rgba(29,78,216,0.15)', darkText: '#93c5fd' },
  RESOLVED:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', darkBg: 'rgba(22,163,74,0.15)', darkText: '#4ade80' },
  CLOSED:     { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', darkBg: '#334155', darkText: '#94a3b8' },
  REJECTED:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', darkBg: 'rgba(220,38,38,0.15)', darkText: '#f87171' },
};

function StatusBadge({ status, isDark }) {
  const m = STATUS_MAP[status] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', darkBg: '#334155', darkText: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 20,
      background: isDark ? m.darkBg : m.bg, color: isDark ? m.darkText : m.text,
      border: `1px solid ${isDark ? m.darkBg : m.border}`,
      fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDark ? m.darkText : m.text }} />
      {status || '—'}
    </span>
  );
}

function Dashboard() {
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isCitizen = roles.includes('CITIZEN') || roles.includes('citizen');
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer') || roles.includes('DEPARTMENT_OFFICER') || roles.includes('department_officer');
  const isAdmin = roles.includes('admin') || roles.includes('ADMIN');
  const isFinanceOfficer = roles.includes('FINANCE_OFFICER') || roles.includes('finance_officer');
  const isApprover = roles.includes('APPROVER') || roles.includes('approver') || roles.includes('AUTHORITY') || roles.includes('authority');

  if (isFinanceOfficer || isApprover) return <Navigate to="/welfare/dashboard" replace />;
  if (isAdmin) return <AdminDashboard />;
  if (isOfficer) return <OfficerDashboard />;
  return <CitizenDashboard />;
}

/* ==================== CITIZEN DASHBOARD ==================== */
function CitizenDashboard() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const citizenId = keycloak.tokenParsed?.sub;
  const username = keycloak.tokenParsed?.preferred_username || 'Citizen';
  const name = keycloak.tokenParsed?.name || username;
  const firstName = name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/grievance-service/api/complaints');
      const own = res.data.filter(c => c.citizenId === citizenId);
      setMyComplaints(own);
    } catch (e) {
      console.error("Failed to load citizen complaints", e);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    loadData();
  }, [citizenId]);

  const pending = myComplaints.filter(c => !['RESOLVED','CLOSED'].includes(c.status)).length;
  const resolved = myComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  if (loading && !myComplaints.length) {
    return (
      <AppShell title="Citizen Overview">
        <PageLoader message="Loading your citizen portal..." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Citizen Overview">
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '12px 0 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* ── Premium Welcome Hero Banner ───────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 20, padding: '32px 36px', color: '#ffffff',
          boxShadow: '0 15px 35px rgba(15, 23, 42, 0.25)', border: '1px solid #334155',
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24
        }}>
          {/* Glowing Background Orbs */}
          <div style={{ position: 'absolute', top: -80, right: -40, width: 280, height: 280, background: '#3b82f6', opacity: 0.15, borderRadius: '50%', filter: 'blur(50px)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: 150, width: 200, height: 200, background: '#10b981', opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
            <span style={{ 
              background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)',
              padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', display: 'inline-block' 
            }}>
              CIVICPULSE NEXUS · CITIZEN PORTAL
            </span>
            <h2 style={{ margin: '14px 0 8px', fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Welcome back, {firstName}
            </h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 15, lineHeight: 1.6 }}>
              Access municipal grievances, certificate issuance, and welfare benefit transfer programs from your unified smart portal.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/complaints/new" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff', border: 'none', padding: '12px 22px',
                borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <PenSquare size={16} /> Raise Complaint
              </button>
            </Link>

            <Link to="/services/apply" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 22px',
                borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(4px)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FilePlus size={16} /> Apply Certificate
              </button>
            </Link>
          </div>
        </div>

        {/* ── KPI Stat Cards ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <KpiCard icon={FileText} label="Total Complaints Filed" value={myComplaints.length} color="#3b82f6" bg="#eff6ff" isDark={isDark} />
          <KpiCard icon={Clock} label="Pending Resolution" value={pending} subtitle="In department queue" color="#f59e0b" bg="#fff7ed" isDark={isDark} />
          <KpiCard icon={CheckCircle2} label="Resolved Grievances" value={resolved} subtitle="Successfully closed" color="#10b981" bg="#f0fdf4" isDark={isDark} />
          <KpiCard icon={Sparkles} label="Active Services" value="Certificates & Welfare" subtitle="Full portal access" color="#8b5cf6" bg="#f5f3ff" isDark={isDark} />
        </div>

        {/* ── 4 Premium Portal Category Cards Grid ─────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {CITIZEN_MENU.map((menu, i) => {
            const IconComp = menu.icon;
            return (
              <div
                key={i}
                style={{
                  background: isDark ? '#0f172a' : '#ffffff',
                  borderRadius: 18,
                  border: `1.5px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                  padding: 24,
                  display: 'flex', flexDirection: 'column', gap: 18,
                  boxShadow: '0 4px 16px rgba(15,23,42,0.03)',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                {/* Top Color Accent Strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: menu.gradient }} />

                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: isDark ? menu.darkBg : menu.bg,
                    color: menu.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <IconComp size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: isDark ? '#f1f5f9' : '#0f172a' }}>
                      {menu.category}
                    </h3>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, fontWeight: 600 }}>
                      {menu.subtitle}
                    </div>
                  </div>
                </div>

                {/* Action Links List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {menu.links.map((link, j) => {
                    const LinkIcon = link.icon;
                    return (
                      <Link
                        key={j} to={link.to}
                        style={{
                          textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 18px', borderRadius: 12,
                          background: isDark ? '#1e293b' : '#f8fafc',
                          border: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = isDark ? '#334155' : '#eff6ff';
                          e.currentTarget.style.borderColor = menu.color;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = isDark ? '#1e293b' : '#f8fafc';
                          e.currentTarget.style.borderColor = isDark ? '#334155' : '#f1f5f9';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: isDark ? menu.darkBg : menu.bg,
                            color: menu.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <LinkIcon size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                              {link.label}
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                              {link.desc}
                            </div>
                          </div>
                        </div>

                        <ChevronRight size={18} color="#94a3b8" />
                      </Link>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

        {/* ── Recent Complaints Section Card ───────────────────────────────── */}
        <SectionCard
          title="Recent Complaints & Live Tracker"
          subtitle="Track history and response times for your filed civic issues"
          icon={Clock}
          isDark={isDark}
          action={
            <Link to="/complaints" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`, background: isDark ? '#1e293b' : '#fff', color: isDark ? '#38bdf8' : '#2563eb', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                View All Complaints →
              </button>
            </Link>
          }
        >
          <div style={{ overflowX: 'auto', margin: '-20px -22px', marginTop: '-20px', marginBottom: '-20px' }}>
            {myComplaints.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <Inbox size={48} color="#94a3b8" style={{ margin: '0 auto 14px' }} />
                <div style={{ fontSize: 16, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 6 }}>No complaints filed yet</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Lodge a civic complaint to request municipal department intervention</div>
                <Link to="/complaints/new" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none',
                    padding: '10px 24px', borderRadius: 10, fontWeight: 800,
                    fontSize: 13, cursor: 'pointer', display: 'inline-flex',
                    alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                  }}>
                    <PenSquare size={16} /> Raise Your First Complaint
                  </button>
                </Link>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: isDark ? '#0f172a' : '#f8fafc', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Complaint ID</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title & Department</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myComplaints.slice(0, 5).map(c => (
                    <tr key={c.complaintId} style={{ borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }} onMouseEnter={e => e.currentTarget.style.background = isDark ? '#0f172a' : '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px', fontSize: 12, fontFamily: 'monospace', color: '#3b82f6', fontWeight: 800 }}>
                        #{c.complaintId?.slice(0, 8)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#f1f5f9' : '#0f172a' }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{c.department}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={c.status} isDark={isDark} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <Link to={`/complaints/${c.complaintId}`}>
                          <button style={{
                            background: isDark ? '#334155' : '#f8fafc', border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                            padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, color: isDark ? '#f1f5f9' : '#0f172a', cursor: 'pointer'
                          }}>Inspect Case →</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </SectionCard>

      </div>
      <style>{`${GLOBAL_STYLES}`}</style>
    </AppShell>
  );
}

export default Dashboard;
