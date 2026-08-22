import React from 'react';
import { LockKeyhole, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CapsuleEntry } from '../types/governance';

interface CapsuleIntegrityProps {
  capsule?: CapsuleEntry | null;
  isValid?: boolean;
}

export const CapsuleIntegrityBadge: React.FC<CapsuleIntegrityProps> = ({
  capsule = {
    capsule_id: 'CAP-7D3A-91BC-842500',
    case_id: 'CASE-10482',
    prev_hash: '921F0B8734A1C8E90123456789ABCDEF0123456789ABCDEF0123456789ABCDEF',
    payload_hash: '7D3A91BC6621980AA4F77218B9C0D3E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1',
    curr_hash: 'E4F5A6B7C8D90123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123',
    outcome: 'AUTHORIZED',
    consensus_confidence: 0.91,
    dissent_entropy: 0.14,
    policy_gate_verdict: 'PASS',
    hypergraph_edges: [],
    frozen_flag: false,
    created_at: new Date(Date.now() - 3600000 * 1.8).toISOString()
  },
  isValid = true
}) => {
  if (!isValid) {
    return (
      <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-xl my-4 text-red-200 animate-pulse">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8 text-red-400" />
          <div>
            <h4 className="font-anton text-lg uppercase tracking-wider text-red-100">
              CAPSULE INTEGRITY FAILURE — CHAIN BROKEN
            </h4>
            <p className="text-xs font-mono text-red-300">
              SHA-256 Ledger digest mismatch detected. CASE PROCESSING PAUSED BY GOVERNANCE GATE.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mission-card rounded-xl p-5 border border-slate-800 my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <LockKeyhole className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-anton text-base tracking-wide text-white uppercase flex items-center space-x-2">
              <span>CAPSULE INTEGRITY LEDGER</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              STATUS: <strong className="text-emerald-400">VERIFIED</strong> &nbsp;|&nbsp; CHAIN: <strong className="text-emerald-400">INTACT</strong>
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-slate-400">
          <div>Sequence #{capsule?.sequence_num || 104}</div>
          <div className="text-[10px] text-slate-500">{capsule?.created_at ? new Date(capsule.created_at).toLocaleString() : '2026-08-20 18:41:22'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">CURRENT BLOCK HASH</span>
          <span className="text-emerald-400 font-bold break-all">{capsule?.curr_hash || 'E4F5A6B7C8D90123456789ABCDEF0123'}</span>
        </div>

        <div className="p-2.5 bg-slate-950/80 rounded border border-slate-800">
          <span className="text-[10px] text-slate-500 block uppercase">PREVIOUS LEDGER HASH</span>
          <span className="text-slate-300 font-semibold break-all">{capsule?.prev_hash || '921F0B8734A1C8E90123456789ABCDEF'}</span>
        </div>
      </div>
    </div>
  );
};
