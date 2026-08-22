import {
  CaseItem,
  CaseDetailResponse,
  SystemStatus,
  AgentTrustMetric,
  PrecedentItem,
  ExplainabilityReport,
  TamperVerificationResult,
  ReportLevel,
  DecisionState,
  AgentProposal
} from '../types/governance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const IS_DEMO_MODE_FORCED = import.meta.env.VITE_DEMO_MODE === 'true';

// ---------------------------------------------------------------------
// High-Fidelity Demo Mock Data for Standalone / Demo Mode
// ---------------------------------------------------------------------

export const DEMO_CASES: CaseItem[] = [
  {
    case_id: 'CASE-10482',
    title: 'High Value Corporate Transfer',
    domain: 'banking_fraud',
    status: 'AUTHORIZED',
    amount: 842500,
    customer_id: 'CUST-88392',
    anomaly_score: 0.04,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    consensus_confidence: 0.91,
    primary_memory_mode: 'WEIGHTED',
    policy_verdict: 'PASS',
    risk_tier: 'LOW',
    payload: {
      amount: 842500,
      currency: 'INR',
      customer_id: 'CUST-88392',
      merchant: 'GLOBAL_SUPPLY_CORP',
      country: 'IN',
      channel: 'NET_BANKING_OTP_HW',
      device_fingerprint: 'DEV-FINGERPRINT-SECURE-992',
      velocity_1h: 1,
      velocity_24h: 2
    }
  },
  {
    case_id: 'CASE-10483',
    title: 'International Wire - Out-of-Regime',
    domain: 'banking_fraud',
    status: 'ESCALATED',
    amount: 9960000, // ~$120,000 equivalent
    customer_id: 'CUST-10492',
    anomaly_score: 0.68,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    resolved_at: null,
    consensus_confidence: 0.54,
    primary_memory_mode: 'RESTRICTED',
    policy_verdict: 'MANUAL_REVIEW_REQUIRED',
    risk_tier: 'HIGH',
    payload: {
      amount: 9960000,
      currency: 'INR',
      customer_id: 'CUST-10492',
      merchant: 'OVERSEAS_EQUITY_TRUST',
      country: 'CY',
      channel: 'API_DIRECT',
      device_fingerprint: 'DEV-FINGERPRINT-NEW-331',
      velocity_1h: 3,
      velocity_24h: 8
    }
  },
  {
    case_id: 'CASE-10484',
    title: 'Rapid Multi-Account Transfer Siphon',
    domain: 'banking_fraud',
    status: 'BLOCKED',
    amount: 1500000,
    customer_id: 'CUST-55102',
    anomaly_score: 0.96,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 11.9).toISOString(),
    consensus_confidence: 0.96,
    primary_memory_mode: 'QUARANTINED',
    policy_verdict: 'HARD_RULE_VIOLATION',
    risk_tier: 'CRITICAL',
    payload: {
      amount: 1500000,
      currency: 'INR',
      customer_id: 'CUST-55102',
      merchant: 'UNVERIFIED_CRYPTO_RAMP',
      country: 'MT',
      channel: 'MOBILE_APP_TOR',
      device_fingerprint: 'DEV-FINGERPRINT-POISONED-001',
      velocity_1h: 14,
      velocity_24h: 42
    }
  },
  {
    case_id: 'CASE-10485',
    title: 'Merchant Settlement Reversal',
    domain: 'banking_fraud',
    status: 'REVISED',
    amount: 450000,
    customer_id: 'CUST-77401',
    anomaly_score: 0.88,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    consensus_confidence: 0.89,
    primary_memory_mode: 'WEIGHTED',
    policy_verdict: 'REVISED_POLICY_PASS',
    risk_tier: 'MEDIUM',
    payload: {
      amount: 450000,
      currency: 'INR',
      customer_id: 'CUST-77401',
      merchant: 'APEX_LOGISTICS_LTD',
      country: 'IN',
      channel: 'BATCH_SETTLEMENT',
      device_fingerprint: 'DEV-FINGERPRINT-BATCH-004',
      velocity_1h: 1,
      velocity_24h: 4
    }
  },
  // ---- Demo Scenario Cases (TX-100x) used by the Dashboard carousel ----
  {
    case_id: 'TX-1001-USEFUL',
    title: 'Scenario 1: Verified International SaaS Payment (Useful Memory)',
    domain: 'banking_fraud',
    status: 'AUTHORIZED',
    amount: 24500,
    customer_id: 'CUST-3301',
    anomaly_score: 0.04,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 0.9).toISOString(),
    consensus_confidence: 0.91,
    primary_memory_mode: 'WEIGHTED',
    policy_verdict: 'PASS',
    risk_tier: 'LOW',
    payload: { amount: 24500, currency: 'INR', customer_id: 'CUST-3301', merchant: 'STRIPE_SAAS_VENDOR', country: 'US', channel: 'API_OAUTH', velocity_1h: 1, velocity_24h: 2 }
  },
  {
    case_id: 'TX-1002-STALE',
    title: 'Scenario 2: Outdated Policy Remittance (Stale Memory)',
    domain: 'banking_fraud',
    status: 'ESCALATED',
    amount: 48000,
    customer_id: 'CUST-8812',
    anomaly_score: 0.18,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    resolved_at: null,
    consensus_confidence: 0.62,
    primary_memory_mode: 'RESTRICTED',
    policy_verdict: 'MANUAL_REVIEW_REQUIRED',
    risk_tier: 'MEDIUM',
    payload: { amount: 48000, currency: 'INR', customer_id: 'CUST-8812', merchant: 'OVERSEAS_CURRENCY_TRANSFER', country: 'SG', channel: 'NET_BANKING', velocity_1h: 3, velocity_24h: 6 }
  },
  {
    case_id: 'TX-1003-POISON',
    title: 'Scenario 3: Fabricated High Credit Rating (Poisoned Memory)',
    domain: 'banking_fraud',
    status: 'BLOCKED',
    amount: 180000,
    customer_id: 'CUST-9999',
    anomaly_score: 0.92,
    created_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 0.4).toISOString(),
    consensus_confidence: 0.99,
    primary_memory_mode: 'QUARANTINED',
    policy_verdict: 'HARD_RULE_VIOLATION',
    risk_tier: 'CRITICAL',
    payload: { amount: 180000, currency: 'INR', customer_id: 'CUST-9999', merchant: 'ANON_CRYPTO_EXCHANGE', country: 'IN', channel: 'MOBILE_APP_TOR', velocity_1h: 22, velocity_24h: 55 }
  },
  {
    case_id: 'TX-1004-REVISION',
    title: 'Scenario 4: Compromised Account Takeover (Decision Revision)',
    domain: 'banking_fraud',
    status: 'AUTHORIZED',
    amount: 75000,
    customer_id: 'CUST-4421',
    anomaly_score: 0.12,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    resolved_at: new Date(Date.now() - 3600000 * 2.8).toISOString(),
    consensus_confidence: 0.91,
    primary_memory_mode: 'WEIGHTED',
    policy_verdict: 'REVISED_POLICY_PASS',
    risk_tier: 'LOW',
    payload: { amount: 75000, currency: 'INR', customer_id: 'CUST-4421', merchant: 'AUTHORIZED_VENDOR_LTD', country: 'IN', channel: 'NET_BANKING_OTP_HW', velocity_1h: 1, velocity_24h: 3 }
  }
];

export const DEMO_AGENTS: AgentProposal[] = [
  {
    agent_name: 'Context Analyzer',
    role: 'Telemetry & Environment',
    proposal: 'AUTHORIZE',
    confidence: 0.94,
    trust_weight: 0.96,
    reasoning_text: 'Hardware token match verified. Location matches known corporate headquarters IP range.',
    dissent_flag: false,
    state: 'APPROVED'
  },
  {
    agent_name: 'Planner Agent',
    role: 'Causal Execution Path',
    proposal: 'AUTHORIZE',
    confidence: 0.92,
    trust_weight: 0.94,
    reasoning_text: 'Optimal execution path selected without dependency locks.',
    dissent_flag: false,
    state: 'APPROVED'
  },
  {
    agent_name: 'Risk Agent',
    role: 'Statistical Anomaly Screening',
    proposal: 'BLOCK',
    confidence: 0.73,
    trust_weight: 0.91,
    reasoning_text: 'Transaction amount ₹8,42,500 exceeds 30-day moving average by 2.4x.',
    dissent_flag: true,
    state: 'CHALLENGING'
  },
  {
    agent_name: 'Resource Agent',
    role: 'Liquidity & Exposure Gate',
    proposal: 'AUTHORIZE',
    confidence: 0.98,
    trust_weight: 0.97,
    reasoning_text: 'Account liquidity sufficient for settlement.',
    dissent_flag: false,
    state: 'APPROVED'
  },
  {
    agent_name: 'Data Verification',
    role: 'KYC & Identity Provenance',
    proposal: 'AUTHORIZE',
    confidence: 0.95,
    trust_weight: 0.95,
    reasoning_text: 'Customer identity & biometric hash active.',
    dissent_flag: false,
    state: 'APPROVED'
  },
  {
    agent_name: 'Ethics & Safety',
    role: 'Regulatory Alignment Guard',
    proposal: 'BLOCK',
    confidence: 0.48,
    trust_weight: 0.88,
    reasoning_text: 'Evidence insufficient for autonomous approval without human verification.',
    dissent_flag: true,
    state: 'DISSENT'
  },
  {
    agent_name: 'Memory Trust',
    role: 'Temporal Decay & Graph Filter',
    proposal: 'AUTHORIZE',
    confidence: 0.84,
    trust_weight: 0.93,
    reasoning_text: 'Matched precedent #1842 under RBI-FRAUD-REGIME-2026.',
    dissent_flag: false,
    state: 'REASONING'
  },
  {
    agent_name: 'Consensus Agent',
    role: 'Shapley Trust Weight Integrator',
    proposal: 'AUTHORIZE',
    confidence: 0.91,
    trust_weight: 0.98,
    reasoning_text: 'Weighted vote score 0.91 exceeds threshold 0.80.',
    dissent_flag: false,
    state: 'APPROVED'
  },
  {
    agent_name: 'Revision Agent',
    role: 'Counterfactual SCM Analyzer',
    proposal: 'AUTHORIZE',
    confidence: 0.89,
    trust_weight: 0.92,
    reasoning_text: 'Counterfactual graphs clear.',
    dissent_flag: false,
    state: 'IDLE'
  },
  {
    agent_name: 'Revision Validator',
    role: 'SHA-256 Ledger Signature Check',
    proposal: 'AUTHORIZE',
    confidence: 0.99,
    trust_weight: 0.99,
    reasoning_text: 'SHA-256 chain integrity verified.',
    dissent_flag: false,
    state: 'APPROVED'
  }
];

export const DEMO_CASE_DETAILS: Record<string, CaseDetailResponse> = {
  'CASE-10482': {
    case: DEMO_CASES[0],
    deliberations: [
      {
        agent_name: 'Context Analyzer',
        role: 'Telemetry & Environment',
        proposal: 'AUTHORIZE',
        confidence: 0.94,
        trust_weight: 0.96,
        reasoning_text: 'Hardware token match verified. Location matches known corporate headquarters IP range.',
        dissent_flag: false,
        evidence_nodes: ['EVID-HW-TOKEN-88392', 'EVID-IP-GEO-IN-01']
      },
      {
        agent_name: 'Risk Agent',
        role: 'Statistical Anomaly Screening',
        proposal: 'BLOCK',
        confidence: 0.73,
        trust_weight: 0.91,
        reasoning_text: 'Transaction amount ₹8,42,500 exceeds 30-day moving average by 2.4x. Recommending secondary auth check.',
        dissent_flag: true,
        evidence_nodes: ['EVID-HIST-MOVING-AVG']
      },
      {
        agent_name: 'Ethics & Safety',
        role: 'Regulatory Alignment Guard',
        proposal: 'AUTHORIZE',
        confidence: 0.91,
        trust_weight: 0.88,
        reasoning_text: 'No compliance holds or regulatory sanctions detected on beneficiary GLOBAL_SUPPLY_CORP.',
        dissent_flag: false,
        evidence_nodes: ['EVID-RBI-SANCTION-LOOKUP']
      },
      {
        agent_name: 'Memory Trust',
        role: 'Temporal Decay & Graph Filter',
        proposal: 'AUTHORIZE',
        confidence: 0.89,
        trust_weight: 0.93,
        reasoning_text: 'Matched precedent #1842 (Base Trust 0.95, Decay 0.91). Provenance verified under RBI-FRAUD-REGIME-2026.',
        dissent_flag: false,
        evidence_nodes: ['PRECEDENT-#1842']
      },
      {
        agent_name: 'Consensus Agent',
        role: 'Shapley Trust Weight Integrator',
        proposal: 'AUTHORIZE',
        confidence: 0.91,
        trust_weight: 0.98,
        reasoning_text: 'Weighted vote score 0.91 exceeds threshold 0.80. Dissenting Risk Agent weight (0.91) insufficient to veto.',
        dissent_flag: false
      }
    ],
    capsule: {
      capsule_id: 'CAP-7D3A-91BC-842500',
      case_id: 'CASE-10482',
      prev_hash: '921F0B8734A1C8E90123456789ABCDEF0123456789ABCDEF0123456789ABCDEF',
      payload_hash: '7D3A91BC6621980AA4F77218B9C0D3E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1',
      curr_hash: 'E4F5A6B7C8D90123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123',
      outcome: 'AUTHORIZED',
      consensus_confidence: 0.91,
      dissent_entropy: 0.14,
      policy_gate_verdict: 'PASS',
      hypergraph_edges: [{ type: 'DELIBERATION_SYNTHESIS', agents: 10 }],
      frozen_flag: false,
      created_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      sequence_num: 104
    },
    decision_delta: null
  },
  'CASE-10485': {
    case: DEMO_CASES[3],
    deliberations: [
      {
        agent_name: 'Revision Agent',
        role: 'Counterfactual SCM Analyzer',
        proposal: 'REVISE',
        confidence: 0.89,
        trust_weight: 0.92,
        reasoning_text: 'Counterfactual Analysis revealed assumption A (Supplier identity) was invalidated by audit log #992. Replacement outcome BLOCKED issued.',
        dissent_flag: false
      }
    ],
    capsule: {
      capsule_id: 'CAP-REV-450000-881',
      case_id: 'CASE-10485',
      prev_hash: 'E4F5A6B7C8D90123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123',
      payload_hash: '11223344556677889900AABBCCDDEEFF11223344556677889900AABBCCDDEEFF',
      curr_hash: '99887766554433221100FFEEDDCCBBAA99887766554433221100FFEEDDCCBBAA',
      outcome: 'REVISED',
      consensus_confidence: 0.89,
      dissent_entropy: 0.08,
      policy_gate_verdict: 'REVISED_POLICY_PASS',
      hypergraph_edges: [{ type: 'COUNTERFACTUAL_REVISION' }],
      frozen_flag: false,
      created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
      sequence_num: 107
    },
    decision_delta: {
      delta_id: 'DELTA-9012-SCM',
      original_capsule_id: 'CAP-ORIG-450000-771',
      revised_capsule_id: 'CAP-REV-450000-881',
      faulty_assumptions: [
        'Assumption #1: Merchant "APEX_LOGISTICS_LTD" whitelist status active.',
        'Assumption #2: Settlement batch signature signed by verified corporate key.'
      ],
      causal_explanation: 'Audit evidence revealed corporate key revocation at 14:02 UTC prior to batch submission. Counterfactual evaluation flips outcome from AUTHORIZED -> BLOCKED.',
      replacement_outcome: 'BLOCKED',
      signature: 'ED25519-SIG-GOVERNANCE-CAUSAL-DELTA-9012'
    }
  },
  'TX-1001-USEFUL': {
    case: DEMO_CASES.find(c => c.case_id === 'TX-1001-USEFUL')!,
    deliberations: [
      { agent_name: 'Context Analyzer', role: 'Telemetry & Environment', proposal: 'AUTHORIZE', confidence: 0.96, trust_weight: 0.96, reasoning_text: 'SaaS vendor verified via OAuth token. Device fingerprint matches registered enterprise account.', dissent_flag: false, evidence_nodes: ['EVID-OAUTH-TOKEN-3301', 'EVID-DEVICE-ENTERPRISE'] },
      { agent_name: 'Risk Agent', role: 'Statistical Anomaly Screening', proposal: 'AUTHORIZE', confidence: 0.91, trust_weight: 0.91, reasoning_text: 'Transaction amount within normal SaaS spending band for CUST-3301. Low velocity.', dissent_flag: false, evidence_nodes: ['EVID-SPENDING-BAND'] },
      { agent_name: 'Memory Trust', role: 'Temporal Decay & Graph Filter', proposal: 'AUTHORIZE', confidence: 0.93, trust_weight: 0.93, reasoning_text: 'Valid precedent found under RBI-FRAUD-REGIME-2026 with full regime match. Temporal decay negligible (2 days).', dissent_flag: false, evidence_nodes: ['PRECEDENT-SAAS-VENDOR-APPROVED'] },
      { agent_name: 'Ethics & Safety', role: 'Regulatory Alignment Guard', proposal: 'AUTHORIZE', confidence: 0.89, trust_weight: 0.88, reasoning_text: 'No regulatory holds on STRIPE_SAAS_VENDOR. Cross-border SaaS exemption applies.', dissent_flag: false, evidence_nodes: ['EVID-RBI-SAAS-EXEMPTION'] },
      { agent_name: 'Consensus Agent', role: 'Shapley Trust Weight Integrator', proposal: 'AUTHORIZE', confidence: 0.91, trust_weight: 0.98, reasoning_text: 'All agents authorized. Weighted consensus 0.91 exceeds threshold 0.80.', dissent_flag: false }
    ],
    capsule: {
      capsule_id: 'CAP-TX1001-USEFUL-24500',
      case_id: 'TX-1001-USEFUL',
      prev_hash: 'AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899',
      payload_hash: '11223344556677889900AABBCCDDEEFF11223344556677889900AABBCCDDEEFF',
      curr_hash: '99887766554433221100FFEEDDCCBBAA99887766554433221100FFEEDDCCBBAA',
      outcome: 'AUTHORIZED',
      consensus_confidence: 0.91,
      dissent_entropy: 0.03,
      policy_gate_verdict: 'PASS',
      hypergraph_edges: [{ type: 'USEFUL_MEMORY_CONFIRMED', agents: 10 }],
      frozen_flag: false,
      created_at: new Date(Date.now() - 3600000 * 0.9).toISOString(),
      sequence_num: 201
    },
    decision_delta: null
  },
  'TX-1002-STALE': {
    case: DEMO_CASES.find(c => c.case_id === 'TX-1002-STALE')!,
    deliberations: [
      { agent_name: 'Context Analyzer', role: 'Telemetry & Environment', proposal: 'AUTHORIZE', confidence: 0.78, trust_weight: 0.96, reasoning_text: 'Device and IP appear legitimate but precedent regime mismatch detected.', dissent_flag: false, evidence_nodes: ['EVID-DEVICE-OK', 'EVID-REGIME-MISMATCH'] },
      { agent_name: 'Risk Agent', role: 'Statistical Anomaly Screening', proposal: 'AUTHORIZE', confidence: 0.55, trust_weight: 0.91, reasoning_text: 'Cross-border remittance to SG. Moderate velocity. Risk borderline.', dissent_flag: false, evidence_nodes: ['EVID-VELOCITY-MODERATE'] },
      { agent_name: 'Memory Trust', role: 'Temporal Decay & Graph Filter', proposal: 'AUTHORIZE', confidence: 0.42, trust_weight: 0.93, reasoning_text: 'Stale precedent found (60 days elapsed). Regime mismatch: EU-PSD3 vs RBI-2026. Computed trust 0.42 — below WEIGHTED threshold.', dissent_flag: true, evidence_nodes: ['PRECEDENT-STALE-REGIME-MISMATCH'] },
      { agent_name: 'Ethics & Safety', role: 'Regulatory Alignment Guard', proposal: 'BLOCK', confidence: 0.71, trust_weight: 0.88, reasoning_text: 'Policy requires updated precedent validation before cross-border approval. Stale memory cannot satisfy compliance threshold.', dissent_flag: true, evidence_nodes: ['EVID-STALE-POLICY-HOLD'] },
      { agent_name: 'Consensus Agent', role: 'Shapley Trust Weight Integrator', proposal: 'AUTHORIZE', confidence: 0.62, trust_weight: 0.98, reasoning_text: 'Weighted score 0.62 insufficient for autonomous approval. Escalation triggered.', dissent_flag: false }
    ],
    capsule: {
      capsule_id: 'CAP-TX1002-STALE-48000',
      case_id: 'TX-1002-STALE',
      prev_hash: '99887766554433221100FFEEDDCCBBAA99887766554433221100FFEEDDCCBBAA',
      payload_hash: 'DEADBEEF0011223344556677889900AABBCCDDEEFFDEADBEEF00112233445566',
      curr_hash: 'CAFEBABE0011223344556677889900AABBCCDDEEFFCAFEBABE00112233445566',
      outcome: 'ESCALATED',
      consensus_confidence: 0.62,
      dissent_entropy: 0.88,
      policy_gate_verdict: 'ESCALATED',
      hypergraph_edges: [{ type: 'PRECEDENT_STALE', id: 'PREC-2024-089-STALE' }],
      frozen_flag: false,
      created_at: new Date(Date.now() - 3600000 * 1.9).toISOString(),
      sequence_num: 202
    },
    decision_delta: null
  },
  'TX-1003-POISON': {
    case: DEMO_CASES.find(c => c.case_id === 'TX-1003-POISON')!,
    deliberations: [
      { agent_name: 'Context Analyzer', role: 'Telemetry & Environment', proposal: 'BLOCK', confidence: 0.97, trust_weight: 0.96, reasoning_text: 'TOR proxy detected. Device fingerprint matches known botnet signature DEV-FINGERPRINT-POISONED. SIM swap flag active.', dissent_flag: false, evidence_nodes: ['EVID-TOR-PROXY', 'EVID-BOTNET-MATCH', 'EVID-SIM-SWAP'] },
      { agent_name: 'Risk Agent', role: 'Statistical Anomaly Screening', proposal: 'BLOCK', confidence: 0.99, trust_weight: 0.91, reasoning_text: 'Anomaly score 0.92. Velocity 22 tx/hr — 18x normal threshold. KYC bypassed flag set.', dissent_flag: false, evidence_nodes: ['EVID-ANOMALY-CRITICAL', 'EVID-VELOCITY-EXTREME'] },
      { agent_name: 'Memory Trust', role: 'Temporal Decay & Graph Filter', proposal: 'BLOCK', confidence: 0.99, trust_weight: 0.93, reasoning_text: 'Precedent POISONED-001 quarantined: adversarial injection attempt. Computed trust 0.0 — forced QUARANTINED mode.', dissent_flag: false, evidence_nodes: ['PRECEDENT-QUARANTINED-POISONED'] },
      { agent_name: 'Ethics & Safety', role: 'Regulatory Alignment Guard', proposal: 'BLOCK', confidence: 0.98, trust_weight: 0.88, reasoning_text: 'Fabricated credit rating detected in memory graph. Hard block mandatory under RBI-FRAUD-REGIME-2026 §12.4.', dissent_flag: false, evidence_nodes: ['EVID-FABRICATED-CREDIT', 'EVID-RBI-HARD-BLOCK'] },
      { agent_name: 'Consensus Agent', role: 'Shapley Trust Weight Integrator', proposal: 'BLOCK', confidence: 0.99, trust_weight: 0.98, reasoning_text: 'Unanimous BLOCK. Entropy 0.02. Deterministic policy HARD_RULE_VIOLATION triggered.', dissent_flag: false }
    ],
    capsule: {
      capsule_id: 'CAP-TX1003-POISON-180000',
      case_id: 'TX-1003-POISON',
      prev_hash: 'CAFEBABE0011223344556677889900AABBCCDDEEFFCAFEBABE00112233445566',
      payload_hash: 'POISONHASH0011223344556677889900AABBCCDDEEFFPOISONHASH001122334455',
      curr_hash: 'BLOCKEDHASH0011223344556677889900AABBCCDDEEFFBLOCKEDHASH0011223344',
      outcome: 'BLOCKED',
      consensus_confidence: 0.99,
      dissent_entropy: 0.02,
      policy_gate_verdict: 'HARD_RULE_VIOLATION',
      hypergraph_edges: [{ type: 'PRECEDENT_POISONED_QUARANTINE', id: 'PREC-2026-999-POISONED' }],
      frozen_flag: true,
      created_at: new Date(Date.now() - 3600000 * 0.4).toISOString(),
      sequence_num: 203
    },
    decision_delta: null
  },
  'TX-1004-REVISION': {
    case: DEMO_CASES.find(c => c.case_id === 'TX-1004-REVISION')!,
    deliberations: [
      { agent_name: 'Context Analyzer', role: 'Telemetry & Environment', proposal: 'AUTHORIZE', confidence: 0.91, trust_weight: 0.96, reasoning_text: 'Hardware OTP verified. Device matches registered profile for CUST-4421.', dissent_flag: false, evidence_nodes: ['EVID-HW-OTP-4421'] },
      { agent_name: 'Risk Agent', role: 'Statistical Anomaly Screening', proposal: 'AUTHORIZE', confidence: 0.88, trust_weight: 0.91, reasoning_text: 'Amount within normal range. Anomaly score 0.12 — low risk band.', dissent_flag: false, evidence_nodes: ['EVID-NORMAL-RANGE'] },
      { agent_name: 'Revision Agent', role: 'Counterfactual SCM Analyzer', proposal: 'REVISE', confidence: 0.92, trust_weight: 0.92, reasoning_text: 'Post-authorization audit log revealed account login anomaly 4 mins prior to transaction. Counterfactual SCM indicates ATO (Account Takeover) scenario with 87% probability.', dissent_flag: true, evidence_nodes: ['EVID-LOGIN-ANOMALY-ATO', 'EVID-COUNTERFACTUAL-ATO'] },
      { agent_name: 'Ethics & Safety', role: 'Regulatory Alignment Guard', proposal: 'BLOCK', confidence: 0.86, trust_weight: 0.88, reasoning_text: 'ATO evidence mandates decision revision per RBI Circular 2026/ATO-POLICY-7.', dissent_flag: true, evidence_nodes: ['EVID-ATO-POLICY'] },
      { agent_name: 'Revision Validator', role: 'SHA-256 Ledger Signature Check', proposal: 'AUTHORIZE', confidence: 0.99, trust_weight: 0.99, reasoning_text: 'Original capsule hash verified. Revision delta sealed and appended to ledger.', dissent_flag: false }
    ],
    capsule: {
      capsule_id: 'CAP-TX1004-REV-75000',
      case_id: 'TX-1004-REVISION',
      prev_hash: 'BLOCKEDHASH0011223344556677889900AABBCCDDEEFFBLOCKEDHASH0011223344',
      payload_hash: 'REVISIONHASH00112233445566778899AABBCCDDEEFFREVISIONHASH001122334',
      curr_hash: 'FINALREV0011223344556677889900AABBCCDDEEFINALREV00112233445566778',
      outcome: 'REVISED',
      consensus_confidence: 0.91,
      dissent_entropy: 0.22,
      policy_gate_verdict: 'REVISED_POLICY_PASS',
      hypergraph_edges: [{ type: 'COUNTERFACTUAL_ATO_REVISION' }],
      frozen_flag: false,
      created_at: new Date(Date.now() - 3600000 * 2.8).toISOString(),
      sequence_num: 204
    },
    decision_delta: {
      delta_id: 'DELTA-ATO-TX1004',
      original_capsule_id: 'CAP-TX1004-ORIG-75000',
      revised_capsule_id: 'CAP-TX1004-REV-75000',
      faulty_assumptions: [
        'Assumption #1: Hardware OTP login was by authenticated account owner.',
        'Assumption #2: Session initiated 10 mins prior was uncompromised.'
      ],
      causal_explanation: 'Post-authorization audit log revealed credential-stuffing login at T-4min. Counterfactual SCM flips outcome: AUTHORIZED -> BLOCKED under ATO scenario.',
      replacement_outcome: 'BLOCKED',
      signature: 'ED25519-SIG-GOVERNANCE-CAUSAL-DELTA-ATO-TX1004'
    }
  }
};

// Helper fetch wrapper with fallback
// Uses a 2-second AbortController timeout so the UI never hangs waiting for
// a slow or unreachable backend — it falls back to demo data immediately.
async function fetchWithFallback<T>(url: string, demoFallback: T, options?: RequestInit): Promise<T> {
  if (IS_DEMO_MODE_FORCED) {
    return demoFallback;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout
  try {
    const res = await fetch(`${API_BASE_URL}${url}`, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      console.warn(`[API] Endpoint ${url} returned status ${res.status}. Falling back to demo data.`);
      return demoFallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = (err as Error).name === 'AbortError';
    console.warn(`[API] ${isTimeout ? 'Timeout' : 'Connection error'} on ${url}. Using offline demo layer.`);
    return demoFallback;
  }
}

// ---------------------------------------------------------------------
// API Service Methods
// ---------------------------------------------------------------------

export const governanceApi = {
  // Get System Status Telemetry
  async getSystemStatus(): Promise<SystemStatus> {
    return fetchWithFallback<SystemStatus>('/status', {
      status: 'ONLINE',
      version: '2.4.0-GOVERNANCE-RELEASE',
      current_regulatory_regime: 'RBI-FRAUD-REGIME-2026',
      total_cases_processed: 214,
      capsule_ledger_height: 184,
      hash_chain_integrity: 'SECURE',
      integrity_message: 'Ledger SHA-256 chain completely verified without tamper.',
      average_agent_trust_index: 0.934,
      governance_gates_active: 5,
      services: {
        orchestrator: 'HEALTHY',
        agent_layer: 'HEALTHY',
        memory_trust_gate: 'HEALTHY',
        policy_engine: 'HEALTHY',
        database: 'HEALTHY',
        capsule_integrity: 'HEALTHY'
      }
    });
  },

  // List all cases
  async getCases(): Promise<CaseItem[]> {
    return fetchWithFallback<CaseItem[]>('/cases', DEMO_CASES);
  },

  // Get single case details
  async getCaseDetail(caseId: string): Promise<CaseDetailResponse> {
    const fallback = DEMO_CASE_DETAILS[caseId] || {
      case: DEMO_CASES.find(c => c.case_id === caseId) || {
        case_id: caseId,
        title: `Generic Case ${caseId}`,
        domain: 'banking_fraud',
        status: 'IN_PROGRESS',
        amount: 500000,
        anomaly_score: 0.35,
        created_at: new Date().toISOString(),
        consensus_confidence: 0.85,
        primary_memory_mode: 'WEIGHTED',
        policy_verdict: 'PASS',
        risk_tier: 'MEDIUM'
      },
      deliberations: DEMO_AGENTS.map(a => ({
        agent_name: a.agent_name,
        role: a.role,
        proposal: a.proposal,
        confidence: a.confidence,
        trust_weight: a.trust_weight,
        reasoning_text: `Evaluated case ${caseId} under standard parameters.`,
        dissent_flag: a.state === 'DISSENT'
      })),
      capsule: {
        capsule_id: `CAP-GENERIC-${caseId}`,
        case_id: caseId,
        prev_hash: '921F0B8734A1C8E90123456789ABCDEF',
        payload_hash: '7D3A91BC6621980AA4F77218B9C0D3E5',
        curr_hash: 'E4F5A6B7C8D90123456789ABCDEF0123',
        outcome: 'AUTHORIZED',
        consensus_confidence: 0.85,
        dissent_entropy: 0.12,
        policy_gate_verdict: 'PASS',
        hypergraph_edges: [],
        frozen_flag: false,
        created_at: new Date().toISOString()
      },
      decision_delta: null
    };

    return fetchWithFallback<CaseDetailResponse>(`/cases/${caseId}`, fallback);
  },

  // Submit human escalation ruling
  async resolveEscalation(caseId: string, humanRuling: DecisionState, reviewerNotes: string): Promise<{ status: string; message: string }> {
    return fetchWithFallback<{ status: string; message: string }>(
      `/escalation/${caseId}/resolve`,
      {
        status: humanRuling,
        message: `Human reviewer ruling (${humanRuling}) permanently recorded in Hash Capsule.`
      },
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ human_ruling: humanRuling, reviewer_notes: reviewerNotes, reviewer_id: 'REV-OFFICER-77' })
      }
    );
  },

  // Trigger Counterfactual Decision Revision
  async triggerRevision(caseId: string, invalidatingEvidence: Record<string, any>): Promise<{ status: string; message: string; decision_delta: any }> {
    return fetchWithFallback<{ status: string; message: string; decision_delta: any }>(
      `/cases/${caseId}/revise`,
      {
        status: 'REVISED',
        message: 'Decision successfully revised via Counterfactual SCM.',
        decision_delta: {
          delta_id: `DELTA-${Math.floor(Math.random() * 9000 + 1000)}`,
          original_capsule_id: `CAP-ORIG-${caseId}`,
          revised_capsule_id: `CAP-REV-${caseId}`,
          faulty_assumptions: ['Assumption #1: Hardware Token Signature Validated', 'Assumption #2: Recipient Account Clear'],
          causal_explanation: 'Invalidating evidence submitted by reviewer confirmed compromised hardware key.',
          replacement_outcome: 'BLOCKED',
          signature: 'ED25519-SIG-GOVERNANCE-REVISION-SUCCESS'
        }
      },
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalidating_evidence: invalidatingEvidence })
      }
    );
  },

  // Get Explainability Report
  async getReport(caseId: string, level: ReportLevel = 'auditor'): Promise<ExplainabilityReport> {
    const fallback: ExplainabilityReport = {
      case_id: caseId,
      level,
      title: `ConsensusAI Governance & Explainability Audit — ${caseId}`,
      timestamp: new Date().toISOString(),
      summary: `Automated 5-Gate Governance evaluation completed for case ${caseId}. Decision was synthesized with multi-agent consensus and deterministic policy verification.`,
      sections: [
        {
          heading: '1. Executive Decision Summary',
          content: `Case ${caseId} was processed under regulatory regime RBI-FRAUD-REGIME-2026. Outcome: AUTHORIZED with 91% consensus confidence.`
        },
        {
          heading: '2. Temporal Memory & Trust Precedents',
          content: `Retrieved precedent #1842 with Base Trust 0.95, decaying to 0.91 computed trust. Temporal decay model applied exponential half-life curve. Mode: WEIGHTED.`
        },
        {
          heading: '3. Multi-Agent Deliberation & Dissent Entropy',
          content: `Ten specialist agents deliberated. 9 agents voted AUTHORIZE; 1 agent (Risk Agent) dissented proposing BLOCK with 73% confidence. Shannon entropy index: 0.14 (Low Disagreement).`
        },
        {
          heading: '4. Deterministic Policy Gate Verdict',
          content: `Hard rules checked: MAX_TRANSACTION_THRESHOLD (Pass), HIGH_RISK_COUNTRY_RULE (Pass), CONFIDENCE_MINIMUM (Pass). Zero statutory violations.`
        },
        {
          heading: '5. SHA-256 Capsule Ledger Reference',
          content: `Capsule Block #104 sealed with SHA-256 digest: 7D3A91BC6621980AA4F77218B9C0D3E5. Previous Block Hash intact.`
        }
      ],
      signature: 'ED25519-SIG-AUDIT-VERIFIED-CONSENSUSAI',
      capsule_hash: '7D3A91BC6621980AA4F77218B9C0D3E5'
    };

    return fetchWithFallback<ExplainabilityReport>(`/reports/${caseId}?level=${level}`, fallback);
  },

  // Verify Ledger Hash Chain
  async verifyCapsuleChain(): Promise<TamperVerificationResult> {
    return fetchWithFallback<TamperVerificationResult>('/capsule/verify', {
      is_valid: true,
      total_blocks: 184,
      corrupted_block_index: -1,
      message: 'SHA-256 Hash Chain verification passed 100%. No tampered blocks detected.',
      audit_trace: [
        { block_index: 0, capsule_id: 'CAP-GENESIS-001', case_id: 'CASE-00000', valid: true },
        { block_index: 104, capsule_id: 'CAP-7D3A-91BC-842500', case_id: 'CASE-10482', valid: true }
      ]
    });
  },

  // Simulate Tamper on Capsule
  async simulateTamper(blockIndex: number = 1): Promise<{ message: string }> {
    return fetchWithFallback<{ message: string }>(
      '/capsule/tamper-simulate',
      { message: `Simulated malicious tamper in Block #${blockIndex}. Run ledger verification to observe detection.` },
      { method: 'POST' }
    );
  },

  // Repair Tampered Ledger
  async repairTamper(): Promise<{ message: string }> {
    return fetchWithFallback<{ message: string }>(
      '/capsule/tamper-repair',
      { message: 'Ledger restored to clean cryptographic state.' },
      { method: 'POST' }
    );
  },

  // Get Agent Trust Metrics
  async getAgentTrustMetrics(): Promise<AgentTrustMetric[]> {
    return fetchWithFallback<AgentTrustMetric[]>('/agents/trust', [
      { agent_name: 'Context Analyzer', current_trust_score: 0.96, total_decisions_participated: 214, accurate_decisions_count: 208, accuracy_percentage: 97.2, last_updated: new Date().toISOString(), status: 'HEALTHY' },
      { agent_name: 'Planner Agent', current_trust_score: 0.94, total_decisions_participated: 214, accurate_decisions_count: 202, accuracy_percentage: 94.4, last_updated: new Date().toISOString(), status: 'HEALTHY' },
      { agent_name: 'Risk Agent', current_trust_score: 0.91, total_decisions_participated: 214, accurate_decisions_count: 195, accuracy_percentage: 91.1, last_updated: new Date().toISOString(), recent_dissent_events: 14, status: 'HEALTHY' },
      { agent_name: 'Resource Agent', current_trust_score: 0.97, total_decisions_participated: 214, accurate_decisions_count: 210, accuracy_percentage: 98.1, last_updated: new Date().toISOString(), status: 'HEALTHY' },
      { agent_name: 'Data Verification', current_trust_score: 0.95, total_decisions_participated: 214, accurate_decisions_count: 204, accuracy_percentage: 95.3, last_updated: new Date().toISOString(), status: 'HEALTHY' },
      { agent_name: 'Ethics & Safety', current_trust_score: 0.88, total_decisions_participated: 214, accurate_decisions_count: 188, accuracy_percentage: 87.8, last_updated: new Date().toISOString(), recent_dissent_events: 22, status: 'CALIBRATING' },
      { agent_name: 'Memory Trust', current_trust_score: 0.93, total_decisions_participated: 214, accurate_decisions_count: 199, accuracy_percentage: 93.0, last_updated: new Date().toISOString(), status: 'HEALTHY' },
      { agent_name: 'Consensus Agent', current_trust_score: 0.98, total_decisions_participated: 214, accurate_decisions_count: 212, accuracy_percentage: 99.1, last_updated: new Date().toISOString(), status: 'HEALTHY' },
      { agent_name: 'Revision Agent', current_trust_score: 0.92, total_decisions_participated: 48, accurate_decisions_count: 45, accuracy_percentage: 93.7, last_updated: new Date().toISOString(), status: 'HEALTHY' },
      { agent_name: 'Revision Validator', current_trust_score: 0.99, total_decisions_participated: 48, accurate_decisions_count: 48, accuracy_percentage: 100.0, last_updated: new Date().toISOString(), status: 'HEALTHY' }
    ]);
  },

  // Get TKG Memory Graph & Precedents
  async getTkgData(): Promise<{ precedents: PrecedentItem[]; current_regime: string }> {
    return fetchWithFallback<{ precedents: PrecedentItem[]; current_regime: string }>('/tkg', {
      current_regime: 'RBI-FRAUD-REGIME-2026',
      precedents: [
        {
          precedent_id: 'PRECEDENT-#1842',
          entity_id: 'CUST-88392',
          relation: 'AUTHENTICATED_CORPORATE_PAYMENT',
          summary: 'Verified high-value supplier settlement under hardware OTP token.',
          base_trust_score: 0.95,
          computed_trust_score: 0.91,
          influence_mode: 'WEIGHTED',
          mode_explanation: 'Valid regime match with exponential decay over 14 days.',
          regulatory_regime: 'RBI-FRAUD-REGIME-2026',
          created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
          is_tampered: false,
          decay_details: { days_elapsed: 14, decay_factor: 0.957, regime_match: true }
        },
        {
          precedent_id: 'PRECEDENT-#1209',
          entity_id: 'MERCHANT-OVERSEAS-CY',
          relation: 'OFFSHORE_WIRE_TRANSFER',
          summary: 'Out-of-regime wire flagged for mandatory secondary officer approval.',
          base_trust_score: 0.70,
          computed_trust_score: 0.42,
          influence_mode: 'RESTRICTED',
          mode_explanation: 'Regulatory regime mismatch (EU-PSD3 vs RBI-2026).',
          regulatory_regime: 'EU-PSD3-REGIME-2024',
          created_at: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
          is_tampered: false,
          decay_details: { days_elapsed: 60, decay_factor: 0.60, regime_match: false }
        },
        {
          precedent_id: 'PRECEDENT-#0991',
          entity_id: 'DEV-FINGERPRINT-POISONED-001',
          relation: 'KNOWN_SIPHON_BOTNET',
          summary: 'Adversarial attempt to spoof memory trust graph via fake precedent payload.',
          base_trust_score: 0.10,
          computed_trust_score: 0.0,
          influence_mode: 'QUARANTINED',
          mode_explanation: 'Tamper detected or score below critical threshold 0.20.',
          regulatory_regime: 'RBI-FRAUD-REGIME-2026',
          created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
          is_tampered: true,
          decay_details: { days_elapsed: 2, decay_factor: 0.0, regime_match: true }
        }
      ]
    });
  }
};
