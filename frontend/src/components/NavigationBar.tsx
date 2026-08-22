import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Files,
  TriangleAlert,
  FileText,
  Activity,
  ShieldCheck,
  UserCircle,
  Settings,
  Search,
  Menu,
  X,
  LockKeyhole
} from 'lucide-react';

interface NavigationBarProps {
  onOpenCommandPalette: () => void;
  pendingEscalationsCount?: number;
  isLedgerVerified?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  onOpenCommandPalette,
  pendingEscalationsCount = 7,
  isLedgerVerified = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Cases', path: '/cases/CASE-10482', icon: Files },
    {
      label: 'Escalations',
      path: '/escalations',
      icon: TriangleAlert,
      badge: pendingEscalationsCount
    },
    { label: 'Reports', path: '/reports/CASE-10482', icon: FileText },
    { label: 'Ops', path: '/ops', icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/85 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <NavLink to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-600 p-[1px] shadow-lg shadow-emerald-500/10 group-hover:shadow-emerald-500/25 transition-all">
                <div className="w-full h-full bg-[#0B0F17] rounded-[7px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-anton tracking-wider text-xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  CONSENSUS<span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono -mt-1">
                  Governance Layer
                </span>
              </div>
            </NavLink>
          </div>

          {/* CENTER: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'text-white bg-slate-800/70 shadow-inner border border-slate-700/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  ) : null}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full shadow-[0_0_8px_rgba(100,230,165,0.8)]" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* RIGHT: Telemetry Status & Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            


            {/* Quick Command Search Button */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs transition-all duration-200 group"
              title="Search cases or tools (Cmd/Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              <span className="hidden xl:inline text-slate-300 font-medium">Search</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Profile & Settings Link */}
            <div className="flex items-center space-x-2">
              <NavLink
                to="/settings"
                className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title="Governance Settings"
              >
                <Settings className="w-4 h-4" />
              </NavLink>

              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <UserCircle className="w-7 h-7 text-slate-400" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">Risk Officer</span>
                  <span className="text-[10px] text-slate-400 font-mono">RBAC Active</span>
                </div>
              </div>
            </div>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={onOpenCommandPalette}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-md bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0F17] border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">


          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}

          <NavLink
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Settings</span>
          </NavLink>
        </div>
      )}
    </header>
  );
};
