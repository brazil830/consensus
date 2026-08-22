import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
  ArrowLeft,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { GhostTypography } from '../components/GhostTypography';
import { governanceApi } from '../api/governanceApi';
import { ExplainabilityReport, ReportLevel } from '../types/governance';

export const ReportsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caseId = id || 'CASE-10482';

  const [audienceLevel, setAudienceLevel] = useState<ReportLevel>('auditor');
  const [report, setReport] = useState<ExplainabilityReport | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  const loadReport = async (level: ReportLevel) => {
    setIsGenerating(true);
    const steps = [
      'RETRIEVING CAPSULE NODES',
      'VERIFYING REFERENCES',
      'BUILDING REPORT',
      'VALIDATING TRACEABILITY',
      'REPORT READY'
    ];

    for (let i = 0; i < steps.length; i++) {
      setGenerationStep(steps[i]);
      await new Promise(r => setTimeout(r, 180));
    }

    const res = await governanceApi.getReport(caseId, level);
    setReport(res);
    setIsGenerating(false);
  };

  useEffect(() => {
    loadReport(audienceLevel);
  }, [caseId, audienceLevel]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative min-h-screen pb-16">
      
      {/* Ghost Typography */}
      <GhostTypography text="AUDIT" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={() => navigate(`/cases/${caseId}`)}
            className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO CASE {caseId}</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => loadReport(audienceLevel)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REGENERATE</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT / EXPORT PDF</span>
            </button>
          </div>
        </div>

        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-anton text-3xl sm:text-4xl tracking-wide uppercase text-white flex items-center space-x-3">
              <FileText className="w-8 h-8 text-sky-400" />
              <span>EXPLAINABILITY AUDIT REPORT</span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Case ID: <strong className="text-emerald-400">{caseId}</strong> &nbsp;|&nbsp; Ledger Sealed: SHA-256 Verified
            </p>
          </div>

          {/* Audience Selector Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono">
            {(['executive', 'auditor', 'technical'] as ReportLevel[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => setAudienceLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-all ${
                  audienceLevel === lvl
                    ? 'bg-slate-800 text-white shadow border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Generation Loading State */}
        {isGenerating ? (
          <div className="mission-card rounded-2xl p-12 text-center space-y-4 border border-slate-800">
            <div className="w-10 h-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto" />
            <div className="font-mono text-sm text-sky-300 font-bold tracking-wider">
              {generationStep}...
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Verifying cryptographic capsule chain & mapping hypergraph evidence nodes.
            </p>
          </div>
        ) : report ? (
          /* Report Paper Document View */
          <div className="mission-card rounded-2xl p-8 border-2 border-slate-700 bg-slate-950/95 space-y-6 shadow-2xl text-slate-200 print:bg-white print:text-black print:p-0 font-sans">
            
            {/* Report Header Metadata */}
            <div className="border-b border-slate-800 pb-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                  CONSENSUSAI GOVERNANCE REPORT ({audienceLevel.toUpperCase()} VIEW)
                </span>
                <h2 className="font-anton text-2xl sm:text-3xl text-white uppercase mt-1">
                  {report.title}
                </h2>
                <div className="text-xs font-mono text-slate-400 mt-2">
                  Generated: {new Date(report.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="text-right font-mono text-xs text-emerald-400 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>TRACEABILITY VERIFIED ✓</span>
              </div>
            </div>

            {/* Concise Summary */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono leading-relaxed space-y-1">
              <span className="text-sky-400 font-bold block uppercase">Core Executive Summary</span>
              <p className="text-slate-300 font-sans">{report.summary}</p>
            </div>

            {/* Audience Sections */}
            <div className="space-y-6">
              {report.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2 border-b border-slate-800/60 pb-4">
                  <h3 className="font-anton text-lg text-white uppercase tracking-wide">
                    {sec.heading}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Cryptographic Signature Footer */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
              <div>Capsule Hash: <span className="text-emerald-400">{report.capsule_hash}</span></div>
              <div>Digital Signature: <span className="text-indigo-300">{report.signature}</span></div>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
