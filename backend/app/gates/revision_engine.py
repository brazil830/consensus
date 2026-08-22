from typing import Dict, Any, Tuple
from app.ml_models.counterfactual_scm import counterfactual_scm_engine
from app.gates.hash_capsule_gate import hash_capsule_gate

class DecisionRevisionEngine:
    """
    Gate 4 Extension: Decision Revision & Replacement Engine.
    When a past decision is flagged invalid (by audit, outcome feedback, or new evidence),
    isolates the faulty assumption via Pearl's Do-Calculus, freezes the original capsule entry,
    and produces a signed Decision Delta linking the frozen original to its replacement.
    """
    def execute_revision(
        self,
        original_capsule: Dict[str, Any],
        invalidating_evidence: Dict[str, Any],
        prev_chain_tail_hash: str
    ) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any]]:
        """
        Returns: (frozen_original, revised_capsule, decision_delta)
        """
        orig_capsule_id = original_capsule.get("capsule_id")
        orig_payload = original_capsule.get("payload_data", {})
        
        # 1. Counterfactual Simulation
        faulty_assumptions, replacement_outcome, explanation = counterfactual_scm_engine.simulate_counterfactual_intervention(
            original_inputs=orig_payload,
            invalidating_evidence=invalidating_evidence
        )

        # 2. Create Revised Capsule Entry
        revised_case_id = f"{original_capsule.get('case_id')}-REV"
        revised_payload = dict(orig_payload)
        revised_payload["revision_evidence"] = invalidating_evidence
        
        revised_capsule = hash_capsule_gate.create_capsule_entry(
            case_id=revised_case_id,
            prev_hash=prev_chain_tail_hash,
            payload_data=revised_payload,
            outcome=replacement_outcome,
            consensus_confidence=0.98,
            dissent_entropy=0.08,
            policy_verdict=replacement_outcome,
            hypergraph_edges=[
                {"type": "REVISION_LINK", "target": orig_capsule_id, "assumptions": faulty_assumptions}
            ]
        )

        # 3. Generate Signed Decision Delta
        decision_delta = counterfactual_scm_engine.generate_decision_delta(
            original_capsule_id=orig_capsule_id,
            revised_capsule_id=revised_capsule["capsule_id"],
            faulty_assumptions=faulty_assumptions,
            replacement_outcome=replacement_outcome,
            causal_explanation=explanation
        )

        # 4. Freeze Original Capsule (immutable pointer)
        frozen_original = dict(original_capsule)
        frozen_original["frozen_flag"] = True
        frozen_original["superseded_by"] = revised_capsule["capsule_id"]

        return frozen_original, revised_capsule, decision_delta

revision_engine = DecisionRevisionEngine()
