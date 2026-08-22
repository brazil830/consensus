from typing import Dict, List, Any, Optional
from typing_extensions import TypedDict

class AgentDeliberationOutput(TypedDict):
    agent_name: str
    proposal: str               # AUTHORIZE, BLOCK, ESCALATE
    confidence: float          # 0.0 - 1.0
    trust_weight: float        # Historical trust score
    reasoning_text: str
    dissent_flag: bool
    evidence_nodes: List[str]

class MemoryContext(TypedDict):
    precedent_id: str
    summary: str
    base_trust_score: float
    computed_trust_score: float
    influence_mode: str        # ADVISORY, WEIGHTED, RESTRICTED, REJECTED, QUARANTINED, ESCALATED
    decay_details: Dict[str, Any]

class DeliberationState(TypedDict):
    case_id: str
    title: str
    payload: Dict[str, Any]
    
    # ML Gate 1 (Anomaly Detection)
    is_anomaly: bool
    anomaly_score: float
    anomaly_details: Dict[str, Any]
    
    # ML Gate 2 (Memory Trust & TKG)
    retrieved_precedents: List[MemoryContext]
    primary_memory_mode: str
    
    # Deliberation Phase (10 Agents)
    agent_proposals: List[AgentDeliberationOutput]
    
    # ML Gate 3 (Consensus & RLHF Boundary)
    consensus_candidate: str
    consensus_confidence: float
    dissent_entropy: float
    vote_distribution: Dict[str, float]
    dissenting_agents: List[str]
    evidence_sufficiency: float
    
    # ML Gate 4 (Causal Attribution)
    agent_attributions: Dict[str, float]
    
    # Gate 4 & 5 (Policy & Capsule)
    policy_gate_verdict: str   # AUTHORIZE, BLOCK, ESCALATE
    policy_rule_triggered: Optional[str]
    final_action: str          # AUTHORIZED, BLOCKED, ESCALATED, REVISED
    
    # Cryptographic Capsule
    capsule_id: Optional[str]
    prev_hash: Optional[str]
    payload_hash: Optional[str]
    curr_hash: Optional[str]
    
    # Decision Delta (Revision Engine)
    is_revision: bool
    decision_delta: Optional[Dict[str, Any]]
    
    # Execution Log
    timeline: List[Dict[str, Any]]
