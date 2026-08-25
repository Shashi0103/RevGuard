import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  RefreshCw,
  Cpu,
  Receipt,
  BarChart3,
  FileText,
  Settings,
  Menu,
  X,
  Play,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return <div className="min-h-screen bg-background text-slate-100">{children}</div>;
  }

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Recovery Queue', path: '/recovery', icon: RefreshCw },
        { label: 'Agent Console', path: '/agent', icon: Cpu }
      ]
    },
    {
      label: 'Operations',
      items: [
        { label: 'Transactions', path: '/transactions', icon: Receipt },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Audit Logs', path: '/audit', icon: FileText }
      ]
    },
    {
      label: 'System',
      items: [
        { label: 'Settings & Demo', path: '/settings', icon: Settings }
      ]
    }
  ];

  const handleQuickAgentRun = () => {
    setIsAgentRunning(true);
    setTimeout(() => {
      setIsAgentRunning(false);
      navigate('/agent');
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-background text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-border sticky top-0 h-screen z-30">
        {/* Logo Header */}
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-wider text-slate-100 flex items-center gap-1">
              REV<span className="text-amber-400">GUARD</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-tight">AI REVENUE RECOVERY AGENT</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="px-3 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">{group.label}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Demo Mode</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ON
            </span>
          </div>
          <button
            onClick={handleQuickAgentRun}
            disabled={isAgentRunning}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAgentRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Run Recovery Agent
          </button>
        </div>
      </aside>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-surface-hover rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>Merchant:</span>
              <span className="font-semibold text-slate-200">Acme Commerce India</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
              <span className="text-slate-400">ENV:</span>
              <span className="font-bold text-amber-400">TEST</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              AGENT ACTIVE
            </div>

            <Link
              to="/"
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
            >
              <span>Landing Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface border-b border-border p-4 space-y-4">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase px-2">{group.label}</div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-surface-hover"
                    >
                      <Icon className="w-4 h-4 text-amber-400" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
