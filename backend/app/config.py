import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "ConsensusAI - Decision Governance & Memory Trust Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./consensus_ai.db")
    
    # Governance Thresholds
    CONSENSUS_CONFIDENCE_THRESHOLD: float = 0.75  # Below this -> Escalate to HITL
    DISSENT_ENTROPY_THRESHOLD: float = 0.85       # High entropy -> Escalate to HITL
    EVIDENCE_SUFFICIENCY_THRESHOLD: float = 0.70  # Below this -> Escalate to HITL
    
    # Temporal Decay Parameters
    DEFAULT_LAMBDA_DECAY: float = 0.035           # Exponential decay rate per day
    ADVISORY_THRESHOLD: float = 0.85
    WEIGHTED_THRESHOLD: float = 0.65
    RESTRICTED_THRESHOLD: float = 0.40
    
    # Anomaly Detection Parameters
    ANOMALY_RECON_THRESHOLD: float = 0.45         # Reconstruction error threshold for quarantine
    
    # Hard Policy Limits (RBI / Financial Regulations)
    HARD_MAX_TRANSACTION_LIMIT: float = 500000.0   # $500k requires multi-sig / manual escalation
    SANCTIONED_COUNTRIES: list[str] = ["NK", "IR", "SY"]
    HIGH_RISK_MERCHANT_CODES: list[str] = ["7995", "6051", "5999"]
    CURRENT_REGULATORY_REGIME: str = "RBI_2026_V2"

settings = Settings()
