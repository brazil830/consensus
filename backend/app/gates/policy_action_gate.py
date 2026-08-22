from typing import Dict, Any, Tuple, Optional
from app.config import settings
from app.ml_models.rlhf_escalation import rlhf_escalation_engine

class DeterministicPolicyActionGate:
    """
    Gate 4: Deterministic Policy & Action Gate (Non-LLM Rule Engine).
    Applies statutory limits, KYC controls, sanction lists, and RLHF escalation boundaries.
    Cannot be overridden by agent proposals, even under unanimous 100% LLM confidence.
    """
    def evaluate_policy(
        self,
        payload: Dict[str, Any],
        consensus_candidate: str,
        consensus_confidence: float,
        dissent_entropy: float,
        memory_mode: str,
        evidence_sufficiency: float
    ) -> Tuple[str, Optional[str], str]:
        """
        Returns: (verdict, rule_triggered, rationale)
        Verdict: "AUTHORIZED", "BLOCKED", "ESCALATED"
        """
        amount = float(payload.get("amount", 0.0))
        country = str(payload.get("destination_country", "IN"))
        mcc = str(payload.get("merchant_category_code", "5411"))
        kyc_bypassed = payload.get("kyc_bypassed", False)
        is_tampered = payload.get("is_tampered", False)

        # -------------------------------------------------------------
        # 1. Hard Statutory Kill-Switches (Zero Override)
        # -------------------------------------------------------------
        if country in settings.SANCTIONED_COUNTRIES:
            return (
                "BLOCKED",
                "RULE_SANCTIONED_JURISDICTION",
                f"Statutory Block: Destination country '{country}' is on the official RBI / OFAC sanctions watch list."
            )

        if kyc_bypassed or is_tampered:
            return (
                "BLOCKED",
                "RULE_KYC_TAMPER_KILLSWITCH",
                "Statutory Block: Transaction flagged for bypassed KYC authentication or memory capsule tampering."
            )

        if mcc in settings.HIGH_RISK_MERCHANT_CODES and amount > 50000.0:
            return (
                "BLOCKED",
                "RULE_HIGH_RISK_MCC_CAP",
                f"Policy Block: High-risk merchant category (MCC {mcc}) exceeds maximum uncollateralized limit."
            )

        # -------------------------------------------------------------
        # 2. Hard Value Limits (Mandatory Multi-Sig Escalation)
        # -------------------------------------------------------------
        if amount > settings.HARD_MAX_TRANSACTION_LIMIT:
            return (
                "ESCALATED",
                "RULE_MAX_TRANSACTION_LIMIT",
                f"Statutory Escalation: Transaction amount (₹{amount:,.2f}) exceeds single-transaction automated threshold (₹{settings.HARD_MAX_TRANSACTION_LIMIT:,.2f}). Requires dual-authorization."
            )

        # -------------------------------------------------------------
        # 3. Memory Trust Gate Gating
        # -------------------------------------------------------------
        if memory_mode == "QUARANTINED":
            return (
                "BLOCKED",
                "RULE_MEMORY_QUARANTINE",
                "Governance Block: Candidate memory precedent quarantined due to detected adversarial corruption."
            )

        # -------------------------------------------------------------
        # 4. RLHF Dissent & Confidence Boundary
        # -------------------------------------------------------------
        should_escalate, esc_reason = rlhf_escalation_engine.evaluate_escalation_boundary(
            consensus_candidate=consensus_candidate,
            consensus_confidence=consensus_confidence,
            dissent_entropy=dissent_entropy,
            memory_trust_score=0.90,
            memory_mode=memory_mode,
            evidence_sufficiency=evidence_sufficiency
        )

        if should_escalate:
            return "ESCALATED", "RULE_RLHF_ESCALATION_BOUNDARY", esc_reason

        # -------------------------------------------------------------
        # 5. Consensus Recommendation Execution
        # -------------------------------------------------------------
        if consensus_candidate == "BLOCK":
            return "BLOCKED", None, "Multi-agent panel confirmed high fraud probability. Transaction blocked."

        if consensus_candidate == "ESCALATE":
            return "ESCALATED", None, "Multi-agent panel requested Human-in-the-Loop review."

        return "AUTHORIZED", None, "Transaction meets all policy, statutory, memory trust, and consensus criteria."

policy_action_gate = DeterministicPolicyActionGate()
