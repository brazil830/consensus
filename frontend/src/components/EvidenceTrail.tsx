import React, { useState } from 'react';
import {
  FileText,
  Activity,
  Database,
  LockKeyhole,
  Brain,
  Users,
  ShieldCheck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface StageNode {
  id: string;
  name: string;
  icon: any;
  status: 'COMPLETED' | 'PROCESSING' | 'PAUSED';
  score?: string | number;
  timestamp: string;
  source: string;
  relatedAgent: string;
  capsuleRef: string;
  details: string;
}

export const EvidenceTrail: React.FC<{ caseId?: string }> = ({ caseId = 'CASE-10482' }) => {
  const [activeStage, setActiveStage] = useState<string>('stage-decision');

  const stages: StageNode[] = [
    {
      id: 'stage-payload',
      name: 'CASE PAYLOAD',
      icon: FileText,
      status: 'COMPLETED',
      timestamp: '18:40:00.102',
      source: 'NetBanking Gateway (OTP-HW)',
      relatedAgent: 'Data Verification',
      capsuleRef: 'CAP-HASH-PAYLOAD-001',
      details: `Payload structure validated for ${caseId}. Total amount ₹8,42,500. Device fingerprint DEV-FINGERPRINT-SECURE-992.`
    },
    {
      id: 'stage-anomaly',
      name: 'ANOMALY SCREEN',
      icon: Activity,
      status: 'COMPLETED',
      score: '0.04 (Low)',
      timestamp: '18:40:00.415',
      source: 'ML Autoencoder',
      relatedAgent: 'Risk Agent',
      capsuleRef: 'CAP-HASH-ANOM-002',
      details: 'Structural reconstruction loss within 95th percentile. Zero botnet features detected.'
    },
    {
      id: 'stage-memory',
      name: 'MEMORY RETRIEVAL',
      icon: Database,
      status: 'COMPLETED',
      score: '#1842 Matched',
      timestamp: '18:40:01.002',
      source: 'Temporal Knowledge Graph',
      relatedAgent: 'Memory Trust Agent',
      capsuleRef: 'PRECEDENT-#1842',
      details: 'Retrieved precedent #1842 under RBI-FRAUD-REGIME-2026. Provenance verified.'
    },
    {
      id: 'stage-trust',
      name: 'TRUST SCORING',
      icon: LockKeyhole,
      status: 'COMPLETED',
      score: '0.91 (Weighted)',
      timestamp: '18:40:01.620',
      source: 'Exponential Decay Engine',
      relatedAgent: 'Memory Trust Agent',
      capsuleRef: 'TKG-DECAY-842500',
      details: 'Computed temporal decay factor 0.957 over 14 elapsed days. Influence mode: WEIGHTED.'
    },
    {
      id: 'stage-deliberation',
      name: 'AGENT DELIBERATION',
      icon: Brain,
      status: 'COMPLETED',
      score: '10 Agents',
      timestamp: '18:40:02.310',
      source: 'Multi-Agent Swarm',
      relatedAgent: 'Consensus Agent',
      capsuleRef: 'DELIB-SYNTHESIS-10482',
      details: '9 Agents proposed AUTHORIZE. 1 Agent (Risk) dissented proposing BLOCK with 73% confidence.'
    },
    {
      id: 'stage-consensus',
      name: 'CONSENSUS',
      icon: Users,
      status: 'COMPLETED',
      score: '91% Confidence',
      timestamp: '18:40:02.900',
      source: 'Shapley Trust Integrator',
      relatedAgent: 'Consensus Agent',
      capsuleRef: 'CONSENSUS-SEAL-91',
      details: 'Weighted consensus candidate AUTHORIZE achieved 91% trust score (Threshold: 80%).'
    },
    {
      id: 'stage-policy',
      name: 'POLICY GATE',
      icon: ShieldCheck,
      status: 'COMPLETED',
      score: '0 Violations',
      timestamp: '18:40:03.450',
      source: 'Deterministic Policy Engine',
      relatedAgent: 'Revision Validator',
      capsuleRef: 'POLICY-VERDICT-PASS',
      details: 'All statutory rules evaluated cleanly. Action gate granted AUTHORIZE clearance.'
    },
    {
      id: 'stage-decision',
      name: 'FINAL DECISION',
      icon: CheckCircle2,
      status: 'COMPLETED',
      score: 'AUTHORIZED',
      timestamp: '18:40:03.890',
      source: 'ConsensusAI Ledger Gate',
      relatedAgent: 'Revision Validator',
      capsuleRef: 'CAP-7D3A-91BC-842500',
      details: 'Final decision AUTHORIZED permanently sealed into SHA-256 Hash Capsule #104.'
    }
  ];

  const currentSelected = stages.find(s => s.id === activeStage) || stages[stages.length - 1];

  return (
    <div className="mission-card rounded-xl p-5 border border-slate-800 my-4">
      
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <h3 className="font-anton text-lg tracking-wide text-white uppercase flex items-center space-x-2">
          <span>EVIDENCE TRAIL & AUDIT TIMELINE</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">
          8 Causal Execution Stages
        </span>
      </div>

      {/* Timeline Stepper (Horizontal Scroll on Mobile) */}
      <div className="overflow-x-auto pb-4 mb-4">
        <div className="flex items-center space-x-2 min-w-max">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = activeStage === stage.id;

            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-[0_0_15px_rgba(100,230,165,0.3)] font-bold'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-mono tracking-tight">{stage.name}</span>
                </button>
                {idx < stages.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono space-y-3 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold">{currentSelected.name}</span>
            <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700">
              {currentSelected.status}
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">{currentSelected.timestamp}</span>
        </div>

        <p className="text-xs text-slate-200 font-sans leading-relaxed">
          {currentSelected.details}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
          <div>Source: <span className="text-slate-200 font-semibold">{currentSelected.source}</span></div>
          <div>Agent: <span className="text-sky-300 font-semibold">{currentSelected.relatedAgent}</span></div>
          <div>Metric: <span className="text-emerald-400 font-semibold">{currentSelected.score || 'Pass'}</span></div>
          <div>Capsule Hash: <span className="text-indigo-300 font-semibold">{currentSelected.capsuleRef}</span></div>
        </div>
      </div>

    </div>
  );
};
