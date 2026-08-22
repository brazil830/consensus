from typing import List, Dict, Any, Tuple
from app.ml_models.temporal_decay_engine import temporal_decay_engine
from app.ml_models.vector_embedder import vector_embedder
from app.config import settings

class MemoryTrustGate:
    """
    Gate 2: Deterministic Memory Trust Gate.
    Filters and scores candidate precedents from the Causal Memory Capsule / TKG
    before any context is provided to the agent deliberation panel.
    """
    def filter_and_gate_precedents(
        self,
        query_payload: Dict[str, Any],
        candidate_precedents: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], str]:
        """
        Evaluates temporal decay, regime validity, and hybrid semantic rank.
        Returns: (gated_precedents, primary_mode)
        """
        query_text = f"{query_payload.get('amount')} {query_payload.get('merchant_category_code')} {query_payload.get('destination_country')}"
        query_vec = vector_embedder.embed_text(query_text)
        
        ranked_precedents = []
        primary_mode = "ADVISORY"
        
        for p in candidate_precedents:
            # Check vector similarity
            p_vec = p.get("embedding_json")
            if not p_vec:
                p_vec = vector_embedder.embed_text(p.get("summary", ""))
                p["embedding_json"] = p_vec
                
            base_trust = float(p.get("base_trust_score", 0.95))
            regime = p.get("regulatory_regime", settings.CURRENT_REGULATORY_REGIME)
            is_tampered = p.get("is_tampered", False)
            
            decay_score, details = temporal_decay_engine.calculate_decay_score(
                base_trust=base_trust,
                created_at=p.get("created_at"),
                regulatory_regime=regime,
                is_tampered=is_tampered
            )
            
            hybrid_score = vector_embedder.hybrid_rank(query_vec, p_vec, decay_score)
            p["computed_trust_score"] = decay_score
            p["hybrid_rank_score"] = hybrid_score
            p["decay_details"] = details
            
            mode, exp = temporal_decay_engine.classify_influence_mode(
                trust_score=decay_score,
                is_tampered=is_tampered,
                regime_match=details["regime_match"]
            )
            p["influence_mode"] = mode
            p["mode_explanation"] = exp
            
            ranked_precedents.append(p)
            
            # Escalate overall mode severity if any critical issue
            if mode in ["QUARANTINED", "ESCALATED"]:
                primary_mode = mode
            elif mode in ["REJECTED", "RESTRICTED"] and primary_mode not in ["QUARANTINED", "ESCALATED"]:
                primary_mode = mode

        # Sort by hybrid rank score descending
        ranked_precedents.sort(key=lambda x: x.get("hybrid_rank_score", 0.0), reverse=True)
        return ranked_precedents, primary_mode

memory_trust_gate = MemoryTrustGate()
