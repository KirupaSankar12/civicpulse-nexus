import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import keycloak from '../keycloak.js';
import NotificationCenter from './NotificationCenter.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Sidebar from './Sidebar.jsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, X, User, ShieldCheck, ChevronRight, Bell, Sparkles } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function AppShell({ children, title }) {
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const username = keycloak.tokenParsed?.preferred_username || 'User';
  const name     = keycloak.tokenParsed?.name || username;
  const email    = keycloak.tokenParsed?.email || username;
  const roles    = keycloak.tokenParsed?.realm_access?.roles || [];
  const isAdmin  = roles.includes('admin') || roles.includes('ADMIN');
  const isOfficer = roles.includes('OFFICER') || roles.includes('officer');
  
  const roleTitle = isAdmin ? 'System Administrator' : (isOfficer ? 'Government Officer' : 'Verified Citizen');

  return (
    <div className="flex min-h-screen w-full" style={{ background: 'var(--bg)' }}>
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar – desktop always visible, mobile slide-in overlay */}
      <div className={`fixed inset-y-0 left-0 z-50 flex shrink-0 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Mobile close button */}
        <div className="absolute right-[-40px] top-3 lg:hidden z-10">
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 sm:px-10 lg:px-16 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex h-5 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
              <h1 className="text-base font-bold text-slate-800 dark:text-white hidden sm:block tracking-tight">
                {title || 'CivicPulse Nexus'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 mr-8 sm:mr-14 lg:mr-24 pr-6 sm:pr-12 lg:pr-20">
            <ThemeToggle />
            <NotificationCenter />
            
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1.5 sm:mx-2.5" />
            
            {/* Ultra-Premium User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700/80 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 mr-6 sm:mr-10 lg:mr-12"
                  style={{ marginRight: '40px' }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-xs">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[140px] truncate hidden sm:block">{username}</span>
                </button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="end" 
                style={{
                  width: 300,
                  maxWidth: 'calc(100vw - 32px)',
                  marginTop: 10,
                  padding: 0,
                  borderRadius: 20,
                  background: 'var(--surface, #ffffff)',
                  border: '1px solid var(--border, #cbd5e1)',
                  boxShadow: '0 20px 40px -10px rgba(15,23,42,0.25)',
                  overflow: 'hidden',
                  zIndex: 1000
                }}
              >
                {/* Header Card */}
                <div style={{
                  background: '#0f172a',
                  padding: '20px',
                  color: '#ffffff',
                  borderBottom: '1px solid #1e293b'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ffffff', fontSize: 16, fontWeight: 900,
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                      border: '2px solid rgba(255,255,255,0.2)'
                    }}>
                      {getInitials(name)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                        {name}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 3, fontFamily: 'monospace' }}>
                        {email}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(16,185,129,0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16,185,129,0.3)',
                          padding: '3px 10px',
                          borderRadius: 8,
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}>
                          {roleTitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Links Menu */}
                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      background: 'transparent', transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg, #f8fafc)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #0f172a)' }}>Profile Settings</span>
                    </div>
                    <ChevronRight size={16} color="var(--text-secondary, #94a3b8)" />
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={() => navigate('/notifications')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      background: 'transparent', transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg, #f8fafc)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={16} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #0f172a)' }}>Notifications Feed</span>
                    </div>
                    <ChevronRight size={16} color="var(--text-secondary, #94a3b8)" />
                  </DropdownMenuItem>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>
                    <ShieldCheck size={14} color="#10b981" />
                    <span>Keycloak SSO Active & Multi-Factor Protected</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border, #f1f5f9)', padding: 12 }}>
                  <button
                    type="button"
                    onClick={() => keycloak.logout()}
                    style={{
                      width: '100%', padding: '11px', borderRadius: 12,
                      background: 'rgba(239,68,68,0.1)', color: '#dc2626',
                      border: '1px solid rgba(239,68,68,0.25)',
                      fontSize: 13, fontWeight: 800, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '0 2px 8px rgba(239,68,68,0.1)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
                  >
                    <LogOut size={15} color="#dc2626" />
                    Sign Out of Account
                  </button>
                </div>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10" style={{ background: 'var(--bg)' }}>
          <div className="w-full pt-5 sm:pt-6 px-1 sm:px-3">
            <div className="mb-5 sm:hidden">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {title || 'CivicPulse Nexus'}
              </h1>
            </div>
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}

export default AppShell;
