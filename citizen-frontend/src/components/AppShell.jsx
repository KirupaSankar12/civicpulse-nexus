import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import keycloak from '../keycloak.js';
import NotificationCenter from './NotificationCenter.jsx';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function AppShell({ children, title }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'premium');

  useEffect(() => {
    if (theme === 'basic') {
      document.body.classList.add('theme-basic');
    } else {
      document.body.classList.remove('theme-basic');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'premium' ? 'basic' : 'premium';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  const isCitizen = roles.includes('CITIZEN') || roles.includes('citizen');
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer');
  const isAdmin = roles.includes('admin') || roles.includes('ADMIN');
  const username = keycloak.tokenParsed?.preferred_username || 'User';
  const name = keycloak.tokenParsed?.name || username;

  const citizenLinks = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/complaints/new', icon: '➕', label: 'Raise Complaint' },
    { to: '/complaints', icon: '📋', label: 'My Complaints' },
    { to: '/services/apply', icon: '📜', label: 'Apply for Certificate' },
    { to: '/services/tracker', icon: '🔍', label: 'Track Application' },
    { to: '/profile', icon: '👤', label: 'My Profile' },
  ];

  const officerLinks = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/officer', icon: '📋', label: 'Assigned Complaints' },
    { to: '/services/approvals', icon: '✅', label: 'Service Approvals' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: '📊', label: 'Admin Dashboard' },
    { to: '/complaints', icon: '📋', label: 'All Complaints' },
    { to: '/admin/assign', icon: '👥', label: 'Assign Officers' },
    { to: '/admin/officers', icon: '🧑‍💼', label: 'Manage Officers' },
    { to: '/admin/departments', icon: '🏢', label: 'Departments' },
    { to: '/services/approvals', icon: '✅', label: 'Service Approvals' },
  ];

  const links = isAdmin ? adminLinks : isOfficer ? officerLinks : citizenLinks;
  const roleLabel = isAdmin ? 'Administrator' : isOfficer ? 'Field Officer' : 'Citizen';
  const roleColor = isAdmin ? '#e74c3c' : isOfficer ? '#f39c12' : '#27ae60';

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-text">
            <div className="logo-icon">🏛️</div>
            <div>
              <div>CivicPulse</div>
              <div style={{ fontSize: '10px', opacity: '0.5', fontWeight: '400' }}>Nexus Platform</div>
            </div>
          </div>
        </div>

        <div className="sidebar-section-label">Navigation</div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              end={link.to === '/dashboard'}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(name)}</div>
            <div className="sidebar-user-info">
              <div className="name">{name}</div>
              <span className="role-badge" style={{ background: roleColor + '33', color: roleColor }}>
                {roleLabel}
              </span>
            </div>
          </div>
          <button className="btn-logout-sidebar" onClick={() => keycloak.logout()}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">{title || 'CivicPulse Nexus'}</div>
          <div className="topbar-right">
            <button 
              onClick={toggleTheme} 
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '12.5px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                marginRight: '8px'
              }}
            >
              {theme === 'premium' ? '🔵 Switch to Basic UI' : '🎨 Switch to Premium UI'}
            </button>
            <NotificationCenter />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
                {getInitials(name)}
              </div>
              {username}
            </div>
          </div>
        </div>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

export default AppShell;
