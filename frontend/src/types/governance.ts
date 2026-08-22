export type DecisionState = 'IN_PROGRESS' | 'AUTHORIZED' | 'ESCALATED' | 'BLOCKED' | 'REVISED' | 'PENDING';

export type MemoryTrustMode = 'ADVISORY' | 'WEIGHTED' | 'RESTRICTED' | 'REJECTED' | 'QUARANTINED' | 'ESCALATED';

export type AgentState = 'IDLE' | 'REASONING' | 'CHALLENGING' | 'DISSENT' | 'APPROVED' | 'FAILED';

export type ReportLevel = 'executive' | 'auditor' | 'technical';

export interface CasePayload {
  amount?: number;
  currency?: string;
  customer_id?: string;
  merchant?: string;
  country?: string;
  channel?: string;
  device_fingerprint?: string;
  velocity_1h?: number;
  velocity_24h?: number;
  original_case_id?: string;
  [key: string]: any;
}

export interface CaseItem {
  case_id: string;
  title: string;
  domain: string;
  status: DecisionState;
  amount: number;
  customer_id?: string;
  anomaly_score: number;
  created_at: string;
  resolved_at?: string | null;
  payload?: CasePayload;
  consensus_confidence?: number;
  primary_memory_mode?: MemoryTrustMode;
  policy_verdict?: string;
  risk_tier?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AgentProposal {
  agent_name: string;
  role: string;
  proposal: 'AUTHORIZE' | 'BLOCK' | 'ESCALATE' | 'REVISE';
  confidence: number;
  trust_weight: number;
  reasoning_text: string;
  dissent_flag: boolean;
  evidence_nodes?: string[];
  state?: AgentState;
  historical_accuracy?: number;
  precedent_referenced?: string;
}

export interface CapsuleEntry {
  capsule_id: string;
  case_id: string;
  prev_hash: string;
  payload_hash: string;
  curr_hash: string;
  outcome: DecisionState;
  consensus_confidence: number;
  dissent_entropy: number;
  policy_gate_verdict: string;
  hypergraph_edges: Array<{ type: string; agents?: number; [key: string]: any }>;
  frozen_flag: boolean;
  superseded_by?: string | null;
  human_ruling?: {
    human_ruling: DecisionState;
    reviewer_notes: string;
    reviewer_id: string;
    timestamp: string;
  } | null;
  created_at: string;
  sequence_num?: number;
}

export interface DecisionDelta {
  delta_id: string;
  original_capsule_id: string;
  revised_capsule_id: string;
  faulty_assumptions: string[];
  causal_explanation: string;
  replacement_outcome: DecisionState;
  signature: string;
}

export interface CaseDetailResponse {
  case: CaseItem;
  deliberations: AgentProposal[];
  capsule: CapsuleEntry | null;
  decision_delta: DecisionDelta | null;
  precedents?: PrecedentItem[];
}

export interface PrecedentItem {
  precedent_id: string;
  entity_id: string;
  relation: string;
  target_entity_id?: string;
  summary: string;
  base_trust_score: number;
  computed_trust_score?: number;
  influence_mode?: MemoryTrustMode;
  mode_explanation?: string;
  regulatory_regime: string;
  created_at: string;
  is_tampered: boolean;
  decay_details?: {
    days_elapsed: number;
    decay_factor: number;
    regime_match: boolean;
  };
}

export interface SystemStatus {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  version: string;
  current_regulatory_regime: string;
  total_cases_processed: number;
  capsule_ledger_height: number;
  hash_chain_integrity: 'SECURE' | 'TAMPER_DETECTED';
  integrity_message: string;
  average_agent_trust_index: number;
  governance_gates_active: number;
  services?: {
    orchestrator: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    agent_layer: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    memory_trust_gate: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    policy_engine: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    database: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    capsule_integrity: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  };
}

export interface AgentTrustMetric {
  agent_name: string;
  current_trust_score: number;
  total_decisions_participated: number;
  accurate_decisions_count: number;
  accuracy_percentage: number;
  last_updated: string;
  recent_dissent_events?: number;
  status?: 'HEALTHY' | 'CALIBRATING' | 'QUARANTINED';
}

export interface PolicyRule {
  rule_id: string;
  description: string;
  threshold: string;
  state: 'ACTIVE' | 'ENFORCING' | 'AUDIT_ONLY';
  last_updated: string;
}

export interface ExplainabilityReport {
  case_id: string;
  level: ReportLevel;
  title: string;
  timestamp: string;
  summary: string;
  sections: Array<{
    heading: string;
    content: string;
    metrics?: Record<string, any>;
    bullets?: string[];
  }>;
  signature: string;
  capsule_hash: string;
}

export interface TamperVerificationResult {
  is_valid: boolean;
  total_blocks: number;
  corrupted_block_index: number;
  message: string;
  audit_trace: Array<{
    block_index: number;
    capsule_id: string;
    case_id: string;
    valid: boolean;
    error?: string;
  }>;
}
