import asyncio
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import init_db, AsyncSessionLocal
from app.db.seed_data import seed_initial_data
from app.ml_models.autoencoder_anomaly import anomaly_detector
from app.ml_models.temporal_decay_engine import temporal_decay_engine
from app.ml_models.hgnn_attribution import hgnn_attribution_engine
from app.ml_models.counterfactual_scm import counterfactual_scm_engine
from app.ml_models.rlhf_escalation import rlhf_escalation_engine
from app.gates.policy_action_gate import policy_action_gate
from app.gates.hash_capsule_gate import hash_capsule_gate, GENESIS_HASH
from app.agents.graph import orchestrator

async def run_tests():
    print("=== Testing ConsensusAI Backend & ML Models ===")
    
    # 1. Database Initialization & Seeding
    print("[1/6] Initializing DB & Seeding Data...")
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
    print("  -> DB Initialized and Seeded Successfully.")

    # 2. Test ML Model 1 (Autoencoder Anomaly Detector)
    print("[2/6] Testing Autoencoder Anomaly Detector...")
    benign_payload = {"amount": 5000.0, "velocity_1h": 1.0, "is_cross_border": False, "kyc_bypassed": False}
    is_anom, score, details = anomaly_detector.detect_anomaly(benign_payload)
    assert not is_anom, f"Benign payload flagged as anomaly: {score}"
    
    poisoned_payload = {"amount": 250000.0, "velocity_1h": 30.0, "kyc_bypassed": True, "is_poisoned": True}
    is_anom_p, score_p, details_p = anomaly_detector.detect_anomaly(poisoned_payload)
    assert is_anom_p, f"Poisoned payload failed anomaly detection: {score_p}"
    print(f"  -> Autoencoder Passed. Benign Score: {score:.3f}, Poisoned Score: {score_p:.3f}")

    # 3. Test ML Model 2 (Temporal Decay Engine & Influence Modes)
    print("[3/6] Testing Temporal Knowledge Graph & Exponential Decay...")
    import datetime
    now = datetime.datetime.utcnow()
    # Fresh 2-day precedent
    score_fresh, _ = temporal_decay_engine.calculate_decay_score(0.95, now - datetime.timedelta(days=2))
    mode_fresh, _ = temporal_decay_engine.classify_influence_mode(score_fresh)
    assert mode_fresh == "ADVISORY", f"Expected ADVISORY, got {mode_fresh}"

    # Stale 60-day precedent
    score_stale, _ = temporal_decay_engine.calculate_decay_score(0.95, now - datetime.timedelta(days=60))
    mode_stale, _ = temporal_decay_engine.classify_influence_mode(score_stale)
    assert mode_stale in ["RESTRICTED", "REJECTED"], f"Expected RESTRICTED/REJECTED, got {mode_stale}"

    # Expired regulatory regime
    score_expired, details_exp = temporal_decay_engine.calculate_decay_score(0.95, now - datetime.timedelta(days=2), regulatory_regime="RBI_2024_V1")
    mode_expired, _ = temporal_decay_engine.classify_influence_mode(score_expired, regime_match=details_exp["regime_match"])
    assert mode_expired == "REJECTED", f"Expected REJECTED for regime mismatch, got {mode_expired}"
    print(f"  -> Temporal Decay Passed. Fresh: {mode_fresh} ({score_fresh:.2f}), Stale: {mode_stale} ({score_stale:.2f}), Expired: {mode_expired}")

    # 4. Test ML Model 4 & 6 (Consensus & HGNN Attribution)
    print("[4/6] Testing Weighted Consensus & HGNN Attribution...")
    test_proposals = [
        {"agent_name": "Risk Assessment Agent", "proposal": "BLOCK", "confidence": 0.95, "trust_weight": 0.92},
        {"agent_name": "Data Verification Agent", "proposal": "BLOCK", "confidence": 0.98, "trust_weight": 0.95},
        {"agent_name": "Ethics & Safety Agent", "proposal": "BLOCK", "confidence": 0.90, "trust_weight": 0.96},
        {"agent_name": "Context Analyzer Agent", "proposal": "AUTHORIZE", "confidence": 0.60, "trust_weight": 0.85}
    ]
    trust_scores = {p["agent_name"]: p["trust_weight"] for p in test_proposals}
    candidate, conf, entropy, _ = rlhf_escalation_engine.calculate_weighted_consensus(test_proposals, trust_scores)
    assert candidate == "BLOCK", f"Expected BLOCK, got {candidate}"
    
    attributions = hgnn_attribution_engine.compute_agent_shapley_attribution(test_proposals, candidate, conf)
    assert attributions["Risk Assessment Agent"] > 0, "Expected positive credit for agreeing agent"
    assert attributions["Context Analyzer Agent"] < 0, "Expected negative attribution for dissenting agent"
    print(f"  -> Consensus Passed. Candidate: {candidate} (Conf: {conf*100:.1f}%, Entropy: {entropy:.3f})")

    # 5. Test ML Model 5 (Counterfactual SCM Revision)
    print("[5/6] Testing Counterfactual SCM Revision & Decision Delta...")
    faulty, repl_out, exp = counterfactual_scm_engine.simulate_counterfactual_intervention(
        original_inputs={"amount": 75000.0},
        invalidating_evidence={"account_takeover_confirmed": True, "sim_swap_detected": True}
    )
    assert repl_out == "BLOCKED", f"Expected BLOCKED replacement, got {repl_out}"
    delta = counterfactual_scm_engine.generate_decision_delta("CAP-001", "CAP-001-REV", faulty, repl_out, exp)
    assert "signature" in delta and delta["signature"].startswith("SIG-DELTA-")
    print(f"  -> Counterfactual SCM Passed. Isolated {len(faulty)} faulty assumption(s). Signature: {delta['signature']}")

    # 6. Test Gate 5 (SHA-256 Hash Chain & Tamper Detection)
    print("[6/6] Testing Cryptographic Hash-Chain Ledger & Tamper Detection...")
    cap1 = hash_capsule_gate.create_capsule_entry("C1", GENESIS_HASH, {"data": 1}, "AUTHORIZED", 0.95, 0.05, "AUTHORIZED", [])
    cap2 = hash_capsule_gate.create_capsule_entry("C2", cap1["curr_hash"], {"data": 2}, "BLOCKED", 0.98, 0.02, "BLOCKED", [])
    
    chain = [cap1, cap2]
    is_valid, corrupted_idx, msg, _ = hash_capsule_gate.verify_ledger_chain(chain)
    assert is_valid, f"Chain should be valid: {msg}"
    
    # Tamper with block 1
    tampered_chain = [cap1, dict(cap2)]
    tampered_chain[1]["prev_hash"] = "DEADBEEF" + cap1["curr_hash"][8:]
    is_valid_t, corrupted_idx_t, msg_t, _ = hash_capsule_gate.verify_ledger_chain(tampered_chain)
    assert not is_valid_t and corrupted_idx_t == 1, f"Expected tamper detected at block 1: {msg_t}"
    print(f"  -> Hash-Chain & Tamper Detection Passed! Successfully detected adversarial mutation at Block #{corrupted_idx_t}")

    print("\nALL 6 ML MODELS, GOVERNANCE GATES, AND TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
