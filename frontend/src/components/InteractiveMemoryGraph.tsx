import React, { useState } from 'react';
import { Database, GitCommit, ShieldCheck, FileText, Cpu, Info } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'Case' | 'Agent' | 'Evidence' | 'Precedent' | 'Outcome';
  trust?: number;
  timestamp?: string;
  source?: string;
  relationship?: string;
  x: number; // Percentage offset
  y: number;
}

export const InteractiveMemoryGraph: React.FC<{ caseId?: string }> = ({ caseId = 'CASE-10482' }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const nodes: GraphNode[] = [
    { id: 'n-case', label: caseId, type: 'Case', x: 50, y: 15, source: 'Banking Transaction Stream', relationship: 'Root Target', timestamp: '2026-08-20 18:40:00' },
    { id: 'n-evid-1', label: 'EVID-HW-TOKEN', type: 'Evidence', trust: 0.98, x: 22, y: 40, source: 'Hardware Security Module', relationship: 'Payload Verification', timestamp: '2026-08-20 18:40:01' },
    { id: 'n-prec-1', label: 'PRECEDENT-#1842', type: 'Precedent', trust: 0.91, x: 78, y: 40, source: 'Temporal Knowledge Graph', relationship: 'Historical Causal Match', timestamp: '2026-08-06 12:00:00' },
    { id: 'n-agent-1', label: 'Consensus Agent', type: 'Agent', trust: 0.98, x: 35, y: 68, source: 'Multi-Agent Swarm', relationship: 'Trust Weighted Voting', timestamp: '2026-08-20 18:40:03' },
    { id: 'n-agent-2', label: 'Risk Agent', type: 'Agent', trust: 0.91, x: 65, y: 68, source: 'Anomaly Autoencoder', relationship: 'Statistical Screening', timestamp: '2026-08-20 18:40:03' },
    { id: 'n-out', label: 'SHA-256 CAPSULE', type: 'Outcome', trust: 0.99, x: 50, y: 90, source: 'Hash Capsule Ledger', relationship: 'Immutable Seal', timestamp: '2026-08-20 18:40:05' }
  ];

  const connections = [
    { from: 'n-case', to: 'n-evid-1' },
    { from: 'n-case', to: 'n-prec-1' },
    { from: 'n-evid-1', to: 'n-agent-1' },
    { from: 'n-prec-1', to: 'n-agent-2' },
    { from: 'n-agent-1', to: 'n-out' },
    { from: 'n-agent-2', to: 'n-out' }
  ];

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'Case': return 'bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.3)]';
      case 'Evidence': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/60';
      case 'Precedent': return 'bg-purple-500/20 text-purple-300 border-purple-500/60';
      case 'Agent': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(100,230,165,0.3)]';
      case 'Outcome': return 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,199,107,0.3)]';
    }
  };

  const getNodeIcon = (type: GraphNode['type']) => {
    switch (type) {
      case 'Case': return <Database className="w-4 h-4 text-sky-400" />;
      case 'Evidence': return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'Precedent': return <GitCommit className="w-4 h-4 text-purple-400" />;
      case 'Agent': return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'Outcome': return <ShieldCheck className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="mission-card rounded-xl p-5 border border-slate-800 my-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-5 h-5 text-purple-400" />
          <h3 className="font-anton text-lg tracking-wide text-white uppercase">
            STRUCTURED CAUSAL MEMORY GRAPH
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Hypergraph Nodes & Immutable Causal Edges
        </span>
      </div>

      {/* Graph Display Box */}
      <div className="relative w-full h-[320px] bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden select-none">
        
        {/* Connection SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map(({ from, to }, idx) => {
            const start = nodes.find(n => n.id === from)!;
            const end = nodes.find(n => n.id === to)!;

            return (
              <line
                key={`${from}-${to}-${idx}`}
                x1={`${start.x}%`}
                y1={`${start.y}%`}
                x2={`${end.x}%`}
                y2={`${end.y}%`}
                stroke="rgba(100, 230, 165, 0.3)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const isSelected = selectedNode?.id === node.id;

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => setSelectedNode(node)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-300 flex items-center space-x-2 z-20 ${getNodeColor(
                node.type
              )} ${isSelected ? 'scale-110 border-white ring-2 ring-emerald-400/50' : 'hover:scale-105'}`}
            >
              {getNodeIcon(node.type)}
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono tracking-tight leading-tight">{node.label}</span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">{node.type}</span>
              </div>
            </div>
          );
        })}

        {/* Floating Tooltip Detail Card */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/95 border border-slate-700 rounded-lg shadow-2xl z-30 flex items-center justify-between text-xs font-mono animate-fadeIn">
            <div className="flex items-center space-x-3">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-white font-bold">{selectedNode.label}</span>
                <span className="text-slate-400 ml-2">({selectedNode.source})</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Relationship: {selectedNode.relationship}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-right">
              {selectedNode.trust && (
                <div>
                  <span className="text-[10px] text-slate-400 block">Trust</span>
                  <span className="text-emerald-400 font-bold">{selectedNode.trust}</span>
                </div>
              )}
              <button
                onClick={() => setSelectedNode(null)}
                className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-white rounded text-[10px]"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
