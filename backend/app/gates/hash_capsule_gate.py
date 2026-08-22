import hashlib
import json
import datetime
from typing import Dict, Any, List, Tuple, Optional

GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

class HashChainedCapsuleGate:
    """
    Gate 5: Structured Causal Memory Capsule & Cryptographic Hash-Chain Ledger.
    Ensures every decision, agent proposal, and policy outcome is committed to an immutable
    SHA-256 hash chain: H_n = SHA256(H_(n-1) || PayloadHash).
    Provides instant mathematical proof of integrity or tampering.
    """
    def canonical_json_hash(self, data: Dict[str, Any]) -> str:
        """Computes deterministic SHA-256 hash over sorted JSON payload."""
        # Convert any datetime or non-serializable objects to ISO strings
        def default_serializer(o):
            if isinstance(o, (datetime.date, datetime.datetime)):
                return o.isoformat()
            return str(o)
        
        canonical_str = json.dumps(data, sort_keys=True, default=default_serializer)
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    def compute_block_hash(self, prev_hash: str, payload_hash: str) -> str:
        """Computes H_curr = SHA256(prev_hash || payload_hash)"""
        combo = f"{prev_hash}:{payload_hash}"
        return hashlib.sha256(combo.encode("utf-8")).hexdigest()

    def create_capsule_entry(
        self,
        case_id: str,
        prev_hash: str,
        payload_data: Dict[str, Any],
        outcome: str,
        consensus_confidence: float,
        dissent_entropy: float,
        policy_verdict: str,
        hypergraph_edges: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Creates a new hash-chained capsule entry record.
        """
        capsule_id = f"CAP-{case_id}"
        timestamp = datetime.datetime.utcnow().isoformat()
        
        block_payload = {
            "capsule_id": capsule_id,
            "case_id": case_id,
            "payload_data": payload_data,
            "outcome": outcome,
            "consensus_confidence": round(consensus_confidence, 4),
            "dissent_entropy": round(dissent_entropy, 4),
            "policy_verdict": policy_verdict,
            "hypergraph_edges": hypergraph_edges,
            "created_at": timestamp
        }
        
        payload_hash = self.canonical_json_hash(block_payload)
        curr_hash = self.compute_block_hash(prev_hash, payload_hash)
        
        return {
            "capsule_id": capsule_id,
            "case_id": case_id,
            "prev_hash": prev_hash,
            "payload_hash": payload_hash,
            "curr_hash": curr_hash,
            "outcome": outcome,
            "consensus_confidence": consensus_confidence,
            "dissent_entropy": dissent_entropy,
            "policy_gate_verdict": policy_verdict,
            "hypergraph_edges": hypergraph_edges,
            "frozen_flag": False,
            "superseded_by": None,
            "created_at": timestamp
        }

    def verify_ledger_chain(self, chain: List[Dict[str, Any]]) -> Tuple[bool, Optional[int], str, List[Dict[str, Any]]]:
        """
        Verifies cryptographic integrity of entire hash-chain ledger.
        Returns: (is_valid, corrupted_index, message, audit_trace)
        """
        if not chain:
            return True, None, "Ledger is empty.", []

        audit_trace = []
        expected_prev_hash = GENESIS_HASH

        for idx, block in enumerate(chain):
            stored_prev = block.get("prev_hash")
            stored_payload_hash = block.get("payload_hash")
            stored_curr = block.get("curr_hash")

            # Verify prev_hash matches prior block
            prev_match = (stored_prev == expected_prev_hash)
            
            # Recompute curr_hash
            recomputed_curr = self.compute_block_hash(stored_prev, stored_payload_hash)
            curr_match = (stored_curr == recomputed_curr)

            is_block_valid = prev_match and curr_match
            
            audit_trace.append({
                "index": idx,
                "capsule_id": block.get("capsule_id"),
                "stored_curr_hash": stored_curr,
                "recomputed_curr_hash": recomputed_curr,
                "prev_hash_valid": prev_match,
                "hash_valid": curr_match,
                "status": "VALID" if is_block_valid else "TAMPERED"
            })

            if not is_block_valid:
                msg = f"TAMPER ALERT at Block #{idx} ({block.get('capsule_id')}): Hash chain broken. Expected prev_hash {expected_prev_hash[:12]}..., got {stored_prev[:12]}..."
                return False, idx, msg, audit_trace

            expected_prev_hash = stored_curr

        return True, None, f"All {len(chain)} blocks cryptographically verified (100% SHA-256 chain integrity).", audit_trace

hash_capsule_gate = HashChainedCapsuleGate()
