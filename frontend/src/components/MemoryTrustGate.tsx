import React from 'react';
import { ShieldCheck, LockKeyhole, Clock, Award, AlertOctagon, History } from 'lucide-react';
import { MemoryTrustMode, PrecedentItem } from '../types/governance';

interface MemoryTrustGateProps {
  trustScore?: number;
  influenceMode?: MemoryTrustMode;
  precedents?: PrecedentItem[];
  currentRegime?: string;
}

export const MemoryTrustGate: React.FC<MemoryTrustGateProps> = ({
  trustScore = 0.84,
  influenceMode = 'WEIGHTED',
  precedents = [
    {
      precedent_id: 'PRECEDENT-#1842',
      entity_id: 'CUST-88392',
      relation: 'AUTHENTICATED_CORPORATE_PAYMENT',
      summary: 'Verified high-value supplier settlement under hardware OTP token.',
      base_trust_score: 0.95,
      computed_trust_score: 0.83,
      influence_mode: 'WEIGHTED',
      mode_explanation: 'Valid regime match with exponential decay over 14 days.',
      regulatory_regime: 'RBI-FRAUD-REGIME-2026',
      created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
      is_tampered: false,
      decay_details: { days_elapsed: 14, decay_factor: 0.91, regime_match: true }
    }
  ],
  currentRegime = 'RBI-FRAUD-REGIME-2026'
}) => {
  const getModeBadgeClass = (mode: MemoryTrustMode) => {
    switch (mode) {
      case 'ADVISORY': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'WEIGHTED': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'RESTRICTED': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'REJECTED': return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'QUARANTINED': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'ESCALATED': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="mission-card rounded-xl p-5 border border-slate-800 my-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <LockKeyhole className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-anton text-lg tracking-wide text-white uppercase flex items-center space-x-2">
              <span>MEMORY TRUST GATE</span>
            </h3>
            <p className="text-xs text-slate-400">
              Deterministic Temporal Knowledge Graph gating & exponential decay engine.
            </p>
          </div>
        </div>

        {/* Global Memory Mode Pill */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Trust Score</span>
            <span className="text-lg font-anton text-emerald-400">{Math.round(trustScore * 100)}%</span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Influence Mode</span>
            <span className={`px-2.5 py-0.5 text-xs font-bold font-mono rounded border ${getModeBadgeClass(influenceMode)}`}>
              {influenceMode}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Telemetry Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        
        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center space-x-3">
          <Clock className="w-5 h-5 text-sky-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Temporal Validity</span>
            <div className="text-xs font-semibold text-white">Exponential Half-Life Valid</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center space-x-3">
          <Award className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Provenance State</span>
            <div className="text-xs font-semibold text-emerald-300">Verified ({currentRegime})</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Outcome Validity</span>
            <div className="text-xs font-semibold text-white">SHA-256 Ledger Sealed</div>
          </div>
        </div>

      </div>

      {/* Precedent Breakdown Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <History className="w-4 h-4 text-emerald-400" />
          <span>Retrieved Precedent Records</span>
        </h4>

        {precedents.map((prec) => (
          <div
            key={prec.precedent_id}
            className={`p-3.5 rounded-lg border transition-all ${
              prec.is_tampered
                ? 'bg-purple-950/20 border-purple-800/60'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-sm text-white">{prec.precedent_id}</span>
                <span className="text-xs text-slate-400 font-mono">({prec.relation})</span>
              </div>

              <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded border ${getModeBadgeClass(prec.influence_mode || 'WEIGHTED')}`}>
                {prec.influence_mode}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans mb-2">
              {prec.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              <div>Base Trust: <span className="text-slate-200 font-bold">{prec.base_trust_score}</span></div>
              <div>Decay Score: <span className="text-emerald-400 font-bold">{prec.computed_trust_score || prec.decay_details?.decay_factor || 0.91}</span></div>
              <div>Regime: <span className="text-slate-300">{prec.regulatory_regime}</span></div>
              <div>Provenance: <span className={prec.is_tampered ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{prec.is_tampered ? 'TAMPERED' : 'VERIFIED'}</span></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
