import React from 'react';
import { ShieldCheck, TriangleAlert, ShieldX, CheckCircle, Lock } from 'lucide-react';
import { DecisionState } from '../types/governance';

interface PolicyGateProps {
  verdict?: DecisionState | string;
  evidenceConfidence?: number;
  consensusConfidence?: number;
  hardRuleViolations?: number;
  triggeredRule?: string | null;
}

export const PolicyGate: React.FC<PolicyGateProps> = ({
  verdict = 'AUTHORIZED',
  evidenceConfidence = 0.91,
  consensusConfidence = 0.93,
  hardRuleViolations = 0,
  triggeredRule = null
}) => {
  return (
    <div className="my-6">
      
      {/* Structural Visual Divider */}
      <div className="flex items-center justify-center my-6 space-x-4">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-700 to-slate-700" />
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold">
          AI DELIBERATION &nbsp;────&nbsp; DETERMINISTIC GOVERNANCE &nbsp;────&nbsp; FINAL ACTION
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-slate-700 to-slate-700" />
      </div>

      {/* Deterministic Policy Gate Card */}
      <div className="mission-card rounded-xl p-6 border-2 border-slate-700 bg-slate-950/90 relative overflow-hidden shadow-2xl">
        
        {/* Rigid Corner Accent */}
        <div className="absolute top-0 right-0 px-4 py-1 bg-slate-800 border-b border-l border-slate-700 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
          DETERMINISTIC ACTION GATE
        </div>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-anton text-xl tracking-wide text-white uppercase">
              POLICY & ACTION GATE
            </h3>
            <p className="text-xs text-slate-400">
              Statutory hard-rule evaluation & non-overridable boundary verification.
            </p>
          </div>
        </div>

        {/* 3 Hard Rule Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Evidence Sufficiency</span>
              <span className="text-sm font-bold text-white font-mono">{Math.round(evidenceConfidence * 100)}%</span>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Consensus Threshold</span>
              <span className="text-sm font-bold text-white font-mono">{Math.round(consensusConfidence * 100)}%</span>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Hard Statutory Rules</span>
              <span className={`text-sm font-bold font-mono ${hardRuleViolations === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {hardRuleViolations} VIOLATIONS
              </span>
            </div>
            {hardRuleViolations === 0 ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldX className="w-5 h-5 text-red-400" />
            )}
          </div>

        </div>

        {/* Final Policy Output Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          verdict === 'AUTHORIZED' || verdict === 'PASS'
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            : verdict === 'ESCALATED' || verdict === 'MANUAL_REVIEW_REQUIRED'
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
            : 'bg-red-950/40 border-red-500/50 text-red-300'
        }`}>
          <div className="flex items-center space-x-3">
            {verdict === 'AUTHORIZED' || verdict === 'PASS' ? (
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            ) : verdict === 'ESCALATED' || verdict === 'MANUAL_REVIEW_REQUIRED' ? (
              <TriangleAlert className="w-8 h-8 text-amber-400" />
            ) : (
              <ShieldX className="w-8 h-8 text-red-400" />
            )}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Final Policy Verdict</span>
              <h4 className="font-anton text-2xl tracking-wider uppercase text-white">
                {verdict}
              </h4>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            {triggeredRule ? (
              <span className="text-red-400 font-bold block">Triggered Rule: {triggeredRule}</span>
            ) : (
              <span className="text-emerald-400 font-semibold block">Policy Gate Passed ✓</span>
            )}
            <span className="text-slate-400 text-[11px]">Executable Seal Ready</span>
          </div>
        </div>

      </div>
    </div>
  );
};
