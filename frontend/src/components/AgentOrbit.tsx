import React, { useState } from 'react';
import { ShieldCheck, TriangleAlert, Brain, CheckCircle2, ShieldX } from 'lucide-react';
import { AgentProposal, AgentState } from '../types/governance';

interface AgentOrbitProps {
  agents: AgentProposal[];
  activeCaseId?: string;
  activeCaseAmount?: number;
  activeCaseStatus?: string;
  consensusConfidence?: number;
  onSelectAgent?: (agentName: string) => void;
}

export const AgentOrbit: React.FC<AgentOrbitProps> = ({
  agents,
  activeCaseId = 'CASE-10482',
  activeCaseAmount = 842500,
  activeCaseStatus = 'AUTHORIZED',
  consensusConfidence = 0.91,
  onSelectAgent
}) => {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  // Calculate orbital positions for 10 agents in a circle around central case
  const radius = 170; // Orbit radius in px
  const center = 230; // SVG center point in px

  return (
    <div className="relative w-full max-w-xl mx-auto h-[480px] flex items-center justify-center select-none my-4">
      <div className="relative w-[460px] h-[460px] flex-shrink-0 flex items-center justify-center">
        {/* Background Orbital Rings */}
        <div className="absolute w-[360px] h-[360px] rounded-full border border-slate-800/80 animate-spin-slow pointer-events-none" />
        <div className="absolute w-[440px] h-[440px] rounded-full border border-emerald-500/10 pointer-events-none" />

        {/* Connecting Canvas Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {agents.map((agent, i) => {
            const angle = (i * 2 * Math.PI) / agents.length - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const isHovered = hoveredAgent === agent.agent_name;
            const isDissent = agent.dissent_flag;

            return (
              <line
                key={agent.agent_name}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={isDissent ? 'rgba(255, 107, 107, 0.4)' : isHovered ? 'rgba(100, 230, 165, 0.8)' : 'rgba(255, 255, 255, 0.12)'}
                strokeWidth={isHovered ? 2.5 : 1}
                strokeDasharray={isDissent ? '4 4' : 'none'}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Central Case Focus Center */}
        <div className="relative z-20 flex flex-col items-center justify-center w-52 h-52 rounded-full bg-slate-900/95 border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(100,230,165,0.15)] backdrop-blur-xl p-4 text-center group hover:border-emerald-400 transition-all duration-500">
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
            {activeCaseId}
          </span>
          <h4 className="text-xs font-semibold text-slate-300 mt-1 line-clamp-1">
            HIGH VALUE TRANSACTION
          </h4>
          <div className="text-xl font-anton text-white tracking-wide my-1">
            ₹{activeCaseAmount.toLocaleString('en-IN')}
          </div>
          
          <div className="flex items-center space-x-1.5 mt-1">
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
              activeCaseStatus === 'AUTHORIZED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
              activeCaseStatus === 'ESCALATED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
              activeCaseStatus === 'BLOCKED' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
              'bg-sky-500/20 text-sky-300 border-sky-500/40'
            }`}>
              {activeCaseStatus}
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-400">
              {Math.round(consensusConfidence * 100)}% CONSENSUS
            </span>
          </div>

          <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center space-x-1 shadow-lg">
            <Brain className="w-3 h-3 text-sky-400" />
            <span>10 AGENTS ACTIVE</span>
          </div>
        </div>

        {/* Orbiting Agent Nodes */}
        {agents.map((agent, i) => {
          const angle = (i * 2 * Math.PI) / agents.length - Math.PI / 2;
          const x = center + radius * Math.cos(angle) - 32; // Offset for half node width (64px)
          const y = center + radius * Math.sin(angle) - 32;
          const isHovered = hoveredAgent === agent.agent_name;
          const isDissent = agent.dissent_flag;

          return (
            <div
              key={agent.agent_name}
              style={{ left: `${x}px`, top: `${y}px` }}
              onMouseEnter={() => setHoveredAgent(agent.agent_name)}
              onMouseLeave={() => setHoveredAgent(null)}
              className={`absolute z-30 w-16 h-16 transition-all duration-300 ${isHovered ? 'scale-125 z-40' : ''}`}
            >
              <div
                onClick={() => onSelectAgent && onSelectAgent(agent.agent_name)}
                className={`w-full h-full rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  isDissent
                    ? 'bg-red-950/80 border-2 border-red-500 shadow-[0_0_15px_rgba(255,107,107,0.5)] animate-pulse'
                    : agent.confidence > 0.9
                    ? 'bg-slate-900/90 border-2 border-emerald-400/80 shadow-[0_0_15px_rgba(100,230,165,0.3)]'
                    : 'bg-slate-900/90 border border-slate-700'
                }`}
              >
                {isDissent ? (
                  <TriangleAlert className="w-4 h-4 text-red-400" />
                ) : agent.proposal === 'AUTHORIZE' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : agent.proposal === 'BLOCK' ? (
                  <ShieldX className="w-4 h-4 text-red-400" />
                ) : (
                  <Brain className="w-4 h-4 text-sky-400" />
                )}

                <span className="text-[9px] font-bold text-slate-200 mt-0.5 text-center leading-tight truncate px-1 max-w-[56px]">
                  {agent.agent_name.split(' ')[0]}
                </span>
                <span className={`text-[8px] font-mono font-semibold ${isDissent ? 'text-red-300' : 'text-emerald-400'}`}>
                  {Math.round(agent.confidence * 100)}%
                </span>
              </div>

              {/* Hover Tooltip Card */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl z-50 text-left pointer-events-none cursor-default" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                    <span>{agent.agent_name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isDissent ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {agent.proposal}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight">
                    {agent.reasoning_text}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800 text-[9px] font-mono text-slate-400">
                    <span>Trust: {agent.trust_weight}</span>
                    <span>Conf: {Math.round(agent.confidence * 100)}%</span>
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
