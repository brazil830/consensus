import math
from typing import Dict, List, Any, Tuple
from app.config import settings

class RLHFEscalationBoundaryEngine:
    """
    ML Model 6: RLHF-Informed Escalation Boundary & Dissent Entropy Engine.
    Evaluates multi-agent vote distributions, calculates Shannon dissent entropy,
    and maps the decision surface into automated execution vs Human-in-the-Loop escalation.
    """
    def calculate_weighted_consensus(
        self,
        proposals: List[Dict[str, Any]],
        agent_trust_scores: Dict[str, float]
    ) -> Tuple[str, float, float, Dict[str, float]]:
        """
        Computes mathematically weighted consensus:
        W_i = TrustScore_i * Confidence_i
        P_hat(c) = sum(W_i * I(vote=c)) / sum(W_i)
        Entropy H = - sum(P_hat(c) * log2(P_hat(c)))
        """
        classes = ["AUTHORIZE", "BLOCK", "ESCALATE"]
        class_weights = {c: 0.0 for c in classes}
        total_weight = 0.0

        for prop in proposals:
            name = prop.get("agent_name", "")
            vote = prop.get("proposal", "ESCALATE").upper()
            conf = float(prop.get("confidence", 0.5))
            trust = float(agent_trust_scores.get(name, 0.85))
            
            w_i = trust * conf
            if vote in class_weights:
                class_weights[vote] += w_i
            else:
                class_weights["ESCALATE"] += w_i
            total_weight += w_i

        if total_weight < 1e-6:
            return "ESCALATE", 0.33, 1.58, {c: 0.33 for c in classes}

        # Normalized probability distribution
        prob_dist = {c: round(class_weights[c] / total_weight, 4) for c in classes}

        # Find consensus candidate
        consensus_candidate = max(prob_dist, key=prob_dist.get)
        consensus_confidence = prob_dist[consensus_candidate]

        # Calculate Shannon Dissent Entropy
        entropy = 0.0
        for p in prob_dist.values():
            if p > 1e-6:
                entropy -= p * math.log2(p)
        entropy = round(entropy, 4)

        return consensus_candidate, consensus_confidence, entropy, prob_dist

    def evaluate_escalation_boundary(
        self,
        consensus_candidate: str,
        consensus_confidence: float,
        dissent_entropy: float,
        memory_trust_score: float,
        memory_mode: str,
        evidence_sufficiency: float
    ) -> Tuple[bool, str]:
        """
        Calibrated decision boundary:
        Returns: (should_escalate, escalation_reason)
        """
        # Rule 1: High Dissent Entropy
        if dissent_entropy > settings.DISSENT_ENTROPY_THRESHOLD:
            return True, f"High Agent Dissent Entropy ({dissent_entropy} > {settings.DISSENT_ENTROPY_THRESHOLD}). Specialist panel disagreed on risk assessment."

        # Rule 2: Low Consensus Confidence
        if consensus_confidence < settings.CONSENSUS_CONFIDENCE_THRESHOLD:
            return True, f"Consensus Confidence below safety threshold ({consensus_confidence * 100:.1f}% < {settings.CONSENSUS_CONFIDENCE_THRESHOLD * 100:.0f}%)."

        # Rule 3: Insufficient Evidence
        if evidence_sufficiency < settings.EVIDENCE_SUFFICIENCY_THRESHOLD:
            return True, f"Evidence Sufficiency score ({evidence_sufficiency:.2f}) is below the required 0.70 governance bar."

        # Rule 4: Memory Trust Mode is RESTRICTED or ESCALATED
        if memory_mode == "ESCALATED":
            return True, "Conflicting high-trust precedents in Memory Capsule require human arbitration."

        if memory_mode in ["RESTRICTED", "REJECTED"] and consensus_candidate == "AUTHORIZE":
            return True, f"Memory precedent is {memory_mode} (temporal decay / regime shift). System abstains from auto-authorization and routes to Human-in-the-Loop."

        return False, "Case passes all confidence, entropy, evidence, and memory trust governance boundaries."

rlhf_escalation_engine = RLHFEscalationBoundaryEngine()
