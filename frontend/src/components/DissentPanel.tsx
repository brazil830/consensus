import React, { useState } from 'react';
import { TriangleAlert, ShieldAlert, Filter, CheckCircle2 } from 'lucide-react';
import { AgentProposal } from '../types/governance';

interface DissentPanelProps {
  deliberations: AgentProposal[];
  dissentEntropy?: number;
}

export const DissentPanel: React.FC<DissentPanelProps> = ({
  deliberations,
  dissentEntropy = 0.14
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CONSENSUS' | 'DISSENT' | 'LOW_CONFIDENCE'>('ALL');

  const dissentingAgents = deliberations.filter(d => d.dissent_flag);

  const filteredAgents = deliberations.filter(agent => {
    if (filterMode === 'DISSENT') return agent.dissent_flag;
    if (filterMode === 'CONSENSUS') return !agent.dissent_flag;
    if (filterMode === 'LOW_CONFIDENCE') return agent.confidence < 0.80;
    return true;
  });

  return (
    <div className="mission-card rounded-xl p-5 border border-slate-800 my-4">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            dissentingAgents.length > 0
              ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}>
            {dissentingAgents.length > 0 ? <TriangleAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-anton text-lg tracking-wide text-white uppercase">
                {dissentingAgents.length > 0 ? 'DISSENT DETECTED' : 'CONSENSUS ALIGNED'}
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Entropy: {dissentEntropy}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {dissentingAgents.length > 0
                ? `${dissentingAgents.length} specialist agent(s) raised formal disagreement with the primary proposal.`
                : 'Zero dissenting votes detected. Multi-agent consensus index high.'}
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${filterMode === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All Views
          </button>
          <button
            onClick={() => setFilterMode('DISSENT')}
            className={`px-2.5 py-1 rounded transition-colors ${filterMode === 'DISSENT' ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Dissent ({dissentingAgents.length})
          </button>
          <button
            onClick={() => setFilterMode('CONSENSUS')}
            className={`px-2.5 py-1 rounded transition-colors ${filterMode === 'CONSENSUS' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Consensus
          </button>
          <button
            onClick={() => setFilterMode('LOW_CONFIDENCE')}
            className={`px-2.5 py-1 rounded transition-colors ${filterMode === 'LOW_CONFIDENCE' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Low Conf
          </button>
        </div>
      </div>

      {/* Filtered Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAgents.map(agent => (
          <div
            key={agent.agent_name}
            className={`p-3.5 rounded-lg border transition-all ${
              agent.dissent_flag
                ? 'bg-red-950/20 border-red-900/60 text-red-200 shadow-[0_0_15px_rgba(255,107,107,0.1)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm text-white">{agent.agent_name}</span>
                <span className="text-[11px] font-mono text-slate-400">({Math.round(agent.confidence * 100)}%)</span>
              </div>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                agent.dissent_flag ? 'bg-red-500/30 text-red-300 border border-red-500/50' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {agent.proposal}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
              "{agent.reasoning_text}"
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              <span>Role: {agent.role}</span>
              <span>Weight: {agent.trust_weight}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
