import React, { useState } from 'react';
import {
  Brain,
  ChevronDown,
  ChevronUp,
  TriangleAlert,
  CheckCircle2,
  ShieldX,
  FileCode2,
  Award
} from 'lucide-react';
import { AgentProposal } from '../types/governance';

interface AgentDeliberationPanelProps {
  deliberations: AgentProposal[];
}

export const AgentDeliberationPanel: React.FC<AgentDeliberationPanelProps> = ({ deliberations }) => {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const toggleExpand = (agentName: string) => {
    setExpandedAgent(prev => (prev === agentName ? null : agentName));
  };

  return (
    <div className="mission-card rounded-xl p-5 border border-slate-800">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-anton text-lg tracking-wide text-white uppercase">
              MULTI-AGENT DELIBERATION
            </h3>
            <p className="text-xs text-slate-400">
              Parallel reasoning, confidence evaluation & trust weights across 10 specialized agents.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
            {deliberations.filter(d => d.dissent_flag).length} Dissenting
          </span>
          <span className="px-2 py-1 bg-emerald-950/60 text-emerald-400 rounded border border-emerald-800/40">
            {deliberations.filter(d => !d.dissent_flag).length} Approved
          </span>
        </div>
      </div>

      {/* Agent List */}
      <div className="space-y-3">
        {deliberations.map((agent) => {
          const isExpanded = expandedAgent === agent.agent_name;

          return (
            <div
              key={agent.agent_name}
              className={`rounded-lg border transition-all duration-200 ${
                agent.dissent_flag
                  ? 'bg-red-950/10 border-red-900/40 hover:border-red-800/60'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header Row */}
              <div
                onClick={() => toggleExpand(agent.agent_name)}
                className="flex items-center justify-between p-3.5 cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`p-1.5 rounded-md ${
                    agent.dissent_flag
                      ? 'bg-red-500/20 text-red-400'
                      : agent.proposal === 'AUTHORIZE'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    {agent.dissent_flag ? (
                      <TriangleAlert className="w-4 h-4" />
                    ) : agent.proposal === 'AUTHORIZE' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <ShieldX className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex flex-col truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white truncate">{agent.agent_name}</span>
                      {agent.dissent_flag && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono bg-red-500/20 text-red-300 border border-red-500/40 rounded animate-pulse">
                          DISSENTING
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono truncate">{agent.role}</span>
                  </div>
                </div>

                {/* Right Metrics & Recommendation */}
                <div className="flex items-center space-x-4 shrink-0">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Trust Score</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{agent.trust_weight}</span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Confidence</span>
                    <span className={`text-xs font-mono font-bold ${agent.dissent_flag ? 'text-red-400' : 'text-emerald-400'}`}>
                      {Math.round(agent.confidence * 100)}%
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 text-xs font-bold font-mono rounded border ${
                    agent.proposal === 'AUTHORIZE' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                    agent.proposal === 'BLOCK' ? 'bg-red-500/10 text-red-300 border-red-500/30' :
                    'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {agent.proposal}
                  </span>

                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 bg-slate-950/40 space-y-3 animate-fadeIn">
                  
                  {/* Reasoning Text */}
                  <div>
                    <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-1">
                      Agent Rationale & Analysis
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded border border-slate-800 font-sans">
                      "{agent.reasoning_text}"
                    </p>
                  </div>

                  {/* Evidence Nodes & Precedent */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1 mb-1">
                        <FileCode2 className="w-3 h-3 text-sky-400" />
                        <span>Evidence References</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {agent.evidence_nodes && agent.evidence_nodes.length > 0 ? (
                          agent.evidence_nodes.map(node => (
                            <span key={node} className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-sky-300 rounded border border-slate-700">
                              {node}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">Standard Payload Data</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center space-x-1 mb-1">
                        <Award className="w-3 h-3 text-emerald-400" />
                        <span>Historical Performance</span>
                      </span>
                      <div className="flex items-center justify-between text-slate-300 text-[11px]">
                        <span>Accuracy: 94.2%</span>
                        <span>Precedent Weight: {agent.trust_weight}</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
