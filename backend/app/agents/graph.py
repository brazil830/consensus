import datetime
from typing import Dict, Any, List
from app.agents.state import DeliberationState, AgentDeliberationOutput, MemoryContext
from app.agents.specialist_agents import (
    ContextAnalyzerAgent, DataVerificationAgent, PlannerAgent,
    MemoryTrustAgent, RiskAssessmentAgent, ResourceImpactAgent,
    EthicsSafetyAgent, ConsensusAgent, RevisionAgent, RevisionValidatorAgent
)
from app.ml_models.autoencoder_anomaly import anomaly_detector
from app.ml_models.temporal_decay_engine import temporal_decay_engine
from app.ml_models.rlhf_escalation import rlhf_escalation_engine
from app.ml_models.hgnn_attribution import hgnn_attribution_engine

class DeliberationGraphOrchestrator:
    """
    LangGraph-style StateGraph Orchestrator coordinating the 10-Agent Deliberation Panel,
    ML Pre-Screeners, Temporal Knowledge Graph gating, and Consensus Synthesis.
    """
    def __init__(self):
        self.context_agent = ContextAnalyzerAgent()
        self.data_agent = DataVerificationAgent()
        self.planner_agent = PlannerAgent()
        self.memory_agent = MemoryTrustAgent()
        self.risk_agent = RiskAssessmentAgent()
        self.resource_agent = ResourceImpactAgent()
        self.ethics_agent = EthicsSafetyAgent()
        self.consensus_agent = ConsensusAgent()
        self.revision_agent = RevisionAgent()
        self.revision_validator = RevisionValidatorAgent()

    def run_stage_1_anomaly_screening(self, state: DeliberationState) -> DeliberationState:
        """Stage 1: Pre-Screening via Autoencoder & Isolation Forest"""
        is_anom, anom_score, details = anomaly_detector.detect_anomaly(state["payload"])
        state["is_anomaly"] = is_anom
        state["anomaly_score"] = anom_score
        state["anomaly_details"] = details
        state["timeline"].append({
            "stage": "1_ANOMALY_SCREENING",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "status": "ANOMALY_DETECTED" if is_anom else "PASSED",
            "score": anom_score,
            "details": details
        })
        return state

    def run_stage_2_memory_trust_gating(self, state: DeliberationState, precedents: List[Dict[str, Any]]) -> DeliberationState:
        """Stage 2: Temporal Knowledge Graph Retrieval & Exponential Decay Scoring"""
        processed_precedents: List[MemoryContext] = []
        primary_mode = "ADVISORY"
        
        now = datetime.datetime.utcnow()
        for p in precedents:
            created_at = p.get("created_at")
            if isinstance(created_at, str):
                created_at = datetime.datetime.fromisoformat(created_at.replace("Z", "+00:00")).replace(tzinfo=None)
            elif not isinstance(created_at, datetime.datetime):
                created_at = now - datetime.timedelta(days=float(p.get("age_days", 3)))

            regime = p.get("regulatory_regime", "RBI_2026_V2")
            base_trust = float(p.get("base_trust_score", 0.95))
            is_tampered = p.get("is_tampered", False)
            
            decay_score, decay_details = temporal_decay_engine.calculate_decay_score(
                base_trust=base_trust,
                created_at=created_at,
                current_time=now,
                regulatory_regime=regime,
                is_tampered=is_tampered
            )
            
            mode, explanation = temporal_decay_engine.classify_influence_mode(
                trust_score=decay_score,
                is_tampered=is_tampered,
                anomaly_score=state.get("anomaly_score", 0.0),
                regime_match=decay_details["regime_match"]
            )
            
            processed_precedents.append({
                "precedent_id": p.get("precedent_id", "PREC-001"),
                "summary": p.get("summary", ""),
                "base_trust_score": base_trust,
                "computed_trust_score": decay_score,
                "influence_mode": mode,
                "decay_details": decay_details
            })
            
            if mode in ["QUARANTINED", "ESCALATED", "REJECTED", "RESTRICTED"]:
                primary_mode = mode

        state["retrieved_precedents"] = processed_precedents
        state["primary_memory_mode"] = primary_mode
        state["timeline"].append({
            "stage": "2_MEMORY_TRUST_GATE",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "primary_influence_mode": primary_mode,
            "precedents_evaluated": len(processed_precedents)
        })
        return state

    def run_stage_3_specialist_deliberation(self, state: DeliberationState, agent_trust_scores: Dict[str, float]) -> DeliberationState:
        """Stage 3: Parallel 10-Agent Deliberation Panel execution"""
        proposals: List[AgentDeliberationOutput] = []

        # 1. Context Analyzer
        proposals.append(self.context_agent.run(state, agent_trust_scores.get(self.context_agent.name, 0.92)))
        # 2. Data Verification
        proposals.append(self.data_agent.run(state, agent_trust_scores.get(self.data_agent.name, 0.95)))
        # 3. Planner Agent
        proposals.append(self.planner_agent.run(state, agent_trust_scores.get(self.planner_agent.name, 0.90)))
        # 4. Memory Trust Agent
        proposals.append(self.memory_agent.run(state, agent_trust_scores.get(self.memory_agent.name, 0.94)))
        # 5. Risk Assessment Agent
        proposals.append(self.risk_agent.run(state, agent_trust_scores.get(self.risk_agent.name, 0.91)))
        # 6. Resource & Impact Agent
        proposals.append(self.resource_agent.run(state, agent_trust_scores.get(self.resource_agent.name, 0.86)))
        # 7. Ethics & Safety Agent
        proposals.append(self.ethics_agent.run(state, agent_trust_scores.get(self.ethics_agent.name, 0.96)))
        # 8. Revision Agent (if revision active)
        proposals.append(self.revision_agent.run(state, agent_trust_scores.get(self.revision_agent.name, 0.95)))
        # 9. Revision Validator Agent
        proposals.append(self.revision_validator.run(state, agent_trust_scores.get(self.revision_validator.name, 0.97)))

        state["agent_proposals"] = proposals
        return state

    def run_stage_4_consensus_synthesis(self, state: DeliberationState, agent_trust_scores: Dict[str, float]) -> DeliberationState:
        """Stage 4: Mathematical Weighted Consensus & Dissent Entropy Synthesis"""
        candidate, conf, entropy, prob_dist = rlhf_escalation_engine.calculate_weighted_consensus(
            state["agent_proposals"],
            agent_trust_scores
        )
        
        # Identify dissenting agents
        dissenters = [
            a["agent_name"] for a in state["agent_proposals"]
            if a["proposal"] != candidate
        ]

        state["consensus_candidate"] = candidate
        state["consensus_confidence"] = conf
        state["dissent_entropy"] = entropy
        state["vote_distribution"] = prob_dist
        state["dissenting_agents"] = dissenters
        state["evidence_sufficiency"] = 0.92 if state["primary_memory_mode"] == "ADVISORY" else 0.58

        # 10. Consensus Agent output synthesis
        consensus_output = self.consensus_agent.run(state, agent_trust_scores.get(self.consensus_agent.name, 0.98))
        state["agent_proposals"].append(consensus_output)

        # Compute HGNN Shapley Attributions
        attributions = hgnn_attribution_engine.compute_agent_shapley_attribution(
            state["agent_proposals"],
            candidate,
            conf
        )
        state["agent_attributions"] = attributions

        state["timeline"].append({
            "stage": "3_CONSENSUS_SYNTHESIS",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "consensus_candidate": candidate,
            "confidence": conf,
            "entropy": entropy,
            "dissenting_count": len(dissenters)
        })
        return state

orchestrator = DeliberationGraphOrchestrator()
