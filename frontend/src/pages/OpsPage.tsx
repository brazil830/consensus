import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  TriangleAlert,
  ShieldX,
  LockKeyhole,
  Cpu,
  Database,
  RefreshCw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { GhostTypography } from '../components/GhostTypography';
import { useToast } from '../components/NotificationToast';
import { governanceApi } from '../api/governanceApi';
import { AgentTrustMetric, SystemStatus, TamperVerificationResult } from '../types/governance';

export const OpsPage: React.FC = () => {
  const { addToast } = useToast();

  const [agentMetrics, setAgentMetrics] = useState<AgentTrustMetric[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [ledgerVerification, setLedgerVerification] = useState<TamperVerificationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadOpsData = async () => {
    setLoading(true);
    const [agents, status, verification] = await Promise.all([
      governanceApi.getAgentTrustMetrics(),
      governanceApi.getSystemStatus(),
      governanceApi.verifyCapsuleChain()
    ]);
    setAgentMetrics(agents);
    setSystemStatus(status);
    setLedgerVerification(verification);
    setLoading(false);
  };

  useEffect(() => {
    loadOpsData();
  }, []);

  const handleSimulateTamper = async () => {
    setActionLoading(true);
    await governanceApi.simulateTamper(1);
    await loadOpsData();
    setActionLoading(false);
    addToast('CAPSULE_FAIL', 'Cryptographic Tamper Injected', 'Block #1 hash tampered. Run ledger verification to observe real-time detection.');
  };

  const handleRepairLedger = async () => {
    setActionLoading(true);
    await governanceApi.repairTamper();
    await loadOpsData();
    setActionLoading(false);
    addToast('AUTHORIZED', 'Ledger Restored', 'SHA-256 Hash Chain restored to clean 100% verified state.');
  };

  const policyRules = [
    { id: 'MAX_TRANSACTION_THRESHOLD', desc: 'Auto-escalate transactions > ₹1,00,00,000 for mandatory 2-officer sign-off.', threshold: '₹10,000,000', state: 'ENFORCING', last_updated: '2026-08-01' },
    { id: 'HIGH_RISK_COUNTRY_RULE', desc: 'Require high-confidence KYC provenance for high-risk OFAC/FATF jurisdictions.', threshold: 'Risk Tier > 0.70', state: 'ENFORCING', last_updated: '2026-08-05' },
    { id: 'CONFIDENCE_MINIMUM', desc: 'Minimum multi-agent consensus threshold required for autonomous approval.', threshold: '80% Consensus', state: 'ACTIVE', last_updated: '2026-08-10' },
    { id: 'EVIDENCE_MINIMUM', desc: 'Minimum evidence node sufficiency score for policy pass.', threshold: '0.85 Sufficiency', state: 'ACTIVE', last_updated: '2026-08-12' }
  ];

  return (
    <div className="relative min-h-screen pb-16">
      
      {/* Ghost Typography */}
      <GhostTypography text="GOVERN" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <h1 className="font-anton text-3xl sm:text-4xl tracking-wide uppercase text-white flex items-center space-x-3">
              <Activity className="w-8 h-8 text-emerald-400" />
              <span>ENGINEERING OPS & TELEMETRY CONSOLE</span>
            </h1>
            <p className="text-sm text-slate-400 font-sans mt-0.5">
              Live monitoring for agent trust scores, deterministic policy rules, service health & hash capsule integrity.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <button
              onClick={loadOpsData}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REFRESH TELEMETRY</span>
            </button>
          </div>
        </div>

        {/* 6 System Service Health Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Orchestrator API', status: systemStatus?.services?.orchestrator || 'HEALTHY' },
            { name: 'Agent Layer', status: systemStatus?.services?.agent_layer || 'HEALTHY' },
            { name: 'Memory Trust Gate', status: systemStatus?.services?.memory_trust_gate || 'HEALTHY' },
            { name: 'Policy Engine', status: systemStatus?.services?.policy_engine || 'HEALTHY' },
            { name: 'Database', status: systemStatus?.services?.database || 'HEALTHY' },
            { name: 'Capsule Integrity', status: ledgerVerification?.is_valid ? 'HEALTHY' : 'DEGRADED' }
          ].map(svc => (
            <div key={svc.name} className="mission-card rounded-xl p-3.5 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">{svc.name}</span>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${svc.status === 'HEALTHY' ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-ping'}`} />
                <span className={`text-xs font-mono font-bold ${svc.status === 'HEALTHY' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {svc.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* LIVE CRYPTOGRAPHIC TAMPER SIMULATION PANEL */}
        <div className={`mission-card rounded-xl p-5 border-2 transition-all ${
          ledgerVerification?.is_valid ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-red-500 bg-red-950/20'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl ${ledgerVerification?.is_valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {ledgerVerification?.is_valid ? <ShieldCheck className="w-6 h-6" /> : <TriangleAlert className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-anton text-lg text-white uppercase tracking-wide">
                  SHA-256 HASH CAPSULE LEDGER VERIFICATION
                </h3>
                <p className="text-xs font-mono text-slate-300">
                  {ledgerVerification?.is_valid
                    ? 'Ledger SHA-256 chain intact. All 184 capsule blocks verified without tamper.'
                    : 'TAMPER DETECTED! Cryptographic hash mismatch in historical block.'}
                </p>
              </div>
            </div>

            {/* Trigger Simulation & Repair Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSimulateTamper}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-mono font-bold transition-all flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>INJECT TAMPER SIMULATION</span>
              </button>

              <button
                onClick={handleRepairLedger}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>REPAIR LEDGER</span>
              </button>
            </div>
          </div>
        </div>

        {/* AGENT TRUST SCORES & PERFORMANCE TABLE */}
        <div className="mission-card rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h3 className="font-anton text-lg uppercase text-white tracking-wide">
                AGENT TRUST SCORES & HISTORICAL ACCURACY
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">10 Active Agents</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Current Trust Score</th>
                  <th className="py-2.5 px-3">Historical Accuracy</th>
                  <th className="py-2.5 px-3">Decisions</th>
                  <th className="py-2.5 px-3">Dissent Events</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {agentMetrics.map((agent) => (
                  <tr key={agent.agent_name} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{agent.agent_name}</td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-400 font-bold">{agent.current_trust_score}</span>
                    </td>
                    <td className="py-3 px-3">{agent.accuracy_percentage}%</td>
                    <td className="py-3 px-3 text-slate-400">{agent.total_decisions_participated}</td>
                    <td className="py-3 px-3 text-slate-400">{agent.recent_dissent_events || 0}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                        agent.status === 'HEALTHY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {agent.status || 'HEALTHY'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETERMINISTIC POLICY RULES VIEW */}
        <div className="mission-card rounded-xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <LockKeyhole className="w-5 h-5 text-sky-400" />
              <h3 className="font-anton text-lg uppercase text-white tracking-wide">
                DETERMINISTIC POLICY RULES REGISTRY
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Read-Only Governance Rules</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {policyRules.map((rule) => (
              <div key={rule.id} className="p-3.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sky-300 text-xs">{rule.id}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                    {rule.state}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {rule.desc}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                  <span>Threshold: <strong className="text-emerald-400">{rule.threshold}</strong></span>
                  <span>Updated: {rule.last_updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
