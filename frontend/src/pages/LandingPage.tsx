import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Brain,
  LockKeyhole,
  Activity,
  ChevronRight,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import { GhostTypography } from '../components/GhostTypography';
import { AgentOrbit } from '../components/AgentOrbit';
import { DEMO_AGENTS } from '../api/governanceApi';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const workflowSteps = [
    { name: 'CASE', sub: 'Payload Ingest', icon: Layers },
    { name: 'ANOMALY SCREENING', sub: 'ML Autoencoder', icon: Activity },
    { name: 'MEMORY TRUST', sub: 'Temporal Graph Decay', icon: LockKeyhole },
    { name: 'MULTI-AGENT DELIBERATION', sub: '10 Specialist Swarm', icon: Brain },
    { name: 'CONSENSUS', sub: 'Shapley Trust Vote', icon: Sparkles },
    { name: 'POLICY GATE', sub: 'Deterministic Hard Rules', icon: ShieldCheck },
    { name: 'DECISION', sub: 'SHA-256 Sealed Capsule', icon: FileCheck },
  ];

  return (
    <div className="relative w-screen min-h-screen bg-[#0B0F17] text-white overflow-x-hidden flex flex-col justify-between select-none">
      
      {/* Giant Ghost Typography Backdrop */}
      <GhostTypography text="CONSENSUS" />

      {/* Top Header */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-sky-500 to-indigo-600 p-[1px] shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0B0F17] rounded-[11px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="font-anton tracking-wider text-2xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              CONSENSUS<span className="text-emerald-400">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono block -mt-1">
              Adaptive Decision Governance
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 font-mono text-xs">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GOVERNANCE ONLINE</span>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center space-x-2 group"
          >
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Center Composition */}
      <main className="relative z-20 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col items-center justify-center flex-1 text-center">
        
        {/* Primary Hero Typography */}
        <div className="max-w-4xl space-y-4 mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BANKING FRAUD & RISK GOVERNANCE MVP</span>
          </div>

          <h1 className="font-anton text-5xl sm:text-7xl lg:text-8xl tracking-tight uppercase leading-none bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            DETECT. <br />
            RECONSIDER. <br />
            DECIDE AGAIN.
          </h1>

          <p className="font-anton text-2xl sm:text-4xl text-emerald-400 tracking-wide uppercase">
            WITH EVIDENCE.
          </p>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-sans font-normal leading-relaxed pt-2">
            Adaptive Decision Governance & Memory Trust Layer for Autonomous Agents. Combining temporal graph trust scoring, Shannon dissent entropy, and deterministic hard policy gates.
          </p>
        </div>

        {/* Central Agent Orbit Visualization */}
        <div className="w-full max-w-3xl my-2">
          <AgentOrbit
            agents={DEMO_AGENTS}
            activeCaseId="CASE-10482"
            activeCaseAmount={842500}
            activeCaseStatus="AUTHORIZED"
            consensusConfidence={0.91}
            onSelectAgent={() => navigate('/cases/CASE-10482')}
          />
        </div>

        {/* Surrounding System Workflow Diagram */}
        <div className="w-full max-w-5xl my-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 block mb-3">
            GOVERNANCE PIPELINE FLOW
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.name}
                  onClick={() => navigate('/dashboard')}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 flex flex-col items-center text-center group"
                >
                  <Icon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
                  <span className="text-[11px] font-bold font-mono text-white leading-tight">
                    {step.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                    {step.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-sm tracking-wider transition-all duration-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-3 group"
          >
            <span>OPEN COMMAND CENTER</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/cases/CASE-10482')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>EXPLORE GOVERNANCE →</span>
          </button>
        </div>

      </main>

      {/* Footer System Identifiers */}
      <footer className="relative z-20 border-t border-slate-800/80 py-4 px-6 text-center font-mono text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <span>CONSENSUSAI LAYER — RBI-FRAUD-REGIME-2026</span>
        <span>TRUST • CONTROL • EVIDENCE • ACCOUNTABILITY • REVERSIBILITY</span>
      </footer>

    </div>
  );
};
