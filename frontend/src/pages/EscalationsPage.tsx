import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TriangleAlert,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  FileQuestion,
  CheckCircle2,
  Clock,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { GhostTypography } from '../components/GhostTypography';
import { useToast } from '../components/NotificationToast';
import { governanceApi, DEMO_CASES } from '../api/governanceApi';
import { CaseItem, DecisionState } from '../types/governance';

export const EscalationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const escalatedCases = DEMO_CASES.filter(c => c.status === 'ESCALATED');
  const [selectedCase, setSelectedCase] = useState<CaseItem>(escalatedCases[0] || DEMO_CASES[1]);

  const [rulingAction, setRulingAction] = useState<DecisionState>('AUTHORIZED');
  const [rationale, setRationale] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmitRuling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) return;

    setIsSubmitting(true);
    await governanceApi.resolveEscalation(selectedCase.case_id, rulingAction, rationale);
    setIsSubmitting(false);

    addToast(
      rulingAction === 'AUTHORIZED' ? 'AUTHORIZED' : 'BLOCKED',
      `Escalation Ruling Submitted: ${selectedCase.case_id}`,
      `Decision updated to ${rulingAction} and sealed into hash capsule ledger.`
    );

    setRationale('');
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen pb-16">
      
      {/* Ghost Typography */}
      <GhostTypography text="REVIEW" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <h1 className="font-anton text-3xl sm:text-4xl tracking-wide uppercase text-white flex items-center space-x-3">
              <TriangleAlert className="w-8 h-8 text-amber-400" />
              <span>HUMAN-IN-THE-LOOP ESCALATION WORKSPACE</span>
            </h1>
            <p className="text-sm text-slate-400 font-sans mt-0.5">
              Review queue for paused autonomous decisions requiring human intervention & statutory rationale capture.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs text-amber-400 bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-full">
            <span>{escalatedCases.length} Cases Requiring Review</span>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Escalation Queue List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">
              Pending Review Queue
            </h3>

            {escalatedCases.map((c) => {
              const isSelected = selectedCase.case_id === c.case_id;

              return (
                <div
                  key={c.case_id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500 text-white shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-amber-400 text-xs">{c.case_id}</span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Waiting 18m</span>
                    </span>
                  </div>

                  <h4 className="font-anton text-base text-white uppercase tracking-tight line-clamp-1">
                    {c.title}
                  </h4>

                  <div className="text-lg font-anton text-slate-200 mt-0.5">
                    ₹{c.amount.toLocaleString('en-IN')}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <div>Consensus: <span className="text-amber-300 font-bold">{Math.round((c.consensus_confidence || 0.54) * 100)}%</span></div>
                    <div>Risk Score: <span className="text-red-400 font-bold">{Math.round(c.anomaly_score * 100)}%</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Escalation Detail & Ruling Controls */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* PAUSED WARNING BANNER */}
            <div className="mission-card rounded-2xl p-6 border-2 border-amber-500/60 bg-amber-950/20 text-amber-200 space-y-3">
              <div className="flex items-center space-x-3">
                <TriangleAlert className="w-8 h-8 text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-anton text-2xl uppercase tracking-wider text-amber-100">
                    AUTONOMOUS DECISION PAUSED
                  </h3>
                  <p className="text-xs font-mono text-amber-300">
                    Reason: Evidence confidence below configured regulatory threshold (0.54 &lt; 0.80) & Out-of-Regime precedent.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-amber-500/30 text-xs font-mono">
                <div>Case ID: <strong className="text-white">{selectedCase.case_id}</strong></div>
                <div>Amount: <strong className="text-emerald-400">₹{selectedCase.amount.toLocaleString('en-IN')}</strong></div>
                <div>Risk Tier: <strong className="text-red-400">HIGH</strong></div>
                <div>Memory Mode: <strong className="text-amber-300">RESTRICTED</strong></div>
              </div>
            </div>

            {/* Evidence Bundle & Agent Recommendations Summary */}
            <div className="mission-card rounded-xl p-5 border border-slate-800 space-y-4">
              <h4 className="font-anton text-lg text-white uppercase tracking-wide">
                ESCALATION EVIDENCE BUNDLE & AUDIT
              </h4>

              <div className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono space-y-2">
                <span className="text-amber-400 font-bold uppercase block">
                  Out-of-Regime Precedent Flagged (#1209)
                </span>
                <p className="text-slate-300 font-sans">
                  Target beneficiary registered in Cyprus (CY). Temporal knowledge graph precedent #1209 was processed under EU-PSD3-REGIME-2024 rather than active RBI-FRAUD-REGIME-2026.
                </p>
              </div>
            </div>

            {/* REVIEWER RULING CONTROLS */}
            <form onSubmit={handleSubmitRuling} className="mission-card rounded-xl p-6 border-2 border-slate-700 bg-slate-950/90 space-y-5">
              
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <UserCheck className="w-6 h-6 text-emerald-400" />
                <h4 className="font-anton text-xl text-white uppercase tracking-wide">
                  HUMAN REVIEWER RULING FORM
                </h4>
              </div>

              {/* Action Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                <button
                  type="button"
                  onClick={() => setRulingAction('AUTHORIZED')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
                    rulingAction === 'AUTHORIZED'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(100,230,165,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 mb-1 text-emerald-400" />
                  <span>AUTHORIZE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRulingAction('BLOCKED')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
                    rulingAction === 'BLOCKED'
                      ? 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_15px_rgba(255,107,107,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldX className="w-5 h-5 mb-1 text-red-400" />
                  <span>BLOCK</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRulingAction('PENDING')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
                    rulingAction === 'PENDING'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,199,107,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileQuestion className="w-5 h-5 mb-1 text-amber-400" />
                  <span>REQUEST INFO</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRulingAction('REVISED')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
                    rulingAction === 'REVISED'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <RotateCcw className="w-5 h-5 mb-1 text-sky-400" />
                  <span>REVISE</span>
                </button>

              </div>

              {/* Rationale Capture Textarea */}
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Statutory Decision Rationale (Required)
                </label>
                <textarea
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  required
                  placeholder="Provide explicit reviewer justification for compliance audit trails..."
                  className="w-full h-28 p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !rationale.trim()}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-xl shadow-emerald-500/20 flex items-center space-x-2"
                >
                  <span>SUBMIT RULING & SEAL CAPSULE</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
