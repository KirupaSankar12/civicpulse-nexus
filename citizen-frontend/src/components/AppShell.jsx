import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import keycloak from '../keycloak.js';
import NotificationCenter from './NotificationCenter.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Sidebar from './Sidebar.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, X } from 'lucide-react';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function AppShell({ children, title }) {
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const username = keycloak.tokenParsed?.preferred_username || 'User';
  const name     = keycloak.tokenParsed?.name || username;
  const roles    = keycloak.tokenParsed?.realm_access?.roles || [];
  const isAdmin  = roles.includes('admin') || roles.includes('ADMIN');


  return (
    <div className="flex min-h-screen w-full" style={{ background: '#e8edf4' }}>
      
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
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b-2 border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
              <h1 className="text-base font-semibold text-slate-800 dark:text-white hidden sm:block">
                {title || 'CivicPulse Nexus'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationCenter />
            
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">{username}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{name}</p>
                    <p className="text-xs leading-none text-slate-500">{username}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => keycloak.logout()} className="text-red-600 focus:text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ background: '#e8edf4' }}>
          <div className="w-full">
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
