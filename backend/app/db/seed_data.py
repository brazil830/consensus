import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import CaseModel, PrecedentTKGModel, AgentTrustScoreModel, CapsuleEntryModel
from app.gates.hash_capsule_gate import GENESIS_HASH, hash_capsule_gate
from app.ml_models.vector_embedder import vector_embedder

DEFAULT_AGENTS = [
    "Context Analyzer Agent",
    "Data Verification Agent",
    "Planner Agent",
    "Memory Trust Agent",
    "Risk Assessment Agent",
    "Resource & Impact Agent",
    "Ethics & Safety Agent",
    "Consensus Agent",
    "Revision Agent",
    "Revision Validator Agent"
]

async def seed_initial_data(session: AsyncSession):
    # 1. Seed Agent Trust Scores
    res = await session.execute(select(AgentTrustScoreModel))
    existing_agents = res.scalars().all()
    if not existing_agents:
        for name in DEFAULT_AGENTS:
            score = 0.94 if "Ethics" in name or "Data" in name else 0.90
            session.add(AgentTrustScoreModel(
                agent_name=name,
                current_trust_score=score,
                total_decisions_participated=120,
                accurate_decisions_count=114
            ))

    # 2. Seed Baseline Precedents for TKG
    res = await session.execute(select(PrecedentTKGModel))
    existing_precedents = res.scalars().all()
    if not existing_precedents:
        now = datetime.datetime.utcnow()
        precedents = [
            PrecedentTKGModel(
                precedent_id="PREC-2026-001-USEFUL",
                entity_id="CUST-1049",
                relation="AUTHORIZED_HIGH_VALUE_WIRE",
                target_entity_id="MERCHANT-GLOBAL-TECH",
                valid_from=now - datetime.timedelta(days=3),
                valid_to=now + datetime.timedelta(days=365),
                regulatory_regime="RBI_2026_V2",
                base_trust_score=0.96,
                provenance_source="Verified_Core_Banking",
                summary="Customer #1049 authorized recurring international SaaS settlement ₹24,500 with biometric token.",
                features={"amount": 24500.0, "mcc": "5734", "verified": True},
                embedding_json=vector_embedder.embed_text("Customer 1049 authorized recurring international SaaS settlement ₹24500 with biometric token."),
                is_tampered=False
            ),
            PrecedentTKGModel(
                precedent_id="PREC-2024-089-STALE",
                entity_id="CUST-8812",
                relation="EXEMPT_REMITTANCE",
                target_entity_id="MERCHANT-OVERSEAS-EXCHANGE",
                valid_from=now - datetime.timedelta(days=450),
                valid_to=now - datetime.timedelta(days=90),
                regulatory_regime="RBI_2024_V1",
                base_trust_score=0.88,
                provenance_source="Legacy_Gateway_2024",
                summary="Remittance of ₹45,000 processed under expired 2024 liberalized remittance tax scheme.",
                features={"amount": 45000.0, "mcc": "6051", "verified": True},
                embedding_json=vector_embedder.embed_text("Remittance of ₹45000 processed under expired 2024 liberalized remittance tax scheme."),
                is_tampered=False
            ),
            PrecedentTKGModel(
                precedent_id="PREC-2026-999-POISONED",
                entity_id="CUST-9999",
                relation="FORGED_PRE_APPROVAL",
                target_entity_id="SHADY-CRYPTO-NODE",
                valid_from=now - datetime.timedelta(days=1),
                valid_to=now + datetime.timedelta(days=30),
                regulatory_regime="RBI_2026_V2",
                base_trust_score=0.99,
                provenance_source="UNVERIFIED_INJECTION_NODE",
                summary="Forged precedent injecting fabricated AAA credit rating and bypassed AML verification.",
                features={"amount": 180000.0, "mcc": "6051", "kyc_bypassed": True},
                embedding_json=vector_embedder.embed_text("Forged precedent injecting fabricated AAA credit rating and bypassed AML verification."),
                is_tampered=True
            )
        ]
        for p in precedents:
            session.add(p)

    # 3. Seed Demo Cases (The 4 Scripted Scenarios)
    res = await session.execute(select(CaseModel))
    existing_cases = res.scalars().all()
    if not existing_cases:
        now = datetime.datetime.utcnow()
        
        # Case 1: Useful Fresh Memory
        case1 = CaseModel(
            case_id="TX-1001-USEFUL",
            title="Scenario 1: Verified International SaaS Payment (Useful Memory)",
            domain="banking_fraud",
            status="AUTHORIZED",
            payload={
                "customer_id": "CUST-1049",
                "amount": 24500.0,
                "merchant_name": "Global Tech Cloud Services",
                "merchant_category_code": "5734",
                "destination_country": "US",
                "is_cross_border": True,
                "velocity_1h": 1.0,
                "account_age_days": 420,
                "device_trust_score": 0.95,
                "proxy_detected": False,
                "sim_swap_detected": False,
                "kyc_bypassed": False,
                "is_vip_customer": True,
                "raw_risk_score": 0.08
            },
            anomaly_score=0.04,
            created_at=now - datetime.timedelta(minutes=15),
            resolved_at=now - datetime.timedelta(minutes=14)
        )
        session.add(case1)
        await session.flush()

        cap1 = hash_capsule_gate.create_capsule_entry(
            case_id=case1.case_id,
            prev_hash=GENESIS_HASH,
            payload_data=case1.payload,
            outcome="AUTHORIZED",
            consensus_confidence=0.96,
            dissent_entropy=0.04,
            policy_verdict="AUTHORIZED",
            hypergraph_edges=[{"type": "PRECEDENT_LINK", "id": "PREC-2026-001-USEFUL"}]
        )
        session.add(CapsuleEntryModel(
            capsule_id=cap1["capsule_id"],
            case_id=case1.case_id,
            sequence_num=1,
            prev_hash=cap1["prev_hash"],
            payload_hash=cap1["payload_hash"],
            curr_hash=cap1["curr_hash"],
            outcome=cap1["outcome"],
            consensus_confidence=cap1["consensus_confidence"],
            dissent_entropy=cap1["dissent_entropy"],
            policy_gate_verdict=cap1["policy_gate_verdict"],
            hypergraph_edges=cap1["hypergraph_edges"],
            frozen_flag=False
        ))

        # Case 2: Stale Memory (False Contextual Equivalence)
        case2 = CaseModel(
            case_id="TX-1002-STALE",
            title="Scenario 2: Outdated Policy Remittance (Stale Memory)",
            domain="banking_fraud",
            status="ESCALATED",
            payload={
                "customer_id": "CUST-8812",
                "amount": 48000.0,
                "merchant_name": "Overseas Currency Transfer",
                "merchant_category_code": "6051",
                "destination_country": "SG",
                "is_cross_border": True,
                "velocity_1h": 3.0,
                "account_age_days": 180,
                "device_trust_score": 0.82,
                "proxy_detected": False,
                "sim_swap_detected": False,
                "kyc_bypassed": False,
                "is_vip_customer": False,
                "raw_risk_score": 0.42
            },
            anomaly_score=0.18,
            created_at=now - datetime.timedelta(minutes=10)
        )
        session.add(case2)
        await session.flush()

        cap2 = hash_capsule_gate.create_capsule_entry(
            case_id=case2.case_id,
            prev_hash=cap1["curr_hash"],
            payload_data=case2.payload,
            outcome="ESCALATED",
            consensus_confidence=0.62,
            dissent_entropy=0.88,
            policy_verdict="ESCALATED",
            hypergraph_edges=[{"type": "PRECEDENT_STALE", "id": "PREC-2024-089-STALE"}]
        )
        session.add(CapsuleEntryModel(
            capsule_id=cap2["capsule_id"],
            case_id=case2.case_id,
            sequence_num=2,
            prev_hash=cap2["prev_hash"],
            payload_hash=cap2["payload_hash"],
            curr_hash=cap2["curr_hash"],
            outcome=cap2["outcome"],
            consensus_confidence=cap2["consensus_confidence"],
            dissent_entropy=cap2["dissent_entropy"],
            policy_gate_verdict=cap2["policy_gate_verdict"],
            hypergraph_edges=cap2["hypergraph_edges"],
            frozen_flag=False
        ))

        # Case 3: Poisoned Memory (Adversarial Injection)
        case3 = CaseModel(
            case_id="TX-1003-POISON",
            title="Scenario 3: Fabricated High Credit Rating (Poisoned Memory)",
            domain="banking_fraud",
            status="BLOCKED",
            payload={
                "customer_id": "CUST-9999",
                "amount": 180000.0,
                "merchant_name": "Anonymous Crypto Exchange",
                "merchant_category_code": "6051",
                "destination_country": "IN",
                "is_cross_border": False,
                "velocity_1h": 22.0,
                "account_age_days": 4,
                "device_trust_score": 0.12,
                "proxy_detected": True,
                "sim_swap_detected": True,
                "kyc_bypassed": True,
                "is_poisoned": True,
                "raw_risk_score": 0.96
            },
            anomaly_score=0.92,
            created_at=now - datetime.timedelta(minutes=5),
            resolved_at=now - datetime.timedelta(minutes=4)
        )
        session.add(case3)
        await session.flush()

        cap3 = hash_capsule_gate.create_capsule_entry(
            case_id=case3.case_id,
            prev_hash=cap2["curr_hash"],
            payload_data=case3.payload,
            outcome="BLOCKED",
            consensus_confidence=0.99,
            dissent_entropy=0.02,
            policy_verdict="BLOCKED",
            hypergraph_edges=[{"type": "PRECEDENT_POISONED_QUARANTINE", "id": "PREC-2026-999-POISONED"}]
        )
        session.add(CapsuleEntryModel(
            capsule_id=cap3["capsule_id"],
            case_id=case3.case_id,
            sequence_num=3,
            prev_hash=cap3["prev_hash"],
            payload_hash=cap3["payload_hash"],
            curr_hash=cap3["curr_hash"],
            outcome=cap3["outcome"],
            consensus_confidence=cap3["consensus_confidence"],
            dissent_entropy=cap3["dissent_entropy"],
            policy_gate_verdict=cap3["policy_gate_verdict"],
            hypergraph_edges=cap3["hypergraph_edges"],
            frozen_flag=False
        ))

        # Case 4: Decision Revision Target Case
        case4 = CaseModel(
            case_id="TX-1004-REVISION",
            title="Scenario 4: Compromised Account Takeover (Decision Revision)",
            domain="banking_fraud",
            status="AUTHORIZED",
            payload={
                "customer_id": "CUST-4491",
                "amount": 75000.0,
                "merchant_name": "Luxury Electronics Hub",
                "merchant_category_code": "5732",
                "destination_country": "IN",
                "is_cross_border": False,
                "velocity_1h": 2.0,
                "account_age_days": 350,
                "device_trust_score": 0.90,
                "proxy_detected": False,
                "sim_swap_detected": False,
                "kyc_bypassed": False,
                "raw_risk_score": 0.20
            },
            anomaly_score=0.12,
            created_at=now - datetime.timedelta(hours=2),
            resolved_at=now - datetime.timedelta(hours=2)
        )
        session.add(case4)
        await session.flush()

        cap4 = hash_capsule_gate.create_capsule_entry(
            case_id=case4.case_id,
            prev_hash=cap3["curr_hash"],
            payload_data=case4.payload,
            outcome="AUTHORIZED",
            consensus_confidence=0.94,
            dissent_entropy=0.10,
            policy_verdict="AUTHORIZED",
            hypergraph_edges=[{"type": "BASELINE_AUTH"}]
        )
        session.add(CapsuleEntryModel(
            capsule_id=cap4["capsule_id"],
            case_id=case4.case_id,
            sequence_num=4,
            prev_hash=cap4["prev_hash"],
            payload_hash=cap4["payload_hash"],
            curr_hash=cap4["curr_hash"],
            outcome=cap4["outcome"],
            consensus_confidence=cap4["consensus_confidence"],
            dissent_entropy=cap4["dissent_entropy"],
            policy_gate_verdict=cap4["policy_gate_verdict"],
            hypergraph_edges=cap4["hypergraph_edges"],
            frozen_flag=False
        ))

    await session.commit()
