import json
import asyncio
import datetime
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.config import settings
from app.db.database import init_db, get_db
from app.db.models import (
    CaseModel, PrecedentTKGModel, AgentDeliberationModel,
    CapsuleEntryModel, DecisionDeltaModel, AgentTrustScoreModel,
    ModelPredictionModel, HGNNAttributionModel, ModelAnomalyModel
)
from app.db.seed_data import seed_initial_data
from app.agents.graph import orchestrator
from app.agents.state import DeliberationState
from app.gates.policy_action_gate import policy_action_gate
from app.gates.hash_capsule_gate import hash_capsule_gate, GENESIS_HASH
from app.gates.revision_engine import revision_engine
from app.explainability.rag_reporter import explainability_reporter
from app.ml_models.temporal_decay_engine import temporal_decay_engine
from app.ml_models.hgnn_attribution import hgnn_attribution_engine
from ml.mtdnn.inference import mtdnn_engine
from ml.hgnn.inference import hgnn_engine


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Adaptive Decision Governance & Memory Trust Layer for Autonomous Agents"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()
    async with app.state.db_session_factory() as session:
        await seed_initial_data(session)

from app.db.database import AsyncSessionLocal
app.state.db_session_factory = AsyncSessionLocal

# =====================================================================
# Service Health
# =====================================================================

@app.get("/")
async def root():
    """Provide a useful response when the backend URL is opened directly."""
    return {
        "service": settings.PROJECT_NAME,
        "status": "ONLINE",
        "api": "/api/status",
        "docs": "/docs"
    }

# =====================================================================
# Pydantic Schemas
# =====================================================================

class NewCaseRequest(BaseModel):
    title: str
    domain: str = "banking_fraud"
    payload: Dict[str, Any]

class EscalationRulingRequest(BaseModel):
    human_ruling: str  # "AUTHORIZED" or "BLOCKED"
    reviewer_notes: str
    reviewer_id: str = "REV-OFFICER-77"

class RevisionTriggerRequest(BaseModel):
    invalidating_evidence: Dict[str, Any]

# =====================================================================
# REST Endpoints
# =====================================================================

@app.get("/api/status")
async def get_system_status(db: AsyncSession = Depends(get_db)):
    """System overview and global integrity telemetry."""
    # Count cases
    cases_res = await db.execute(select(CaseModel))
    cases = cases_res.scalars().all()
    
    # Hash chain verification
    capsule_res = await db.execute(select(CapsuleEntryModel).order_by(CapsuleEntryModel.sequence_num))
    capsules = capsule_res.scalars().all()
    capsule_dicts = [
        {
            "capsule_id": c.capsule_id,
            "case_id": c.case_id,
            "prev_hash": c.prev_hash,
            "payload_hash": c.payload_hash,
            "curr_hash": c.curr_hash,
            "frozen_flag": c.frozen_flag
        } for c in capsules
    ]
    is_valid, corrupted_idx, msg, _ = hash_capsule_gate.verify_ledger_chain(capsule_dicts)
    
    # Average agent trust score
    agents_res = await db.execute(select(AgentTrustScoreModel))
    agents = agents_res.scalars().all()
    avg_trust = sum(a.current_trust_score for a in agents) / max(1, len(agents))
    
    return {
        "status": "ONLINE",
        "version": settings.VERSION,
        "current_regulatory_regime": settings.CURRENT_REGULATORY_REGIME,
        "total_cases_processed": len(cases),
        "capsule_ledger_height": len(capsules),
        "hash_chain_integrity": "SECURE" if is_valid else "TAMPER_DETECTED",
        "integrity_message": msg,
        "average_agent_trust_index": round(avg_trust, 4),
        "governance_gates_active": 5
    }

@app.get("/api/cases")
async def list_cases(db: AsyncSession = Depends(get_db)):
    """List all cases with status summary."""
    res = await db.execute(select(CaseModel).order_by(CaseModel.created_at.desc()))
    cases = res.scalars().all()
    return [
        {
            "case_id": c.case_id,
            "title": c.title,
            "domain": c.domain,
            "status": c.status,
            "amount": c.payload.get("amount", 0.0),
            "customer_id": c.payload.get("customer_id", "Unknown"),
            "anomaly_score": c.anomaly_score,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "resolved_at": c.resolved_at.isoformat() if c.resolved_at else None
        } for c in cases
    ]

@app.post("/api/cases")
async def create_case(req: NewCaseRequest, db: AsyncSession = Depends(get_db)):
    """Submit a new case for deliberation."""
    case_id = f"TX-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    new_case = CaseModel(
        case_id=case_id,
        title=req.title,
        domain=req.domain,
        status="IN_PROGRESS",
        payload=req.payload,
        anomaly_score=0.0
    )
    db.add(new_case)
    await db.commit()
    return {"case_id": case_id, "status": "IN_PROGRESS", "message": "Case queued for 5-Gate Deliberation."}

@app.get("/api/cases/{case_id}")
async def get_case_detail(case_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve complete case details, agent deliberations, and capsule block."""
    res = await db.execute(select(CaseModel).where(CaseModel.case_id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    delib_res = await db.execute(select(AgentDeliberationModel).where(AgentDeliberationModel.case_id == case_id))
    delibs = delib_res.scalars().all()

    cap_res = await db.execute(select(CapsuleEntryModel).where(CapsuleEntryModel.case_id == case_id))
    capsule = cap_res.scalar_one_or_none()

    delta_res = await db.execute(select(DecisionDeltaModel).where(
        (DecisionDeltaModel.original_capsule_id == (capsule.capsule_id if capsule else "")) |
        (DecisionDeltaModel.revised_capsule_id == (capsule.capsule_id if capsule else ""))
    ))
    delta = delta_res.scalar_one_or_none()

    return {
        "case": {
            "case_id": case.case_id,
            "title": case.title,
            "domain": case.domain,
            "status": case.status,
            "payload": case.payload,
            "amount": case.payload.get("amount", 0.0) if case.payload else 0.0,
            "anomaly_score": case.anomaly_score,
            "consensus_confidence": case.consensus_confidence if hasattr(case, 'consensus_confidence') and case.consensus_confidence else 0.91,
            "primary_memory_mode": case.primary_memory_mode if hasattr(case, 'primary_memory_mode') and case.primary_memory_mode else "WEIGHTED",
            "policy_verdict": case.policy_verdict if hasattr(case, 'policy_verdict') and case.policy_verdict else "PASS",
            "created_at": case.created_at.isoformat() if case.created_at else None,
            "resolved_at": case.resolved_at.isoformat() if case.resolved_at else None
        },
        "deliberations": [
            {
                "agent_name": d.agent_name,
                "proposal": d.proposal,
                "confidence": d.confidence,
                "trust_weight": d.trust_weight,
                "reasoning_text": d.reasoning_text,
                "dissent_flag": d.dissent_flag,
                "evidence_nodes": d.evidence_nodes
            } for d in delibs
        ],
        "capsule": {
            "capsule_id": capsule.capsule_id,
            "prev_hash": capsule.prev_hash,
            "payload_hash": capsule.payload_hash,
            "curr_hash": capsule.curr_hash,
            "outcome": capsule.outcome,
            "consensus_confidence": capsule.consensus_confidence,
            "dissent_entropy": capsule.dissent_entropy,
            "policy_gate_verdict": capsule.policy_gate_verdict,
            "hypergraph_edges": capsule.hypergraph_edges,
            "frozen_flag": capsule.frozen_flag,
            "superseded_by": capsule.superseded_by,
            "human_ruling": capsule.human_ruling,
            "created_at": capsule.created_at.isoformat() if capsule.created_at else None
        } if capsule else None,
        "decision_delta": {
            "delta_id": delta.delta_id,
            "original_capsule_id": delta.original_capsule_id,
            "revised_capsule_id": delta.revised_capsule_id,
            "faulty_assumptions": delta.faulty_assumptions,
            "causal_explanation": delta.causal_explanation,
            "replacement_outcome": delta.replacement_outcome,
            "signature": delta.signature
        } if delta else None
    }

# =====================================================================
# Server-Sent Events (SSE) Live Deliberation Streaming Endpoint
# =====================================================================

@app.get("/api/cases/{case_id}/deliberate/stream")
async def stream_deliberation(case_id: str, db: AsyncSession = Depends(get_db)):
    """
    Streams the 5-Stage Deliberation process in real time via Server-Sent Events (SSE).
    """
    res = await db.execute(select(CaseModel).where(CaseModel.case_id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Load precedents
    prec_res = await db.execute(select(PrecedentTKGModel))
    all_precedents = prec_res.scalars().all()
    prec_dicts = [
        {
            "precedent_id": p.precedent_id,
            "entity_id": p.entity_id,
            "relation": p.relation,
            "summary": p.summary,
            "base_trust_score": p.base_trust_score,
            "regulatory_regime": p.regulatory_regime,
            "created_at": p.created_at,
            "is_tampered": p.is_tampered,
            "embedding_json": p.embedding_json
        } for p in all_precedents
    ]

    # Load agent trust scores
    agent_res = await db.execute(select(AgentTrustScoreModel))
    agents = agent_res.scalars().all()
    trust_scores = {a.agent_name: a.current_trust_score for a in agents}

    # Get last tail hash for hash chain
    cap_tail_res = await db.execute(select(CapsuleEntryModel).order_by(CapsuleEntryModel.sequence_num.desc()))
    last_cap = cap_tail_res.scalars().first()
    prev_tail_hash = last_cap.curr_hash if last_cap else GENESIS_HASH

    async def event_generator():
        # Initialize state
        state: DeliberationState = {
            "case_id": case.case_id,
            "title": case.title,
            "payload": case.payload,
            "is_anomaly": False,
            "anomaly_score": 0.0,
            "anomaly_details": {},
            "retrieved_precedents": [],
            "primary_memory_mode": "ADVISORY",
            "agent_proposals": [],
            "consensus_candidate": "AUTHORIZE",
            "consensus_confidence": 0.0,
            "dissent_entropy": 0.0,
            "vote_distribution": {},
            "dissenting_agents": [],
            "evidence_sufficiency": 0.9,
            "agent_attributions": {},
            "policy_gate_verdict": "IN_PROGRESS",
            "policy_rule_triggered": None,
            "final_action": "IN_PROGRESS",
            "capsule_id": None,
            "prev_hash": prev_tail_hash,
            "payload_hash": None,
            "curr_hash": None,
            "is_revision": False,
            "decision_delta": None,
            "timeline": []
        }

        # Step 1: Pre-Screening Autoencoder
        yield f"data: {json.dumps({'step': 1, 'name': 'ML Pre-Screening (Autoencoder)', 'status': 'PROCESSING', 'message': 'Evaluating payload for structural anomalies & memory poisoning...'})}\n\n"
        await asyncio.sleep(0.6)
        state = orchestrator.run_stage_1_anomaly_screening(state)
        yield f"data: {json.dumps({'step': 1, 'name': 'ML Pre-Screening (Autoencoder)', 'status': 'COMPLETED', 'anomaly_score': state['anomaly_score'], 'is_anomaly': state['is_anomaly'], 'details': state['anomaly_details']})}\n\n"
        await asyncio.sleep(0.4)

        # Step 2: Memory Trust Gate & Temporal Decay
        yield f"data: {json.dumps({'step': 2, 'name': 'Memory Trust Gate (TKG & Temporal Decay)', 'status': 'PROCESSING', 'message': 'Calculating exponential time-decay & regime validity...'})}\n\n"
        await asyncio.sleep(0.6)
        state = orchestrator.run_stage_2_memory_trust_gating(state, prec_dicts)
        yield f"data: {json.dumps({'step': 2, 'name': 'Memory Trust Gate (TKG & Temporal Decay)', 'status': 'COMPLETED', 'primary_mode': state['primary_memory_mode'], 'precedents': state['retrieved_precedents']})}\n\n"
        await asyncio.sleep(0.4)

        # Step 3: Specialist Agent Deliberation
        yield f"data: {json.dumps({'step': 3, 'name': '10-Agent Specialist Deliberation', 'status': 'PROCESSING', 'message': 'Executing parallel agent reasoning and evidence verification...'})}\n\n"
        await asyncio.sleep(0.7)
        state = orchestrator.run_stage_3_specialist_deliberation(state, trust_scores)
        yield f"data: {json.dumps({'step': 3, 'name': '10-Agent Specialist Deliberation', 'status': 'COMPLETED', 'proposals': state['agent_proposals']})}\n\n"
        await asyncio.sleep(0.4)

        # Step 4: Consensus Synthesis & Dissent Entropy
        yield f"data: {json.dumps({'step': 4, 'name': 'Consensus Synthesis & HGNN Attribution', 'status': 'PROCESSING', 'message': 'Calculating trust-scaled votes, Shannon entropy, and Shapley attributions...'})}\n\n"
        await asyncio.sleep(0.6)
        state = orchestrator.run_stage_4_consensus_synthesis(state, trust_scores)
        yield f"data: {json.dumps({'step': 4, 'name': 'Consensus Synthesis & HGNN Attribution', 'status': 'COMPLETED', 'candidate': state['consensus_candidate'], 'confidence': state['consensus_confidence'], 'entropy': state['dissent_entropy'], 'dissenters': state['dissenting_agents'], 'attributions': state['agent_attributions']})}\n\n"
        await asyncio.sleep(0.4)

        # Step 5: Deterministic Policy & Action Gate
        yield f"data: {json.dumps({'step': 5, 'name': 'Deterministic Policy & Action Gate', 'status': 'PROCESSING', 'message': 'Evaluating statutory hard rules and RLHF escalation boundary...'})}\n\n"
        await asyncio.sleep(0.5)
        verdict, rule_trig, rationale = policy_action_gate.evaluate_policy(
            payload=state["payload"],
            consensus_candidate=state["consensus_candidate"],
            consensus_confidence=state["consensus_confidence"],
            dissent_entropy=state["dissent_entropy"],
            memory_mode=state["primary_memory_mode"],
            evidence_sufficiency=state["evidence_sufficiency"]
        )
        state["policy_gate_verdict"] = verdict
        state["policy_rule_triggered"] = rule_trig
        state["final_action"] = verdict

        # Commit to SHA-256 Hash Capsule
        cap_entry = hash_capsule_gate.create_capsule_entry(
            case_id=state["case_id"],
            prev_hash=prev_tail_hash,
            payload_data=state["payload"],
            outcome=verdict,
            consensus_confidence=state["consensus_confidence"],
            dissent_entropy=state["dissent_entropy"],
            policy_verdict=verdict,
            hypergraph_edges=[{"type": "DELIBERATION_SYNTHESIS", "agents": len(state["agent_proposals"])}]
        )
        state["capsule_id"] = cap_entry["capsule_id"]
        state["payload_hash"] = cap_entry["payload_hash"]
        state["curr_hash"] = cap_entry["curr_hash"]

        # Persist results in DB
        async with AsyncSessionLocal() as sess:
            from sqlalchemy import delete
            import uuid
            
            # Update case status
            await sess.execute(
                update(CaseModel)
                .where(CaseModel.case_id == case.case_id)
                .values(status=verdict, anomaly_score=state["anomaly_score"], resolved_at=datetime.datetime.utcnow())
            )
            
            # Clear old deliberations for this case
            await sess.execute(delete(AgentDeliberationModel).where(AgentDeliberationModel.case_id == case.case_id))
            
            # Save deliberations with unique IDs
            for prop in state["agent_proposals"]:
                agent_slug = prop["agent_name"].replace(" ", "_")
                delib_id = f"DELIB-{case.case_id}-{agent_slug}-{uuid.uuid4().hex[:6]}"
                sess.add(AgentDeliberationModel(
                    deliberation_id=delib_id,
                    case_id=case.case_id,
                    agent_name=prop["agent_name"],
                    proposal=prop["proposal"],
                    confidence=prop["confidence"],
                    trust_weight=prop["trust_weight"],
                    reasoning_text=prop["reasoning_text"],
                    dissent_flag=prop["dissent_flag"],
                    evidence_nodes=prop["evidence_nodes"]
                ))
            
            # Update or replace capsule entry
            await sess.execute(delete(CapsuleEntryModel).where(CapsuleEntryModel.case_id == case.case_id))
            sess.add(CapsuleEntryModel(
                capsule_id=cap_entry["capsule_id"],
                case_id=case.case_id,
                prev_hash=cap_entry["prev_hash"],
                payload_hash=cap_entry["payload_hash"],
                curr_hash=cap_entry["curr_hash"],
                outcome=cap_entry["outcome"],
                consensus_confidence=cap_entry["consensus_confidence"],
                dissent_entropy=cap_entry["dissent_entropy"],
                policy_gate_verdict=cap_entry["policy_gate_verdict"],
                hypergraph_edges=cap_entry["hypergraph_edges"],
                frozen_flag=False
            ))

            # Run MT-DNN Prediction & Persist
            mtdnn_pred = mtdnn_engine.predict_trust_and_risk(
                query_payload=state["payload"],
                precedent_dict=prec_dicts[0] if prec_dicts else {},
                deliberation_meta={"agent_disagreement_index": state.get("dissent_entropy", 0.20)}
            )
            await sess.execute(delete(ModelPredictionModel).where(ModelPredictionModel.case_id == case.case_id))
            sess.add(ModelPredictionModel(
                id=f"PRED-{case.case_id}-{uuid.uuid4().hex[:6]}",
                case_id=case.case_id,
                memory_capsule_id=cap_entry["capsule_id"],
                model_name="MT-DNN-Governance",
                model_version=mtdnn_pred.model_version,
                prediction_json=mtdnn_pred.model_dump()
            ))

            # Run HGNN Attribution & Persist
            hgnn_attr = hgnn_engine.attribute_credit_blame(
                case_id=case.case_id,
                deliberations=state["agent_proposals"],
                capsule_data={"outcome": verdict, "capsule_id": cap_entry["capsule_id"], "consensus_confidence": state["consensus_confidence"]}
            )
            await sess.execute(delete(HGNNAttributionModel).where(HGNNAttributionModel.case_id == case.case_id))
            for contrib in hgnn_attr.contributors:
                sess.add(HGNNAttributionModel(
                    id=f"ATTR-{case.case_id}-{uuid.uuid4().hex[:6]}",
                    case_id=case.case_id,
                    outcome_id=hgnn_attr.outcome_id,
                    node_id=contrib.node_id,
                    node_type=contrib.node_type,
                    attention_weight=contrib.attention_weight,
                    contribution_score=contrib.contribution_score,
                    role=contrib.role
                ))

            # Run HGNN Anomaly Detection & Persist
            hgnn_anom = hgnn_engine.detect_graph_anomalies(
                case_id=case.case_id,
                deliberations=state["agent_proposals"],
                capsule_data={"outcome": verdict, "capsule_id": cap_entry["capsule_id"]}
            )
            await sess.execute(delete(ModelAnomalyModel).where(ModelAnomalyModel.case_id == case.case_id))
            sess.add(ModelAnomalyModel(
                id=f"ANOM-{case.case_id}-{uuid.uuid4().hex[:6]}",
                case_id=case.case_id,
                model_name="HGNN-CausalAttribution",
                anomaly_type=hgnn_anom.anomaly_type,
                score=hgnn_anom.anomaly_score,
                affected_nodes=hgnn_anom.affected_nodes
            ))

            await sess.commit()


        yield f"data: {json.dumps({'step': 5, 'name': 'Deterministic Policy & Action Gate', 'status': 'COMPLETED', 'verdict': verdict, 'rule_triggered': rule_trig, 'rationale': rationale, 'capsule': cap_entry})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# =====================================================================
# Decision Revision & Replacement Endpoint
# =====================================================================

@app.post("/api/cases/{case_id}/revise")
async def revise_case(case_id: str, req: RevisionTriggerRequest, db: AsyncSession = Depends(get_db)):
    """
    Triggers the Counterfactual SCM Revision Engine.
    Freezes the original capsule block, isolates faulty assumptions, and generates a signed Decision Delta.
    """
    cap_res = await db.execute(select(CapsuleEntryModel).where(CapsuleEntryModel.case_id == case_id))
    orig_cap = cap_res.scalar_one_or_none()
    if not orig_cap:
        raise HTTPException(status_code=404, detail="Original capsule entry not found")

    # Get last tail hash and last sequence num
    tail_res = await db.execute(select(CapsuleEntryModel).order_by(CapsuleEntryModel.sequence_num.desc()))
    last_cap = tail_res.scalars().first()
    prev_tail = last_cap.curr_hash if last_cap else GENESIS_HASH
    next_seq = (last_cap.sequence_num + 1) if (last_cap and last_cap.sequence_num) else 5

    orig_cap_dict = {
        "capsule_id": orig_cap.capsule_id,
        "case_id": orig_cap.case_id,
        "payload_data": {"case_id": case_id},
        "outcome": orig_cap.outcome
    }

    frozen_orig, revised_cap, delta = revision_engine.execute_revision(
        original_capsule=orig_cap_dict,
        invalidating_evidence=req.invalidating_evidence,
        prev_chain_tail_hash=prev_tail
    )

    # Ensure revised case exists in cases table
    revised_case_id = revised_cap["case_id"]
    existing_case_res = await db.execute(select(CaseModel).where(CaseModel.case_id == revised_case_id))
    if not existing_case_res.scalar_one_or_none():
        db.add(CaseModel(
            case_id=revised_case_id,
            title=f"Revised: {case_id}",
            domain="banking_fraud",
            status=revised_cap["outcome"],
            payload={"original_case_id": case_id, "evidence": req.invalidating_evidence},
            anomaly_score=0.88,
            created_at=datetime.datetime.utcnow(),
            resolved_at=datetime.datetime.utcnow()
        ))
        await db.flush()

    # Update DB: freeze original
    await db.execute(
        update(CapsuleEntryModel)
        .where(CapsuleEntryModel.capsule_id == orig_cap.capsule_id)
        .values(frozen_flag=True, superseded_by=revised_cap["capsule_id"])
    )

    # Add revised capsule
    db.add(CapsuleEntryModel(
        capsule_id=revised_cap["capsule_id"],
        case_id=revised_case_id,
        sequence_num=next_seq,
        prev_hash=revised_cap["prev_hash"],
        payload_hash=revised_cap["payload_hash"],
        curr_hash=revised_cap["curr_hash"],
        outcome=revised_cap["outcome"],
        consensus_confidence=revised_cap["consensus_confidence"],
        dissent_entropy=revised_cap["dissent_entropy"],
        policy_gate_verdict=revised_cap["policy_gate_verdict"],
        hypergraph_edges=revised_cap["hypergraph_edges"],
        frozen_flag=False
    ))

    # Add Decision Delta
    db.add(DecisionDeltaModel(
        delta_id=delta["delta_id"],
        original_capsule_id=delta["original_capsule_id"],
        revised_capsule_id=delta["revised_capsule_id"],
        faulty_assumptions=delta["faulty_assumptions"],
        causal_explanation=delta["causal_explanation"],
        replacement_outcome=delta["replacement_outcome"],
        signature=delta["signature"]
    ))

    # Update Case Status to REVISED
    await db.execute(
        update(CaseModel)
        .where(CaseModel.case_id == case_id)
        .values(status="REVISED")
    )
    await db.commit()

    return {
        "status": "REVISED",
        "message": "Decision successfully revised via Counterfactual SCM.",
        "decision_delta": delta,
        "frozen_original_id": orig_cap.capsule_id,
        "replacement_capsule_id": revised_cap["capsule_id"]
    }

# =====================================================================
# Human-in-the-Loop Escalation Endpoint
# =====================================================================

@app.post("/api/escalation/{case_id}/resolve")
async def resolve_escalation(case_id: str, req: EscalationRulingRequest, db: AsyncSession = Depends(get_db)):
    """Captures human reviewer ruling and seals it into the permanent hash capsule."""
    res = await db.execute(select(CaseModel).where(CaseModel.case_id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    ruling_payload = {
        "human_ruling": req.human_ruling,
        "reviewer_notes": req.reviewer_notes,
        "reviewer_id": req.reviewer_id,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

    # Update case status
    await db.execute(
        update(CaseModel)
        .where(CaseModel.case_id == case_id)
        .values(status=req.human_ruling, resolved_at=datetime.datetime.utcnow())
    )

    # Update capsule with human ruling
    await db.execute(
        update(CapsuleEntryModel)
        .where(CapsuleEntryModel.case_id == case_id)
        .values(human_ruling=ruling_payload, outcome=req.human_ruling)
    )
    await db.commit()

    return {"status": req.human_ruling, "message": "Human reviewer ruling permanently recorded in Hash Capsule."}

# =====================================================================
# Explainability & Reports Endpoint
# =====================================================================

@app.get("/api/reports/{case_id}")
async def get_explainability_report(case_id: str, level: str = Query("auditor", regex="^(executive|auditor|technical)$"), db: AsyncSession = Depends(get_db)):
    """Generates on-demand audience-tailored explainability report."""
    res = await db.execute(select(CaseModel).where(CaseModel.case_id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    delib_res = await db.execute(select(AgentDeliberationModel).where(AgentDeliberationModel.case_id == case_id))
    delibs = delib_res.scalars().all()

    cap_res = await db.execute(select(CapsuleEntryModel).where(CapsuleEntryModel.case_id == case_id))
    capsule = cap_res.scalar_one_or_none()

    case_dict = {"case_id": case.case_id, "status": case.status, "payload": case.payload, "anomaly_score": case.anomaly_score}
    delib_dicts = [{"agent_name": d.agent_name, "proposal": d.proposal, "confidence": d.confidence, "reasoning_text": d.reasoning_text, "dissent_flag": d.dissent_flag} for d in delibs]
    cap_dict = {
        "capsule_id": capsule.capsule_id if capsule else None,
        "prev_hash": capsule.prev_hash if capsule else None,
        "curr_hash": capsule.curr_hash if capsule else None,
        "outcome": capsule.outcome if capsule else case.status,
        "consensus_confidence": capsule.consensus_confidence if capsule else 0.90,
        "dissent_entropy": capsule.dissent_entropy if capsule else 0.12,
        "policy_gate_verdict": capsule.policy_gate_verdict if capsule else case.status,
        "frozen_flag": capsule.frozen_flag if capsule else False,
        "superseded_by": capsule.superseded_by if capsule else None,
        "hypergraph_edges": capsule.hypergraph_edges if capsule else []
    }

    report = explainability_reporter.generate_report(case_dict, delib_dicts, cap_dict, level)
    return report

# =====================================================================
# Cryptographic Hash-Chain Verification & Tamper Simulation
# =====================================================================

@app.get("/api/capsule/verify")
async def verify_capsule_chain(db: AsyncSession = Depends(get_db)):
    """Verifies the complete SHA-256 hash chain across all stored capsules."""
    res = await db.execute(select(CapsuleEntryModel).order_by(CapsuleEntryModel.sequence_num))
    capsules = res.scalars().all()
    capsule_dicts = [
        {
            "capsule_id": c.capsule_id,
            "case_id": c.case_id,
            "prev_hash": c.prev_hash,
            "payload_hash": c.payload_hash,
            "curr_hash": c.curr_hash,
            "frozen_flag": c.frozen_flag
        } for c in capsules
    ]
    is_valid, corrupted_idx, message, audit_trace = hash_capsule_gate.verify_ledger_chain(capsule_dicts)
    return {
        "is_valid": is_valid,
        "total_blocks": len(capsules),
        "corrupted_block_index": corrupted_idx,
        "message": message,
        "audit_trace": audit_trace
    }

@app.post("/api/capsule/tamper-simulate")
async def simulate_tamper(block_index: int = 1, db: AsyncSession = Depends(get_db)):
    """
    Intentionally injects an adversarial modification into a historical capsule block
    to demonstrate live cryptographic detection by the SHA-256 hash chain!
    """
    res = await db.execute(select(CapsuleEntryModel).order_by(CapsuleEntryModel.sequence_num))
    capsules = res.scalars().all()
    if not capsules or block_index >= len(capsules):
        raise HTTPException(status_code=400, detail="Invalid block index")

    target_cap = capsules[block_index]
    # Tamper with prev_hash or payload_hash
    tampered_hash = "DEADBEEF" + target_cap.prev_hash[8:]
    await db.execute(
        update(CapsuleEntryModel)
        .where(CapsuleEntryModel.capsule_id == target_cap.capsule_id)
        .values(prev_hash=tampered_hash)
    )
    await db.commit()
    return {"message": f"Injected malicious tamper into Block #{block_index} ({target_cap.capsule_id}). Run /api/capsule/verify to observe detection."}

@app.post("/api/capsule/tamper-repair")
async def repair_tamper(db: AsyncSession = Depends(get_db)):
    """Repairs the hash chain back to a clean state by clearing and reseeding."""
    from app.db.models import CaseModel, PrecedentTKGModel, AgentDeliberationModel, CapsuleEntryModel, DecisionDeltaModel
    from sqlalchemy import delete
    
    await db.execute(delete(DecisionDeltaModel))
    await db.execute(delete(CapsuleEntryModel))
    await db.execute(delete(AgentDeliberationModel))
    await db.execute(delete(CaseModel))
    await db.execute(delete(PrecedentTKGModel))
    await db.commit()
    
    await seed_initial_data(db)
    return {"message": "Ledger restored to clean cryptographic state."}

# =====================================================================
# Temporal Knowledge Graph (TKG) & Agent Trust Endpoints
# =====================================================================

@app.get("/api/tkg")
async def get_tkg_data(db: AsyncSession = Depends(get_db)):
    """Retrieves all TKG precedents, decay statuses, and decay half-life curve points."""
    res = await db.execute(select(PrecedentTKGModel))
    precedents = res.scalars().all()
    
    prec_list = []
    for p in precedents:
        decay_score, details = temporal_decay_engine.calculate_decay_score(
            base_trust=p.base_trust_score,
            created_at=p.created_at,
            regulatory_regime=p.regulatory_regime,
            is_tampered=p.is_tampered
        )
        mode, exp = temporal_decay_engine.classify_influence_mode(
            trust_score=decay_score,
            is_tampered=p.is_tampered,
            regime_match=details["regime_match"]
        )
        prec_list.append({
            "precedent_id": p.precedent_id,
            "entity_id": p.entity_id,
            "relation": p.relation,
            "target_entity_id": p.target_entity_id,
            "summary": p.summary,
            "base_trust_score": p.base_trust_score,
            "computed_trust_score": decay_score,
            "influence_mode": mode,
            "mode_explanation": exp,
            "regulatory_regime": p.regulatory_regime,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "is_tampered": p.is_tampered,
            "decay_details": details
        })

    curve_points = temporal_decay_engine.generate_decay_curve_points(base_trust=0.95, max_days=60, steps=15)
    return {
        "precedents": prec_list,
        "decay_curve_points": curve_points,
        "current_regime": settings.CURRENT_REGULATORY_REGIME
    }

@app.get("/api/agents/trust")
async def get_agent_trust_metrics(db: AsyncSession = Depends(get_db)):
    """Retrieves all agent trust scores, participation counts, and historical accuracy."""
    res = await db.execute(select(AgentTrustScoreModel))
    agents = res.scalars().all()
    return [
        {
            "agent_name": a.agent_name,
            "current_trust_score": a.current_trust_score,
            "total_decisions_participated": a.total_decisions_participated,
            "accurate_decisions_count": a.accurate_decisions_count,
            "accuracy_percentage": round((a.accurate_decisions_count / max(1, a.total_decisions_participated)) * 100, 1),
            "last_updated": a.last_updated.isoformat() if a.last_updated else None
        } for a in agents
    ]

# =====================================================================
# ML Governance Endpoints (MT-DNN + HGNN)
# =====================================================================

@app.get("/api/cases/{case_id}/trust-analysis")
async def get_case_trust_analysis(case_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves 7-dimension MT-DNN Memory Trust & Risk analysis for a given case."""
    res = await db.execute(select(CaseModel).where(CaseModel.case_id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    pred_res = await db.execute(select(ModelPredictionModel).where(ModelPredictionModel.case_id == case_id))
    pred_row = pred_res.scalars().first()

    if pred_row:
        pred_dict = pred_row.prediction_json
    else:
        # Generate live inference
        prec_res = await db.execute(select(PrecedentTKGModel))
        precedents = prec_res.scalars().all()
        prec_dict = {
            "base_trust_score": precedents[0].base_trust_score,
            "regulatory_regime": precedents[0].regulatory_regime,
            "is_tampered": precedents[0].is_tampered
        } if precedents else {}

        mtdnn_pred = mtdnn_engine.predict_trust_and_risk(
            query_payload=case.payload,
            precedent_dict=prec_dict,
            deliberation_meta={"agent_disagreement_index": 0.20}
        )
        pred_dict = mtdnn_pred.model_dump()

    # Determine influence mode based on deterministic logic
    mode = "WEIGHTED"
    if pred_dict.get("hash_integrity_score", 1.0) == 0.0:
        mode = "QUARANTINED"
    elif pred_dict.get("action_risk_tier") in ["HIGH", "CRITICAL"]:
        mode = "RESTRICTED"

    return {
        "case_id": case_id,
        "trust_dimensions": {
            "relevance": pred_dict.get("relevance_score", 0.85),
            "context_match": pred_dict.get("context_match_score", 0.80),
            "evidence_quality": pred_dict.get("evidence_quality_score", 0.80),
            "temporal_validity": pred_dict.get("temporal_validity_score", 0.75),
            "hash_integrity": pred_dict.get("hash_integrity_score", 1.0),
        },
        "risk_assessment": {
            "dissent_severity": pred_dict.get("dissent_severity", 0.25),
            "action_risk_score": pred_dict.get("action_risk_score", 0.30),
            "action_risk_tier": pred_dict.get("action_risk_tier", "LOW"),
        },
        "influence_mode": mode,
        "model_metadata": {
            "model_name": "MT-DNN-Governance",
            "model_version": pred_dict.get("model_version", "v1.0.0"),
            "inference_timestamp": pred_dict.get("inference_timestamp")
        }
    }

@app.get("/api/cases/{case_id}/graph")
async def get_case_causal_graph(case_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves HGNN Heterogeneous Causal Graph topology and anomaly analysis."""
    res = await db.execute(select(CaseModel).where(CaseModel.case_id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    delib_res = await db.execute(select(AgentDeliberationModel).where(AgentDeliberationModel.case_id == case_id))
    delibs = [
        {
            "agent_name": d.agent_name,
            "proposal": d.proposal,
            "confidence": d.confidence,
            "trust_weight": d.trust_weight,
            "evidence_nodes": d.evidence_nodes
        } for d in delib_res.scalars().all()
    ]

    cap_res = await db.execute(select(CapsuleEntryModel).where(CapsuleEntryModel.case_id == case_id))
    capsule = cap_res.scalar_one_or_none()
    capsule_dict = {
        "capsule_id": capsule.capsule_id if capsule else f"MC-{case_id}",
        "outcome": capsule.outcome if capsule else case.status,
        "consensus_confidence": capsule.consensus_confidence if capsule else 0.90
    } if capsule else {"capsule_id": f"MC-{case_id}", "outcome": case.status, "consensus_confidence": 0.90}

    # Check for tampered flag in precedents
    prec_res = await db.execute(select(PrecedentTKGModel))
    all_precs = prec_res.scalars().all()
    is_tampered = any(p.is_tampered for p in all_precs)
    if is_tampered:
        capsule_dict["is_tampered"] = True

    # Build Graph & Anomaly Check
    from ml.hgnn.graph_builder import graph_builder
    graph = graph_builder.build_case_graph(case_id, delibs, capsule_dict)
    anomaly_result = hgnn_engine.detect_graph_anomalies(case_id, delibs, capsule_dict)

    return {
        "case_id": case_id,
        "nodes": graph["nodes"],
        "edges": graph["edges"],
        "anomaly_analysis": anomaly_result.model_dump()
    }

@app.get("/api/cases/{case_id}/attribution")
async def get_case_attribution(case_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieves HGNN Shapley Credit/Blame attribution for a decision outcome."""
    res = await db.execute(select(CaseModel).where(CaseModel.case_id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    delib_res = await db.execute(select(AgentDeliberationModel).where(AgentDeliberationModel.case_id == case_id))
    delibs = [
        {
            "agent_name": d.agent_name,
            "proposal": d.proposal,
            "confidence": d.confidence,
            "trust_weight": d.trust_weight,
            "evidence_nodes": d.evidence_nodes
        } for d in delib_res.scalars().all()
    ]

    cap_res = await db.execute(select(CapsuleEntryModel).where(CapsuleEntryModel.case_id == case_id))
    capsule = cap_res.scalar_one_or_none()
    capsule_dict = {
        "capsule_id": capsule.capsule_id if capsule else f"MC-{case_id}",
        "outcome": capsule.outcome if capsule else case.status,
        "consensus_confidence": capsule.consensus_confidence if capsule else 0.90
    } if capsule else {"capsule_id": f"MC-{case_id}", "outcome": case.status, "consensus_confidence": 0.90}

    attribution_result = hgnn_engine.attribute_credit_blame(case_id, delibs, capsule_dict)
    return attribution_result.model_dump()

@app.get("/api/ml/status")
async def get_ml_status():
    """Retrieves system-wide telemetry for active ML models (MT-DNN & HGNN)."""
    return {
        "status": "ONLINE",
        "models": {
            "mt_dnn": {
                "name": "MT-DNN Governance Model",
                "version": "v1.0.0",
                "status": "ONLINE" if mtdnn_engine.is_loaded else "DEGRADED",
                "features_dim": 16,
                "heads": 7,
                "latency_ms": 42
            },
            "hgnn": {
                "name": "Heterogeneous Graph Neural Network",
                "version": "v1.0.0",
                "status": "ONLINE" if hgnn_engine.is_loaded else "DEGRADED",
                "node_types": ["Agent", "MemoryCapsule", "ContextVariable", "Evidence", "Outcome"],
                "edge_types": ["PROPOSED", "CITES", "EVALUATED", "PRODUCED"],
                "latency_ms": 78
            }
        },
        "safe_fallback_active": not (mtdnn_engine.is_loaded and hgnn_engine.is_loaded)
    }

@app.post("/api/ml/mtdnn/predict")
async def predict_mtdnn_debug(payload: Dict[str, Any]):
    """Debug endpoint for MT-DNN prediction."""
    pred = mtdnn_engine.predict_trust_and_risk(payload.get("query", {}), payload.get("precedent", {}), payload.get("deliberation", {}))
    return pred.model_dump()

@app.post("/api/ml/hgnn/analyze")
async def analyze_hgnn_debug(payload: Dict[str, Any]):
    """Debug endpoint for HGNN graph analysis."""
    case_id = payload.get("case_id", "DEBUG-1")
    attr = hgnn_engine.attribute_credit_blame(case_id, payload.get("deliberations", []), payload.get("capsule", {}))
    anom = hgnn_engine.detect_graph_anomalies(case_id, payload.get("deliberations", []), payload.get("capsule", {}))
    return {
        "attribution": attr.model_dump(),
        "anomaly": anom.model_dump()
    }

