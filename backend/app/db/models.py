import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class CaseModel(Base):
    __tablename__ = "cases"

    case_id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    domain = Column(String(64), default="banking_fraud")
    status = Column(String(32), default="IN_PROGRESS")  # IN_PROGRESS, AUTHORIZED, BLOCKED, ESCALATED, REVISED
    payload = Column(JSON, nullable=False)
    anomaly_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    deliberations = relationship("AgentDeliberationModel", back_populates="case", cascade="all, delete-orphan")
    capsule = relationship("CapsuleEntryModel", back_populates="case", cascade="all, delete-orphan")

class PrecedentTKGModel(Base):
    __tablename__ = "precedents_tkg"

    precedent_id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), nullable=True)
    entity_id = Column(String(64), nullable=False)
    relation = Column(String(64), nullable=False)
    target_entity_id = Column(String(64), nullable=False)
    valid_from = Column(DateTime, nullable=False)
    valid_to = Column(DateTime, nullable=True)
    regulatory_regime = Column(String(64), default="RBI_2026_V2")
    base_trust_score = Column(Float, default=0.95)
    provenance_source = Column(String(128), default="Verified_Core_Banking")
    summary = Column(Text, nullable=False)
    features = Column(JSON, default=dict)
    embedding_json = Column(JSON, nullable=True)  # Stores vector embedding array
    is_tampered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AgentDeliberationModel(Base):
    __tablename__ = "agent_deliberations"

    deliberation_id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.case_id"), nullable=False)
    agent_name = Column(String(64), nullable=False)
    proposal = Column(String(32), nullable=False)       # AUTHORIZE, BLOCK, ESCALATE
    confidence = Column(Float, nullable=False)          # 0.0 - 1.0
    trust_weight = Column(Float, nullable=False)        # 0.0 - 1.0
    reasoning_text = Column(Text, nullable=False)
    dissent_flag = Column(Boolean, default=False)
    evidence_nodes = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("CaseModel", back_populates="deliberations")

class CapsuleEntryModel(Base):
    __tablename__ = "capsule_entries"

    capsule_id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.case_id"), nullable=False)
    sequence_num = Column(Integer)
    prev_hash = Column(String(64), nullable=False)
    payload_hash = Column(String(64), nullable=False)
    curr_hash = Column(String(64), nullable=False)
    outcome = Column(String(32), nullable=False)
    consensus_confidence = Column(Float, nullable=False)
    dissent_entropy = Column(Float, nullable=False)
    policy_gate_verdict = Column(String(32), nullable=False)
    hypergraph_edges = Column(JSON, default=list)
    frozen_flag = Column(Boolean, default=False)
    superseded_by = Column(String(64), nullable=True)
    human_ruling = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    case = relationship("CaseModel", back_populates="capsule")

class DecisionDeltaModel(Base):
    __tablename__ = "decision_deltas"

    delta_id = Column(String(64), primary_key=True, index=True)
    original_capsule_id = Column(String(64), nullable=False)
    revised_capsule_id = Column(String(64), nullable=False)
    faulty_assumptions = Column(JSON, nullable=False)
    causal_explanation = Column(Text, nullable=False)
    replacement_outcome = Column(String(32), nullable=False)
    signature = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AgentTrustScoreModel(Base):
    __tablename__ = "agent_trust_scores"

    agent_name = Column(String(64), primary_key=True)
    current_trust_score = Column(Float, default=0.88)
    total_decisions_participated = Column(Integer, default=0)
    accurate_decisions_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

class ModelPredictionModel(Base):
    __tablename__ = "model_predictions"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.case_id"), nullable=False)
    memory_capsule_id = Column(String(64), nullable=True)
    model_name = Column(String(64), nullable=False)
    model_version = Column(String(32), nullable=False)
    prediction_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class HGNNAttributionModel(Base):
    __tablename__ = "hgnn_attributions"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.case_id"), nullable=False)
    outcome_id = Column(String(64), nullable=False)
    node_id = Column(String(64), nullable=False)
    node_type = Column(String(32), nullable=False)
    attention_weight = Column(Float, nullable=False)
    contribution_score = Column(Float, nullable=False)
    role = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ModelAnomalyModel(Base):
    __tablename__ = "model_anomalies"

    id = Column(String(64), primary_key=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.case_id"), nullable=False)
    model_name = Column(String(64), nullable=False)
    anomaly_type = Column(String(64), nullable=False)
    score = Column(Float, nullable=False)
    affected_nodes = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

