import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import keycloak from '../keycloak.js';
import api from '../api.js';
import {
  Landmark, LayoutDashboard, MessageSquarePlus, List,
  FilePlus, Search, Award, User, Inbox, CheckCircle2,
  FileText, ShieldCheck, AlertTriangle, UserPlus, Users, Building,
  LogOut, Heart, Wallet, Send, BarChart2, ClipboardList, Layers,
  ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react';

// ── helpers ──────────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ── icon colour chip for the active pill ─────────────────────────────────────
const ICON_CHIP = {
  blue:    { bg: '#dbeafe', color: '#2563eb' },
  indigo:  { bg: '#e0e7ff', color: '#4338ca' },
  orange:  { bg: '#ffedd5', color: '#c2410c' },
  emerald: { bg: '#d1fae5', color: '#059669' },
  pink:    { bg: '#fce7f3', color: '#be185d' },
  violet:  { bg: '#ede9fe', color: '#6d28d9' },
  amber:   { bg: '#fef3c7', color: '#b45309' },
};

// ── per-role nav definitions (paths match App.jsx exactly) ────────────────────
const adminGroups = [
  {
    section: 'Dashboard', dot: '#60a5fa',
    links: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'System Overview', chip: 'blue', exact: true },
    ],
  },
  {
    section: 'Administration', dot: '#818cf8',
    links: [
      { to: '/admin/certificates', icon: FileText,      label: 'Certificates Setup', chip: 'indigo' },
      { to: '/admin/permits',      icon: ShieldCheck,   label: 'Permits Config',     chip: 'indigo' },
      { to: '/complaints',         icon: AlertTriangle, label: 'Global Complaints',  chip: 'orange', exact: true },
      { to: '/admin/assign',       icon: UserPlus,      label: 'Officer Assignments',chip: 'indigo' },
      { to: '/admin/officers',     icon: Users,         label: 'Manage Officers',    chip: 'indigo' },
      { to: '/admin/departments',  icon: Building,      label: 'Departments',        chip: 'indigo' },
    ],
  },
  {
    section: 'Welfare & Finance', dot: '#f472b6',
    links: [
      { to: '/welfare/dashboard',     icon: Heart,         label: 'Welfare Dashboard', chip: 'pink',    exact: true },
      { to: '/welfare/schemes',       icon: Layers,        label: 'Welfare Schemes',   chip: 'pink' },
      { to: '/welfare/beneficiaries', icon: ClipboardList, label: 'Beneficiary DB',    chip: 'pink' },
      { to: '/welfare/budgets',       icon: Wallet,        label: 'Budget Control',    chip: 'emerald' },
      { to: '/welfare/disbursements', icon: Send,          label: 'Disbursements',     chip: 'emerald' },
    ],
  },
  {
    section: 'Reports & Analytics', dot: '#a78bfa',
    links: [
      { to: '/welfare/reports', icon: BarChart2, label: 'Reports',    chip: 'violet' },
    ],
  },
];

const citizenGroups = [
  {
    section: 'Dashboard', dot: '#60a5fa',
    links: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Overview', chip: 'blue', exact: true }],
  },
  {
    section: 'Grievances', dot: '#fb923c',
    links: [
      { to: '/complaints/new', icon: MessageSquarePlus, label: 'Raise Complaint', chip: 'orange' },
      { to: '/complaints',     icon: List,              label: 'My Complaints',   chip: 'orange', exact: true },
    ],
  },
  {
    section: 'Services', dot: '#34d399',
    links: [
      { to: '/services/apply',           icon: FilePlus, label: 'Apply for Certificate', chip: 'emerald' },
      { to: '/services/tracker',         icon: Search,   label: 'Track Application',    chip: 'emerald' },
      { to: '/services/my-certificates', icon: Award,    label: 'My Certificates',      chip: 'emerald' },
    ],
  },
  {
    section: 'Welfare', dot: '#f472b6',
    links: [
      { to: '/welfare/apply',           icon: Heart,         label: 'Apply for Welfare',    chip: 'pink' },
      { to: '/welfare/my-applications', icon: ClipboardList, label: 'Welfare Applications', chip: 'pink' },
    ],
  },
  {
    section: 'Account', dot: '#a78bfa',
    links: [{ to: '/profile', icon: User, label: 'Profile Settings', chip: 'violet' }],
  },
];

const officerGroups = [
  {
    section: 'Dashboard', dot: '#60a5fa',
    links: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', chip: 'blue', exact: true }],
  },
  {
    section: 'My Work', dot: '#fb923c',
    links: [
      { to: '/officer',                    icon: Inbox,        label: 'Assigned Complaints',   chip: 'orange' },
      { to: '/services/officer/dashboard', icon: CheckCircle2, label: 'Assigned Certificates', chip: 'emerald' },
      { to: '/welfare/verify',             icon: ShieldCheck,  label: 'Welfare Verification',  chip: 'pink' },
    ],
  },
];

const approverGroups = [
  {
    section: 'Dashboard', dot: '#60a5fa',
    links: [{ to: '/welfare/dashboard', icon: LayoutDashboard, label: 'Welfare Dashboard', chip: 'blue', exact: true }],
  },
  {
    section: 'Approvals', dot: '#fbbf24',
    links: [
      { to: '/welfare/approve',       icon: ShieldCheck, label: 'Approval Queue',   chip: 'amber' },
      { to: '/welfare/beneficiaries', icon: Users,       label: 'All Applications', chip: 'amber' },
      { to: '/welfare/reports',       icon: BarChart2,   label: 'Welfare Reports',  chip: 'violet' },
    ],
  },
];

const financeGroups = [
  {
    section: 'Dashboard', dot: '#60a5fa',
    links: [{ to: '/welfare/dashboard', icon: LayoutDashboard, label: 'Welfare Dashboard', chip: 'blue', exact: true }],
  },
  {
    section: 'Finance', dot: '#34d399',
    links: [
      { to: '/welfare/budgets',       icon: Wallet,    label: 'Budget Management', chip: 'emerald' },
      { to: '/welfare/disbursements', icon: Send,      label: 'Fund Distribution', chip: 'emerald' },
      { to: '/welfare/disburse',      icon: Send,      label: 'Disburse Funds',    chip: 'emerald' },
      { to: '/welfare/reports',       icon: BarChart2, label: 'Welfare Reports',   chip: 'violet' },
    ],
  },
];

// ── role badge colours (for the bottom profile card) ─────────────────────────
const ROLE_BADGE = {
  Administrator:    { bg: '#ede9fe', color: '#6d28d9' },
  'Finance Officer':{ bg: '#d1fae5', color: '#065f46' },
  Approver:         { bg: '#fef3c7', color: '#92400e' },
  'Field Officer':  { bg: '#ffedd5', color: '#9a3412' },
  Citizen:          { bg: '#dbeafe', color: '#1e40af' },
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed = false, onToggleCollapse }) {
  const location = useLocation();
  const navContainerRef = useRef(null);

  // Preserve scroll position across page transitions
  useEffect(() => {
    const el = navContainerRef.current;
    if (!el) return;
    
    // Restore scroll position
    const savedScroll = sessionStorage.getItem('sidebarScrollY');
    if (savedScroll) {
      el.scrollTop = parseInt(savedScroll, 10);
    }

    // Save scroll position with debouncing
    let timeout;
    const handleScroll = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.setItem('sidebarScrollY', el.scrollTop);
      }, 50);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  // ── auth / user info ───────────────────────────────────────────────────────
  const roles    = keycloak.tokenParsed?.realm_access?.roles || [];
  const isAdmin  = roles.includes('admin') || roles.includes('ADMIN');
  const isFinance = roles.includes('FINANCE_OFFICER') || roles.includes('finance_officer');
  const isApprover = roles.includes('APPROVER') || roles.includes('approver') || roles.includes('AUTHORITY') || roles.includes('authority');
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer') || roles.includes('DEPARTMENT_OFFICER') || roles.includes('department_officer');

  const username  = keycloak.tokenParsed?.preferred_username || 'User';
  const name      = keycloak.tokenParsed?.name || username;

  const [officerDept, setOfficerDept] = useState('');

  useEffect(() => {
    if (isOfficer) {
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
      
      let dept = keycloak.tokenParsed?.department || OFFICER_DEPT_MAP[username.toLowerCase()] || '';
      if (dept) setOfficerDept(dept);

      api.get('/service-management-service/api/officers')
        .then(res => {
          const officers = res.data || [];
          const me = officers.find(o => o.username?.toLowerCase() === username.toLowerCase());
          if (me && me.department) {
            setOfficerDept(me.department);
          }
        })
        .catch(e => console.error('Failed to fetch officer dept for sidebar', e));
    }
  }, [isOfficer, username]);

  let roleLabel = isAdmin ? 'Administrator'
    : isFinance  ? 'Finance Officer'
    : isApprover ? 'Approver'
    : isOfficer  ? (officerDept ? officerDept.replace('Department', 'Officer').trim() : 'Field Officer')
    : 'Citizen';

  const navGroups = isAdmin   ? adminGroups
    : isFinance  ? financeGroups
    : isApprover ? approverGroups
    : isOfficer  ? officerGroups
    : citizenGroups;

  const badge = ROLE_BADGE[roleLabel] || ROLE_BADGE.Citizen;
  const initials = getInitials(name);

  // ── widths ─────────────────────────────────────────────────────────────────
  const W = collapsed ? 64 : 240;

  return (
    <aside
      style={{
        width: W,
        minWidth: W,
        maxWidth: W,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#f1f5f9',
        borderRight: '2px solid #cbd5e1',
        boxShadow: '3px 0 16px rgba(15,23,42,0.10)',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* ── Logo Header ─────────────────────────────────────────────────────── */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '0 14px' : '0 16px',
        borderBottom: '2px solid #cbd5e1',
        background: '#ffffff',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Icon */}
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(99,102,241,0.35)',
        }}>
          <Landmark size={16} color="#fff" />
        </div>

        {/* Wordmark (hidden when collapsed) */}
        {!collapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              CivicPulse Nexus
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>
              Government Portal
            </div>
          </div>
        )}
      </div>

      {/* ── Nav Groups (scrollable) ──────────────────────────────────────────── */}
      <div 
        ref={navContainerRef}
        style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: collapsed ? '12px 8px' : '12px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        scrollbarWidth: 'thin',
        scrollbarColor: '#e2e8f0 transparent',
      }}>
        {navGroups.map((group, gi) => (
          <div key={group.section}>
            {/* ── Section divider + label ── */}
            {!collapsed && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: gi === 0 ? '4px 6px 8px' : '20px 6px 8px',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: group.dot,
                  display: 'inline-block', flexShrink: 0,
                  boxShadow: `0 0 0 3px ${group.dot}44`,
                }} />
                <span style={{
                  fontSize: 10, fontWeight: 800, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                }}>
                  {group.section}
                </span>
                <div style={{ flex: 1, height: 1.5, background: '#cbd5e1', borderRadius: 1 }} />
              </div>
            )}

            {/* collapsed: just a divider line between sections (not first) */}
            {collapsed && gi > 0 && (
              <div style={{ height: 1.5, background: '#cbd5e1', margin: '8px 4px' }} />
            )}

            {/* ── Nav links ── */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive = link.exact
                  ? location.pathname === link.to
                  : location.pathname === link.to || location.pathname.startsWith(link.to + '/');
                const chip = ICON_CHIP[link.chip] || ICON_CHIP.blue;

                return (
                  <NavLink
                    key={link.to + link.label}
                    to={link.to}
                    end={!!link.exact}
                    title={collapsed ? link.label : undefined}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: collapsed ? '8px 6px' : '8px 10px',
                      borderRadius: 9,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      background: isActive ? '#1e293b' : 'transparent',
                      boxShadow: isActive ? '0 2px 8px rgba(15,23,42,0.18)' : 'none',
                      transition: 'background 0.15s, box-shadow 0.15s',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#e2e8f0'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Icon chip */}
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isActive ? chip.bg : '#dde3ec',
                        border: isActive ? 'none' : '1px solid #c8d0dc',
                        transition: 'background 0.15s',
                      }}>
                        <Icon
                          size={14}
                          color={isActive ? chip.color : '#94a3b8'}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </div>

                      {/* Label (hidden when collapsed) */}
                      {!collapsed && (
                        <span style={{
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 600,
                          color: isActive ? '#ffffff' : '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1,
                          lineHeight: 1.3,
                          transition: 'color 0.15s',
                        }}>
                          {link.label}
                        </span>
                      )}

                      {/* Active dot indicator (collapsed only) */}
                      {collapsed && isActive && (
                        <span style={{
                          position: 'absolute', right: 4, top: '50%',
                          transform: 'translateY(-50%)',
                          width: 4, height: 4, borderRadius: '50%',
                          background: chip.color,
                        }} />
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* ── Bottom: Profile card + Collapse toggle ──────────────────────────── */}
      <div style={{
        flexShrink: 0,
        borderTop: '2px solid #cbd5e1',
        background: '#ffffff',
        padding: collapsed ? '10px 8px' : '10px',
      }}>
        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            gap: 6,
            padding: '6px 8px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#94a3b8',
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 8,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {!collapsed && <span style={{ fontSize: 11 }}>Collapse</span>}
          {collapsed
            ? <ChevronRight size={15} />
            : <ChevronLeft size={15} />}
        </button>

        {/* Profile card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '8px 4px' : '10px 10px',
          borderRadius: 10,
          background: '#f1f5f9',
          border: '1.5px solid #cbd5e1',
          cursor: 'pointer',
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'background 0.15s',
          position: 'relative',
          boxShadow: '0 1px 4px rgba(15,23,42,0.07)',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          onClick={() => keycloak.logout()}
          title={collapsed ? `${name} — ${roleLabel} (click to sign out)` : undefined}
        >
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 700,
            boxShadow: '0 0 0 2px #fff, 0 0 0 3px rgba(99,102,241,0.3)',
          }}>
            {initials}
          </div>

          {/* Name + role (expanded only) */}
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#0f172a',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {username}
                </div>
                <span style={{
                  display: 'inline-block', marginTop: 2,
                  fontSize: 10, fontWeight: 600, borderRadius: 4,
                  padding: '1px 6px',
                  background: badge.bg, color: badge.color,
                }}>
                  {roleLabel}
                </span>
              </div>
              <ChevronDown size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            </>
          )}
        </div>

        {/* Sign-out hint (expanded only) */}
        {!collapsed && (
          <button
            onClick={() => keycloak.logout()}
            style={{
              width: '100%', marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '6px', borderRadius: 8,
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 12, fontWeight: 500, color: '#ef4444',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={13} />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
