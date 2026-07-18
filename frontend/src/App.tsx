import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Incidents } from './pages/Incidents';
import { Settings } from './pages/Settings';
import { ChatPage } from './pages/ChatPage';
import { NavigatePage } from './pages/NavigatePage';
import { FanHome } from './pages/FanHome';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './stores/authStore';
import {
  LayoutDashboard, AlertTriangle, MessageSquare,
  Navigation, Home, Settings as SettingsIcon,
  ChevronLeft, ChevronRight, LogIn, LogOut,
} from 'lucide-react';
import { cn } from './utils/cn';
import { useCrowdStore } from './stores/crowdStore';

// ── Protected Route Guard ────────────────────────────────────
// Redirects to /login if user is not authenticated
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// ── Nav Items ────────────────────────────────────────────────

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  group: 'noc' | 'fan';
}

const FAN_NAV_ITEMS: NavItem[] = [
  { to: '/fan', label: 'Fan Home', icon: <Home className="h-5 w-5" />, group: 'fan' },
  { to: '/chat', label: 'AI Chat', icon: <MessageSquare className="h-5 w-5" />, group: 'fan' },
  { to: '/navigate', label: 'Navigate', icon: <Navigation className="h-5 w-5" />, group: 'fan' },
];

const STAFF_NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, group: 'noc' },
  { to: '/incidents', label: 'Incidents', icon: <AlertTriangle className="h-5 w-5" />, group: 'noc' },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon className="h-5 w-5" />, group: 'noc' },
];

// ── App ──────────────────────────────────────────────────────

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const overallStatus = useCrowdStore((s) => s.getOverallStatus());

  // Login page renders full-screen without the app shell
  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  const statusColor = overallStatus === 'critical' ? 'bg-red-500' : overallStatus === 'degraded' ? 'bg-amber-500' : 'bg-emerald-500';

  // Combine nav items: fans always see fan items; staff items only if authenticated
  const visibleNavItems = isAuthenticated
    ? [...STAFF_NAV_ITEMS.filter(n => n.to !== '/settings'), ...FAN_NAV_ITEMS]
    : FAN_NAV_ITEMS;

  return (
    <div className="h-screen bg-slate-950 text-slate-50 flex overflow-hidden">
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <aside className={cn(
        'hidden md:flex flex-col bg-slate-900/50 border-r border-slate-800/60 shrink-0 transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[220px]'
      )}>
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-600/20 shrink-0">
            AI
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-100 truncate">StadiumAI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn('h-1.5 w-1.5 rounded-full', statusColor)} />
                <span className="text-[10px] text-slate-500 uppercase font-medium">
                  {overallStatus}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto custom-scrollbar">
          {/* Staff Group — only visible when authenticated */}
          {isAuthenticated && (
            <>
              {!collapsed && <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-3 pt-2 pb-1">Operations</p>}
              {STAFF_NAV_ITEMS.filter(n => n.to !== '/settings').map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
                    collapsed && 'justify-center',
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </>
          )}

          {/* Fan Group — always visible */}
          {!collapsed && <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-3 pt-4 pb-1">Fan Services</p>}
          {collapsed && isAuthenticated && <div className="h-px bg-slate-800 mx-2 my-2" />}
          {FAN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-blue-600/15 text-blue-400 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800/60 p-2 space-y-1">
          {/* Settings — staff only */}
          {isAuthenticated && (
            <NavLink
              to="/settings"
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-blue-600/15 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
              title={collapsed ? 'Settings' : undefined}
            >
              <SettingsIcon className="h-5 w-5" />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          )}

          {/* Login/Logout toggle */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </button>
          ) : (
            <NavLink
              to="/login"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-blue-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
              title={collapsed ? 'Staff Login' : undefined}
            >
              <LogIn className="h-4 w-4" />
              {!collapsed && <span>Staff Login</span>}
            </NavLink>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors cursor-pointer"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4 mx-auto" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden bg-slate-900/80 border-b border-slate-800/60 px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center font-bold text-white text-xs">AI</div>
          <h1 className="text-sm font-bold text-slate-100">StadiumAI</h1>
          <div className="ml-auto flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', statusColor)} />
            <span className="text-[10px] text-slate-400 uppercase">{overallStatus}</span>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col bg-grid">
          <Routes>
            {/* Public fan routes — no auth required */}
            <Route path="/" element={<FanHome />} />
            <Route path="/fan" element={<FanHome />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/navigate" element={<NavigatePage />} />

            {/* Staff routes — auth required */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Catch-all: send to fan home */}
            <Route path="*" element={<Navigate to="/fan" replace />} />
          </Routes>
        </main>

        {/* Mobile bottom nav — only show fan items for unauth'd, all for staff */}
        <nav className="md:hidden bg-slate-900/90 border-t border-slate-800/60 flex shrink-0">
          {visibleNavItems.filter(n => n.to !== '/settings' && n.to !== '/fan').map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-blue-400' : 'text-slate-500'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default App;
