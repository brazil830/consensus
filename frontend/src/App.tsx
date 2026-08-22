import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GrainOverlay } from './components/GrainOverlay';
import { NavigationBar } from './components/NavigationBar';
import { CommandPalette } from './components/CommandPalette';
import { ToastProvider } from './components/NotificationToast';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { EscalationsPage } from './pages/EscalationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { OpsPage } from './pages/OpsPage';
import { SettingsPage } from './pages/SettingsPage';

const CommandCenterLayout: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  // Global Keyboard listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans relative selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Global Grain Atmosphere Overlay */}
      <GrainOverlay />

      {/* Render Persistent NavigationBar only when inside Command Center (not on full-viewport landing) */}
      {!isLandingPage && (
        <NavigationBar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          pendingEscalationsCount={7}
          isLedgerVerified={true}
        />
      )}

      {/* Main Page Router View */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/escalations" element={<EscalationsPage />} />
          <Route path="/reports/:id" element={<ReportsPage />} />
          <Route path="/ops" element={<OpsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <CommandCenterLayout />
      </ToastProvider>
    </Router>
  );
};

export default App;
