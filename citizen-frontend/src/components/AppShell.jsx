import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import keycloak from '../keycloak.js';
import NotificationCenter from './NotificationCenter.jsx';
import { 
  Landmark, LayoutDashboard, MessageSquarePlus, List, 
  FilePlus, Search, Award, User, Inbox, CheckCircle2, 
  FileText, AlertTriangle, UserPlus, Users, Building, 
  LogOut, Menu 
} from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function AppShell({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isCitizen = roles.includes('CITIZEN') || roles.includes('citizen');
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer');
  const isAdmin = roles.includes('admin') || roles.includes('ADMIN');
  const username = keycloak.tokenParsed?.preferred_username || 'User';
  const name = keycloak.tokenParsed?.name || username;

  const citizenLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/complaints/new', icon: MessageSquarePlus, label: 'Raise Complaint' },
    { to: '/complaints', icon: List, label: 'My Complaints' },
    { to: '/services/apply', icon: FilePlus, label: 'Apply for Certificate' },
    { to: '/services/tracker', icon: Search, label: 'Track Application' },
    { to: '/services/my-certificates', icon: Award, label: 'My Certificates' },
    { to: '/profile', icon: User, label: 'My Profile' },
  ];

  const officerLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/officer', icon: Inbox, label: 'Assigned Complaints' },
    { to: '/services/officer/dashboard', icon: CheckCircle2, label: 'Assigned Certificates' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/admin/applications', icon: FileText, label: 'Certificates Admin' },
    { to: '/complaints', icon: AlertTriangle, label: 'All Complaints' },
    { to: '/admin/assign', icon: UserPlus, label: 'Assign Officers' },
    { to: '/admin/officers', icon: Users, label: 'Manage Officers' },
    { to: '/admin/departments', icon: Building, label: 'Departments' },
  ];

  const links = isAdmin ? adminLinks : isOfficer ? officerLinks : citizenLinks;
  const roleLabel = isAdmin ? 'Administrator' : isOfficer ? 'Field Officer' : 'Citizen';
  const roleColorClass = isAdmin ? 'bg-red-50 text-red-700' : isOfficer ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700';

  return (
    <div className="app-shell" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', display: 'flex' }}>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`} style={{ width: 'var(--sidebar-w)', backgroundColor: 'var(--color-white)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', zIndex: 50, transition: 'transform 0.3s ease' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex' }}>
              <Landmark size={24} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-text-primary)' }}>CivicPulse Nexus</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Smart Governance Platform</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', fontWeight: 600, padding: '0 12px', marginBottom: '12px' }}>Navigation</div>
          <nav aria-label="Main navigation" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  end={link.to === '/dashboard'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    textDecoration: 'none', fontWeight: isActive ? 600 : 500, transition: 'all 0.2s'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span>{link.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
              {getInitials(name)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <div style={{ fontSize: '12px', padding: '2px 8px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginTop: '4px', ...getRoleStyles(roleLabel) }}>
                {roleLabel}
              </div>
            </div>
          </div>
          <button 
            onClick={() => keycloak.logout()} 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-white)', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-danger-light)'; e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.borderColor = 'var(--color-danger-light)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-white)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 'var(--sidebar-w)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin 0.3s ease' }} className="main-content">
        <header style={{ height: 'var(--header-h)', backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              className="menu-toggle-btn"
            >
              <Menu size={24} />
            </button>
            <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-text-primary)' }}>{title || 'CivicPulse Nexus'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <NotificationCenter />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 12px 4px 4px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px' }}>
                {getInitials(name)}
              </div>
              <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>{username}</span>
            </div>
          </div>
        </header>

        <div style={{ padding: 'var(--space-3)', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function getRoleStyles(role) {
  if (role === 'Administrator') return { backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)' };
  if (role === 'Field Officer') return { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' };
  return { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' };
}

export default AppShell;
