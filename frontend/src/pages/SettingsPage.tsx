import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Sliders, Globe, Lock } from 'lucide-react';
import { GhostTypography } from '../components/GhostTypography';
import { useToast } from '../components/NotificationToast';

export const SettingsPage: React.FC = () => {
  const { addToast } = useToast();

  const [regime, setRegime] = useState<string>('RBI-FRAUD-REGIME-2026');
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(0.65);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [apiUrl, setApiUrl] = useState<string>('http://localhost:8000/api');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('AUTHORIZED', 'Settings Saved', 'Governance configuration parameters updated successfully.');
  };

  return (
    <div className="relative min-h-screen pb-16">
      
      {/* Ghost Typography */}
      <GhostTypography text="CONTROL" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="font-anton text-3xl sm:text-4xl tracking-wide uppercase text-white flex items-center space-x-3">
            <Settings className="w-8 h-8 text-sky-400" />
            <span>GOVERNANCE & SYSTEM SETTINGS</span>
          </h1>
          <p className="text-sm text-slate-400 font-sans mt-0.5">
            Configure regulatory regimes, ML anomaly gating thresholds, demo mode, and API client options.
          </p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="mission-card rounded-2xl p-6 border-2 border-slate-700 bg-slate-950/90 space-y-6">
          
          {/* Regulatory Regime */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Active Regulatory Regime Framework</span>
            </label>
            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="RBI-FRAUD-REGIME-2026">RBI-FRAUD-REGIME-2026 (Reserve Bank of India Banking Risk Framework)</option>
              <option value="EU-PSD3-REGIME-2024">EU-PSD3-REGIME-2024 (European Union Payment Services Directive 3)</option>
              <option value="US-OCC-AI-RISK-2025">US-OCC-AI-RISK-2025 (US OCC Autonomous Decision Governance)</option>
            </select>
          </div>

          {/* Anomaly Threshold Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Autoencoder Anomaly Escalation Threshold</span>
              </label>
              <span className="text-xs font-mono font-bold text-sky-400">{Math.round(anomalyThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={anomalyThreshold}
              onChange={(e) => setAnomalyThreshold(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 font-mono">
              Payload transactions with structural reconstruction loss exceeding this threshold are automatically routed to the Human-in-the-Loop queue.
            </p>
          </div>

          {/* Demo Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-white uppercase block">Standalone Hybrid Demo Mode</span>
              <span className="text-[11px] text-slate-400 font-mono">
                When enabled, UI falls back gracefully to offline mock scenarios when backend is unreachable.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDemoMode(!demoMode)}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                demoMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {demoMode ? 'ENABLED (HYBRID)' : 'DISABLED (API ONLY)'}
            </button>
          </div>

          {/* API Base URL */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Backend FastAPI Base URL</span>
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20"
            >
              SAVE GOVERNANCE CONFIGURATION
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
