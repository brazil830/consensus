import asyncio
import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
root_dir = os.path.abspath(os.path.join(backend_dir, ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from ml.mtdnn.inference import mtdnn_engine
from ml.hgnn.inference import hgnn_engine
from app.gates.policy_action_gate import policy_action_gate

async def run_mtdnn_hgnn_tests():
    print("=== Testing ConsensusAI — MT-DNN & HGNN Governance Models ===")

    # 1. Test MT-DNN Feature Extraction & Prediction
    print("[1/4] Testing MT-DNN Feature Extraction & 7 Output Dimensions...")
    payload = {"amount": 75000.0, "risk_level": 0.65}
    precedent = {"base_trust_score": 0.92, "age_days": 1.5, "is_tampered": False}
    delib_meta = {"agent_disagreement_index": 0.25}

    pred = mtdnn_engine.predict_trust_and_risk(payload, precedent, delib_meta)
    
    assert 0.0 <= pred.relevance_score <= 1.0, "Relevance score out of bounds"
    assert 0.0 <= pred.context_match_score <= 1.0, "Context match score out of bounds"
    assert 0.0 <= pred.evidence_quality_score <= 1.0, "Evidence quality score out of bounds"
    assert 0.0 <= pred.temporal_validity_score <= 1.0, "Temporal validity score out of bounds"
    assert 0.0 <= pred.hash_integrity_score <= 1.0, "Hash integrity score out of bounds"
    assert 0.0 <= pred.dissent_severity <= 1.0, "Dissent severity out of bounds"
    assert 0.0 <= pred.action_risk_score <= 1.0, "Action risk score out of bounds"
    assert pred.action_risk_tier in ["LOW", "MEDIUM", "HIGH", "CRITICAL"], "Invalid risk tier"

    print(f"  -> MT-DNN Passed! Relevance: {pred.relevance_score}, Risk: {pred.action_risk_score} ({pred.action_risk_tier})")

    # 2. Test MT-DNN Cryptographic Override
    print("[2/4] Testing MT-DNN Cryptographic Tamper Override...")
    tampered_precedent = {"base_trust_score": 0.95, "is_tampered": True}
    pred_tampered = mtdnn_engine.predict_trust_and_risk(payload, tampered_precedent, delib_meta)
    assert pred_tampered.hash_integrity_score == 0.0, "Tampered precedent must yield 0.0 hash integrity"
    assert pred_tampered.action_risk_score >= 0.90, "Tampered precedent must yield elevated action risk"
    print("  -> Cryptographic Tamper Override Passed! Tamper correctly forced hash_integrity=0.0")

    # 3. Test HGNN Causal Graph, Embeddings & Shapley Attribution
    print("[3/4] Testing HGNN Graph Construction & Shapley Credit/Blame Attribution...")
    test_deliberations = [
        {"agent_name": "Risk Assessment Agent", "proposal": "BLOCK", "confidence": 0.92, "trust_weight": 0.91, "evidence_nodes": ["E-102"]},
        {"agent_name": "Memory Trust Agent", "proposal": "BLOCK", "confidence": 0.95, "trust_weight": 0.94, "evidence_nodes": ["MC-77"]},
        {"agent_name": "Ethics & Safety Agent", "proposal": "BLOCK", "confidence": 0.88, "trust_weight": 0.96, "evidence_nodes": ["E-99"]}
    ]
    capsule_data = {"capsule_id": "CAP-TX-1001", "outcome": "BLOCKED", "consensus_confidence": 0.94}

    attr_res = hgnn_engine.attribute_credit_blame("TX-1001", test_deliberations, capsule_data)
    assert attr_res.outcome_id.startswith("OUT-"), "Invalid outcome ID in attribution"
    assert len(attr_res.contributors) > 0, "No contributors returned"
    assert attr_res.confidence >= 0.85, "Attribution confidence below threshold"
    print(f"  -> HGNN Attribution Passed! Primary contributor: {attr_res.contributors[0].node_id} ({attr_res.contributors[0].contribution_score*100:.1f}%)")

    # 4. Test HGNN Topological Anomaly Detection & Policy Precedence
    print("[4/4] Testing HGNN Topological Anomaly Detection & Policy Precedence...")
    normal_anom = hgnn_engine.detect_graph_anomalies("TX-1001", test_deliberations, capsule_data)
    assert not normal_anom.anomaly_detected, "False positive anomaly detected on normal graph"

    tampered_capsule = {"capsule_id": "CAP-TX-1001", "outcome": "BLOCKED", "is_tampered": True}
    tampered_anom = hgnn_engine.detect_graph_anomalies("TX-1001", test_deliberations, tampered_capsule)
    assert tampered_anom.anomaly_detected, "Failed to detect tamper in HGNN graph"
    assert tampered_anom.anomaly_type == "LINEAGE_BREAK", "Expected LINEAGE_BREAK anomaly type"

    # Test Deterministic Policy Gate Precedence (Hard rule blocks action regardless of low ML risk)
    verdict, rule, rationale = policy_action_gate.evaluate_policy(
        payload={"kyc_bypassed": True, "amount": 250000.0},
        consensus_candidate="AUTHORIZE",
        consensus_confidence=0.99,
        dissent_entropy=0.0,
        memory_mode="ADVISORY",
        evidence_sufficiency=0.90
    )

    assert verdict == "BLOCKED", f"Expected Policy Gate BLOCK on KYC bypass, got {verdict}"
    print("  -> HGNN Anomaly Detection & Deterministic Policy Gate Precedence Passed!")

    print("\nALL MT-DNN AND HGNN INTEGRATION TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(run_mtdnn_hgnn_tests())
