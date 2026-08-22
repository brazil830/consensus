import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class MemoryTrustFeatures(BaseModel):
    case_id: str
    case_type: str = "banking_fraud"
    amount: float = 0.0
    current_policy_version: str = "RBI_2026_V2"
    risk_level: float = 0.5
    capsule_age_days: float = 0.0
    base_trust_score: float = 0.95
    provenance_reliability: float = 0.90
    evidence_count: int = 1
    evidence_quality_avg: float = 0.85
    outcome_historical_success: float = 0.90
    agent_contribution_count: int = 5
    policy_version_diff: float = 0.0
    hash_verification_result: float = 1.0  # 1.0 = verified, 0.0 = tampered
    contextual_compatibility: float = 0.88
    agent_disagreement_index: float = 0.20
    proposal_variance: float = 0.15
    confidence_dispersion: float = 0.10
    supporting_agent_count: int = 4
    dissenting_agent_count: int = 1

class MTDNNPrediction(BaseModel):
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    context_match_score: float = Field(..., ge=0.0, le=1.0)
    evidence_quality_score: float = Field(..., ge=0.0, le=1.0)
    temporal_validity_score: float = Field(..., ge=0.0, le=1.0)
    hash_integrity_score: float = Field(..., ge=0.0, le=1.0)
    
    dissent_severity: float = Field(..., ge=0.0, le=1.0)
    
    action_risk_score: float = Field(..., ge=0.0, le=1.0)
    action_risk_tier: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    
    confidence: float = Field(default=0.92, ge=0.0, le=1.0)
    model_version: str = "v1.0.0"
    inference_timestamp: str = Field(default_factory=lambda: datetime.datetime.utcnow().isoformat())
