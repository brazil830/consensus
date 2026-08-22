import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  TriangleAlert,
  ShieldX,
  RotateCcw,
  FileText,
  Brain,
  Database,
  LockKeyhole,
  CheckCircle2,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { GhostTypography } from '../components/GhostTypography';
import { AgentDeliberationPanel } from '../components/AgentDeliberationPanel';
import { DissentPanel } from '../components/DissentPanel';
import { MemoryTrustGate } from '../components/MemoryTrustGate';
import { InteractiveMemoryGraph } from '../components/InteractiveMemoryGraph';
import { PolicyGate } from '../components/PolicyGate';
import { EvidenceTrail } from '../components/EvidenceTrail';
import { CapsuleIntegrityBadge } from '../components/CapsuleIntegrityBadge';
import { RevisionComparisonView } from '../components/RevisionComparisonView';
import { governanceApi } from '../api/governanceApi';
import { CaseDetailResponse } from '../types/governance';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caseId = id || 'CASE-10482';

  const [caseData, setCaseData] = useState<CaseDetailResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AGENTS' | 'EVIDENCE' | 'MEMORY' | 'POLICY' | 'AUDIT'>('OVERVIEW');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCase() {
      setLoading(true);
      const res = await governanceApi.getCaseDetail(caseId);
      setCaseData(res);
      setLoading(false);
    }
    loadCase();
  }, [caseId]);

  if (loading || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 font-mono text-xs text-slate-400">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span>LOADING GOVERNANCE CAPSULE {caseId}...</span>
        </div>
      </div>
    );
  }

  const { case: caseItem, deliberations, capsule, decision_delta } = caseData;

  const getGhostWord = () => {
    switch (caseItem.status) {
      case 'AUTHORIZED': return 'AUTHORIZED';
      case 'ESCALATED': return 'REVIEW';
      case 'BLOCKED': return 'CONTROL';
      case 'REVISED': return 'RECONSIDER';
      default: return 'CONSENSUS';
    }
  };

  return (
    <div className="relative min-h-screen pb-16">
      
      {/* Giant Ghost Background Typography */}
      <GhostTypography text={getGhostWord()} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Back Link & Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO COMMAND CENTER</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/reports/${caseId}`)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>VIEW EXPLAINABILITY REPORT</span>
            </button>
          </div>
        </div>

        {/* PROMINENT DECISION STATUS BANNER */}
        <div className={`mission-card rounded-2xl p-6 border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl transition-all ${
          caseItem.status === 'AUTHORIZED' ? 'bg-emerald-950/30 border-emerald-500/50' :
          caseItem.status === 'ESCALATED' ? 'bg-amber-950/30 border-amber-500/50' :
          caseItem.status === 'BLOCKED' ? 'bg-red-950/30 border-red-500/50' :
          'bg-sky-950/30 border-sky-500/50'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${
              caseItem.status === 'AUTHORIZED' ? 'bg-emerald-500/20 text-emerald-400' :
              caseItem.status === 'ESCALATED' ? 'bg-amber-500/20 text-amber-400' :
              caseItem.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400' :
              'bg-sky-500/20 text-sky-400'
            }`}>
              {caseItem.status === 'AUTHORIZED' ? <ShieldCheck className="w-10 h-10" /> :
               caseItem.status === 'ESCALATED' ? <TriangleAlert className="w-10 h-10" /> :
               caseItem.status === 'BLOCKED' ? <ShieldX className="w-10 h-10" /> :
               <RotateCcw className="w-10 h-10" />}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-slate-400">{caseItem.case_id}</span>
                <span className="text-xs font-mono text-slate-500">|</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">{caseItem.domain}</span>
              </div>
              <h1 className="font-anton text-3xl sm:text-4xl text-white uppercase tracking-tight">
                {caseItem.title}
              </h1>
              <div className="text-2xl font-anton text-emerald-300 mt-0.5">
                ₹{caseItem.amount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end text-left md:text-right space-y-2">
            <span className={`px-4 py-1 text-sm font-bold font-mono rounded-full border inline-block ${
              caseItem.status === 'AUTHORIZED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' :
              caseItem.status === 'ESCALATED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse' :
              caseItem.status === 'BLOCKED' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
              'bg-sky-500/20 text-sky-300 border-sky-500/50'
            }`}>
              DECISION: {caseItem.status}
            </span>

            <div className="text-xs font-mono text-slate-400">
              Consensus Confidence: <strong className="text-emerald-400">{Math.round((caseItem.consensus_confidence || 0.91) * 100)}%</strong>
            </div>

            <div className="text-[10px] font-mono text-slate-500">
              Sealed Capsule: {capsule?.capsule_id || 'CAP-7D3A-91BC-842500'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-b border-slate-800 text-xs font-mono overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Overview & Delta' },
            { id: 'AGENTS', label: 'Agent Deliberation' },
            { id: 'EVIDENCE', label: 'Evidence Trail' },
            { id: 'MEMORY', label: 'Memory Trust Gate' },
            { id: 'POLICY', label: 'Policy & Action Gate' },
            { id: 'AUDIT', label: 'Capsule Ledger Audit' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 font-bold transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-white bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Case Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Customer ID</span>
                <span className="text-sm font-bold font-mono text-white">{caseItem.payload?.customer_id || 'CUST-88392'}</span>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Channel</span>
                <span className="text-sm font-bold font-mono text-sky-400">{caseItem.payload?.channel || 'NET_BANKING_OTP'}</span>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Anomaly Score</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{Math.round(caseItem.anomaly_score * 100)}%</span>
              </div>
              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Risk Tier</span>
                <span className="text-sm font-bold font-mono text-amber-400">{caseItem.risk_tier || 'LOW'}</span>
              </div>
            </div>

            {/* Decision Revision Component if Revised */}
            <RevisionComparisonView delta={decision_delta} canRevise={true} />

            {/* Deliberation & Dissent Highlights */}
            <DissentPanel deliberations={deliberations} />

            {/* Policy Gate */}
            <PolicyGate verdict={caseItem.status} />
          </div>
        )}

        {activeTab === 'AGENTS' && (
          <div className="space-y-6 animate-fadeIn">
            <AgentDeliberationPanel deliberations={deliberations} />
            <DissentPanel deliberations={deliberations} />
          </div>
        )}

        {activeTab === 'EVIDENCE' && (
          <div className="space-y-6 animate-fadeIn">
            <EvidenceTrail caseId={caseId} />
          </div>
        )}

        {activeTab === 'MEMORY' && (
          <div className="space-y-6 animate-fadeIn">
            <MemoryTrustGate trustScore={0.84} influenceMode={caseItem.primary_memory_mode || 'WEIGHTED'} />
            <InteractiveMemoryGraph caseId={caseId} />
          </div>
        )}

        {activeTab === 'POLICY' && (
          <div className="space-y-6 animate-fadeIn">
            <PolicyGate verdict={caseItem.status} evidenceConfidence={0.91} consensusConfidence={caseItem.consensus_confidence || 0.91} />
          </div>
        )}

        {activeTab === 'AUDIT' && (
          <div className="space-y-6 animate-fadeIn">
            <CapsuleIntegrityBadge capsule={capsule} isValid={true} />
          </div>
        )}

      </div>
    </div>
  );
};
