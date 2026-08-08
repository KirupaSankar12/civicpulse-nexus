import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api.js';
import keycloak from '../keycloak.js';
import AppShell from '../components/AppShell.jsx';
import PageLoader from '../components/PageLoader.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import OfficerDashboard from './OfficerDashboard.jsx';
import { 
  FileText, Clock, CheckCircle2, PenSquare, 
  List, FilePlus, Search, User, Phone, Inbox,
  AlertTriangle, FileBadge, Gift, Heart, Settings
} from 'lucide-react';

const CITIZEN_MENU = [
  {
    category: 'Grievances',
    icon: AlertTriangle,
    color: '#ef4444',
    bg: '#fef2f2',
    links: [
      { to: '/complaints/new', label: 'Raise Complaint', icon: PenSquare },
      { to: '/complaints', label: 'My Complaints', icon: List }
    ]
  },
  {
    category: 'Services',
    icon: FileBadge,
    color: '#3b82f6',
    bg: '#eff6ff',
    links: [
      { to: '/services/apply', label: 'Apply for Certificate', icon: FilePlus },
      { to: '/services/tracker', label: 'Track Application', icon: Search },
      { to: '/services/my-certificates', label: 'My Certificates', icon: FileText }
    ]
  },
  {
    category: 'Welfare',
    icon: Gift,
    color: '#10b981',
    bg: '#f0fdf4',
    links: [
      { to: '/welfare/apply', label: 'Apply for Welfare', icon: Heart },
      { to: '/welfare/my-applications', label: 'Welfare Applications', icon: FileText }
    ]
  },
  {
    category: 'Account',
    icon: User,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    links: [
      { to: '/profile', label: 'Profile Settings', icon: Settings }
    ]
  }
];

// ── colour maps ───────────────────────────────────────────────────────────────
const STATUS_MAP = {
  NEW:        { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  ASSIGNED:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  IN_PROGRESS:{ bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  RESOLVED:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  CLOSED:     { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  REJECTED:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

function StatusBadge({ status }) {
  const m = STATUS_MAP[status] || { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      background: m.bg, color: m.text,
      border: `1px solid ${m.border}`,
      fontSize: 11, fontWeight: 700,
    }}>
      {status || '—'}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      background: 'var(--surface, #ffffff)', borderRadius: 14, padding: '18px 22px',
      border: '1.5px solid var(--border, #e2e8f0)', boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 160px',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text, #0f172a)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #64748b)', marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
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
  const [stats, setStats] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const citizenId = keycloak.tokenParsed?.sub;
  const name = keycloak.tokenParsed?.name || keycloak.tokenParsed?.preferred_username || 'Citizen';

  useEffect(() => {
    Promise.all([
      api.get('/grievance-service/api/complaints/dashboard/stats'),
      api.get('/grievance-service/api/complaints')
    ])
      .then(([statsRes, complaintsRes]) => {
        setStats(statsRes.data);
        const own = complaintsRes.data.filter(c => c.citizenId === citizenId);
        setMyComplaints(own);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [citizenId]);

  const pending = myComplaints.filter(c => !['RESOLVED','CLOSED'].includes(c.status)).length;
  const resolved = myComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  if (loading) return (
    <AppShell title="Overview">
      <PageLoader message="Loading your dashboard..." />
    </AppShell>
  );

  return (
    <AppShell title="Overview">
      <div style={{ width: '100%', maxWidth: '100%', padding: '0 24px 40px 24px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* ── Welcome Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
        borderRadius: 16, padding: '32px', color: '#fff',
        display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 10px 25px rgba(37,99,235,0.3)',
        marginBottom: 30, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, background: '#60a5fa', opacity: 0.2, borderRadius: '50%', filter: 'blur(50px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ 
            background: 'rgba(255,255,255,0.15)', color: '#dbeafe', border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', display: 'inline-block' 
          }}>
            CITIZEN PORTAL
          </span>
          <h2 style={{ margin: '14px 0 8px', fontSize: 32, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Welcome back, {name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1)}
          </h2>
          <p style={{ margin: 0, color: '#bfdbfe', maxWidth: 600, fontSize: 15, lineHeight: 1.6 }}>
            Track your civic complaints, apply for certificates, and monitor your welfare applications from one unified dashboard.
          </p>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 12 }}>
          <Link to="/complaints/new" style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#fff', color: '#1e40af', border: 'none', padding: '12px 24px',
              borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <PenSquare size={18} /> Raise Complaint
            </button>
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 30, flexWrap: 'wrap' }}>
        <StatCard icon={FileText} label="Total Complaints Filed" value={myComplaints.length} color="#3b82f6" />
        <StatCard icon={Clock} label="Pending Resolution" value={pending} color="#f59e0b" />
        <StatCard icon={CheckCircle2} label="Resolved Issues" value={resolved} color="#10b981" />
      </div>

      {/* ── Services Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        {CITIZEN_MENU.map((menu, i) => (
          <div key={i} style={{
            background: 'var(--surface, #ffffff)', borderRadius: 16, padding: 20,
            border: '1px solid var(--border, #e2e8f0)', boxShadow: '0 4px 12px rgba(15,23,42,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: menu.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <menu.icon size={22} color={menu.color} />
              </div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text, #0f172a)' }}>{menu.category}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {menu.links.map((link, j) => (
                <Link key={j} to={link.to} style={{ 
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 10, background: 'var(--bg, #f8fafc)', color: 'var(--text, #475569)',
                  fontSize: 14, fontWeight: 600, transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border, #f1f5f9)'; e.currentTarget.style.color = menu.color; e.currentTarget.style.borderColor = menu.bg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg, #f8fafc)'; e.currentTarget.style.color = 'var(--text, #475569)'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        <div style={{ background: 'var(--surface, #ffffff)', borderRadius: 16, border: '1px solid var(--border, #e2e8f0)', boxShadow: '0 2px 8px rgba(15,23,42,0.04)', overflow: 'hidden', gridColumn: 'span 2' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text, #0f172a)' }}>Recent Complaints</span>
            <Link to="/complaints" style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>View All</Link>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            {myComplaints.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <Inbox size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary, #64748b)', marginBottom: 16 }}>No complaints filed yet</div>
                <Link to="/complaints/new" style={{ textDecoration: 'none' }}>
                  <button style={{
                    background: '#3b82f6', color: '#fff', border: 'none',
                    padding: '10px 22px', borderRadius: 8, fontWeight: 600,
                    fontSize: 14, cursor: 'pointer', display: 'inline-flex',
                    alignItems: 'center', gap: 6,
                  }}>
                    <PenSquare size={15} /> Raise your first complaint
                  </button>
                </Link>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg, #f8fafc)', borderBottom: '1px solid var(--border, #e2e8f0)' }}>
                    <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>ID</th>
                    <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>Title & Dept</th>
                    <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myComplaints.slice(0, 5).map(c => (
                    <tr key={c.complaintId} style={{ borderBottom: '1px solid var(--border, #e2e8f0)' }}>
                      <td style={{ padding: '16px 20px', fontSize: 13, fontFamily: 'monospace', color: '#3b82f6', fontWeight: 600 }}>{c.complaintId?.slice(0, 8)}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #0f172a)' }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary, #64748b)', marginTop: 4 }}>{c.department}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <StatusBadge status={c.status} />
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <Link to={`/complaints/${c.complaintId}`}>
                          <button style={{
                            background: 'var(--bg, #f8fafc)', border: '1px solid var(--border, #e2e8f0)', padding: '6px 12px',
                            borderRadius: 6, fontWeight: 600, fontSize: 12, color: 'var(--text, #0f172a)', cursor: 'pointer'
                          }}>View</button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      </div>
    </AppShell>
  );
}

export default Dashboard;
