import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, ArrowRight, ShieldCheck, ShieldX, Lock, Check } from 'lucide-react';
import { DecisionDelta } from '../types/governance';

interface RevisionComparisonViewProps {
  delta?: DecisionDelta | null;
  onTriggerRevision?: (invalidatingEvidence: any) => void;
  canRevise?: boolean;
}

export const RevisionComparisonView: React.FC<RevisionComparisonViewProps> = ({
  delta = {
    delta_id: 'DELTA-9012-SCM',
    original_capsule_id: 'CAP-ORIG-450000-771',
    revised_capsule_id: 'CAP-REV-450000-881',
    faulty_assumptions: [
      'Assumption #1: Merchant "APEX_LOGISTICS_LTD" whitelist status active.',
      'Assumption #2: Settlement batch signature signed by verified corporate key.'
    ],
    causal_explanation: 'Audit evidence revealed corporate key revocation at 14:02 UTC prior to batch submission. Counterfactual evaluation flips outcome from AUTHORIZED -> BLOCKED.',
    replacement_outcome: 'BLOCKED',
    signature: 'ED25519-SIG-GOVERNANCE-CAUSAL-DELTA-9012'
  },
  onTriggerRevision,
  canRevise = true
}) => {
  const [showModal, setShowModal] = useState(false);
  const [invalidatingText, setInvalidatingText] = useState('');

  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTriggerRevision) {
      onTriggerRevision({ note: invalidatingText, timestamp: new Date().toISOString() });
    }
    setShowModal(false);
  };

  return (
    <div className="mission-card rounded-xl p-5 border border-slate-800 my-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-anton text-lg tracking-wide text-white uppercase flex items-center space-x-2">
              <span>COUNTERFACTUAL DECISION REVISION ENGINE</span>
            </h3>
            <p className="text-xs text-slate-400">
              Immutable causal ledger comparison — historical decision remains frozen.
            </p>
          </div>
        </div>

        {canRevise && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REQUEST REVISION</span>
          </button>
        )}
      </div>

      {/* Side by Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        
        {/* Frozen Original Decision */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center space-x-1">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>ORIGINAL DECISION (FROZEN)</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
              AUTHORIZED
            </span>
          </div>

          <div className="space-y-2 text-xs font-sans text-slate-300">
            <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Original Key Assumption</span>
              <span>Assumption A: Merchant corporate key verified & active at transaction time.</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Capsule Hash: CAP-ORIG-450000-771
            </div>
          </div>
        </div>

        {/* Counterfactual Revised Decision */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-sky-500/40 relative shadow-[0_0_20px_rgba(56,189,248,0.1)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-sky-300 uppercase flex items-center space-x-1">
              <RotateCcw className="w-3 h-3 text-sky-400" />
              <span>REVISED DECISION (ACTIVE)</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-red-500/20 text-red-300 border border-red-500/30 rounded">
              {delta?.replacement_outcome || 'BLOCKED'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-sans text-slate-300">
            <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Invalidated Assumption</span>
              <span className="text-red-300 font-semibold">{delta?.faulty_assumptions[0] || 'Assumption B: Corporate key revoked at 14:02 UTC prior to batch submission.'}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Replacement Capsule: {delta?.revised_capsule_id || 'CAP-REV-450000-881'}
            </div>
          </div>
        </div>

      </div>

      {/* Decision Delta Explanation Box */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
        <span className="text-sky-400 font-bold uppercase tracking-wider block">
          DECISION DELTA STATEMENT ({delta?.delta_id})
        </span>
        <p className="text-slate-300 font-sans leading-relaxed">
          "{delta?.causal_explanation}"
        </p>
        <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800 flex items-center justify-between">
          <span>Cryptographic Signature: {delta?.signature}</span>
          <span className="text-emerald-400 font-bold">Counterfactual Verified ✓</span>
        </div>
      </div>

      {/* Trigger Revision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#111827] border border-slate-700 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-anton text-lg uppercase text-white tracking-wide">
                REQUEST COUNTERFACTUAL REVISION
              </h4>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Provide invalidating evidence or new facts. The original capsule will be permanently frozen, and a signed Decision Delta will issue a replacement verdict.
            </p>

            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <textarea
                value={invalidatingText}
                onChange={(e) => setInvalidatingText(e.target.value)}
                required
                placeholder="Enter invalidating evidence, audit log references, or compromised key report..."
                className="w-full h-32 p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs font-mono rounded-lg transition-colors"
                >
                  Execute Counterfactual Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
