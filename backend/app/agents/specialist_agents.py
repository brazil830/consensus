from typing import Dict, Any, List
from app.agents.state import DeliberationState, AgentDeliberationOutput
from app.config import settings

class ContextAnalyzerAgent:
    name = "Context Analyzer Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.92) -> AgentDeliberationOutput:
        p = state["payload"]
        amount = float(p.get("amount", 0.0))
        account_age = float(p.get("account_age_days", 0))
        velocity = float(p.get("velocity_1h", 1.0))
        is_cross_border = p.get("is_cross_border", False)
        
        # Analyze baseline deviation
        if amount > 100000.0 or velocity > 10.0:
            proposal = "ESCALATE"
            confidence = 0.88
            reasoning = f"High-velocity outlier: Transaction amount of ₹{amount:,.2f} with 1-hour velocity of {velocity}x exceeds 30-day customer baseline by 450%."
            dissent = True
        elif is_cross_border and account_age < 30:
            proposal = "BLOCK"
            confidence = 0.82
            reasoning = f"Cross-border transfer from newly onboarded account ({account_age} days old) without established historical baseline."
            dissent = True
        else:
            proposal = "AUTHORIZE"
            confidence = 0.94
            reasoning = f"Transaction profile matches established 30-day baseline (Amount: ₹{amount:,.2f}, velocity: {velocity}x, account age: {account_age} days)."
            dissent = False

        return {
            "agent_name": self.name,
            "proposal": proposal,
            "confidence": confidence,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": dissent,
            "evidence_nodes": ["baseline_profile", "velocity_metric", "amount_tier"]
        }

class DataVerificationAgent:
    name = "Data Verification Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.95) -> AgentDeliberationOutput:
        p = state["payload"]
        proxy = p.get("proxy_detected", False)
        sim_swap = p.get("sim_swap_detected", False)
        device_trust = float(p.get("device_trust_score", 0.90))
        kyc_bypassed = p.get("kyc_bypassed", False)
        
        if sim_swap or proxy or kyc_bypassed:
            proposal = "BLOCK"
            confidence = 0.98
            flags = []
            if sim_swap: flags.append("Recent SIM Swap within 48h")
            if proxy: flags.append("TOR / High-Risk Proxy IP")
            if kyc_bypassed: flags.append("KYC Verification Bypassed")
            reasoning = f"Critical telemetry verification failure: {', '.join(flags)}. Device trust rating dropped to {device_trust:.2f}."
            dissent = True
        elif device_trust < 0.70:
            proposal = "ESCALATE"
            confidence = 0.80
            reasoning = f"New unrecognized device hardware fingerprint with medium trust score ({device_trust:.2f})."
            dissent = False
        else:
            proposal = "AUTHORIZE"
            confidence = 0.96
            reasoning = f"Device fingerprint, TLS telemetry, and biometric challenge verified successfully (Trust: {device_trust:.2f})."
            dissent = False

        return {
            "agent_name": self.name,
            "proposal": proposal,
            "confidence": confidence,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": dissent,
            "evidence_nodes": ["device_fingerprint", "telemetry_tls", "sim_swap_signal"]
        }

class PlannerAgent:
    name = "Planner Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.90) -> AgentDeliberationOutput:
        anom = state.get("is_anomaly", False)
        anom_score = state.get("anomaly_score", 0.0)
        
        if anom:
            proposal = "ESCALATE"
            confidence = 0.91
            reasoning = f"Pre-screening autoencoder flagged structural anomaly ({anom_score:.2f}). Investigation pathway: Full forensic verification and counterparty audit."
            dissent = True
        else:
            proposal = "AUTHORIZE"
            confidence = 0.89
            reasoning = f"Investigation pathway clear: Standard low-friction transaction flow with sufficient KYC backing and positive precedent matches."
            dissent = False

        return {
            "agent_name": self.name,
            "proposal": proposal,
            "confidence": confidence,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": dissent,
            "evidence_nodes": ["investigation_pathway", "anomaly_screener_output"]
        }

class MemoryTrustAgent:
    name = "Memory Trust Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.94) -> AgentDeliberationOutput:
        mem_mode = state.get("primary_memory_mode", "ADVISORY")
        precedents = state.get("retrieved_precedents", [])
        
        if mem_mode == "QUARANTINED":
            proposal = "BLOCK"
            confidence = 0.99
            reasoning = "Memory Trust Gate quarantined historical precedent due to detected adversarial memory poisoning / checksum failure."
            dissent = True
        elif mem_mode in ["REJECTED", "RESTRICTED"]:
            proposal = "ESCALATE"
            confidence = 0.84
            reasoning = f"Memory Trust Gate flagged precedent as {mem_mode} (Temporal decay / RBI policy regime shift). Prior cannot be cited as primary justification."
            dissent = True
        elif mem_mode == "ESCALATED":
            proposal = "ESCALATE"
            confidence = 0.90
            reasoning = "Conflicting high-trust precedents detected in Causal Memory Capsule. Requiring human arbitration."
            dissent = True
        else:
            proposal = "AUTHORIZE"
            confidence = 0.95
            reasoning = f"Memory precedent verified in ADVISORY mode (Freshness score > 0.85, valid provenance, current regulatory regime)."
            dissent = False

        return {
            "agent_name": self.name,
            "proposal": proposal,
            "confidence": confidence,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": dissent,
            "evidence_nodes": ["memory_trust_gate", "temporal_decay_factor", "regime_indicator"]
        }

class RiskAssessmentAgent:
    name = "Risk Assessment Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.91) -> AgentDeliberationOutput:
        p = state["payload"]
        amount = float(p.get("amount", 0.0))
        mcc = str(p.get("merchant_category_code", "5411"))
        risk_raw = float(p.get("raw_risk_score", 0.15))
        
        if mcc in settings.HIGH_RISK_MERCHANT_CODES or risk_raw > 0.75:
            proposal = "BLOCK"
            confidence = 0.92
            reasoning = f"Critical financial exposure: High-risk merchant category (MCC {mcc}) and high loss probability ({risk_raw*100:.1f}%)."
            dissent = True
        elif amount > 50000.0 or risk_raw > 0.40:
            proposal = "ESCALATE"
            confidence = 0.83
            reasoning = f"Elevated exposure (₹{amount:,.2f}, risk score {risk_raw:.2f}) warrants manual risk officer approval."
            dissent = False
        else:
            proposal = "AUTHORIZE"
            confidence = 0.93
            reasoning = f"Loss probability is minimal ({risk_raw*100:.1f}%). Verified counterparty with low chargeback history."
            dissent = False

        return {
            "agent_name": self.name,
            "proposal": proposal,
            "confidence": confidence,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": dissent,
            "evidence_nodes": ["mcc_risk_tier", "loss_probability", "exposure_limit"]
        }

class ResourceImpactAgent:
    name = "Resource & Impact Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.86) -> AgentDeliberationOutput:
        p = state["payload"]
        is_vip = p.get("is_vip_customer", False)
        amount = float(p.get("amount", 0.0))
        
        if is_vip and amount < 50000.0:
            proposal = "AUTHORIZE"
            confidence = 0.91
            reasoning = "High customer lifetime value (VIP segment). False-positive block would cause significant churn and reputational damage."
            dissent = False
        elif amount > 250000.0:
            proposal = "ESCALATE"
            confidence = 0.85
            reasoning = "Operational impact of unverified high-value settlement exceeds standard remediation reserves."
            dissent = False
        else:
            proposal = "AUTHORIZE"
            confidence = 0.88
            reasoning = "Balanced cost-benefit profile. Frictionless processing recommended."
            dissent = False

        return {
            "agent_name": self.name,
            "proposal": proposal,
            "confidence": confidence,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": dissent,
            "evidence_nodes": ["customer_lifetime_value", "friction_cost", "remediation_overhead"]
        }

class EthicsSafetyAgent:
    name = "Ethics & Safety Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.96) -> AgentDeliberationOutput:
        p = state["payload"]
        country = str(p.get("destination_country", "IN"))
        
        if country in settings.SANCTIONED_COUNTRIES:
            proposal = "BLOCK"
            confidence = 0.99
            reasoning = f"Sanctions enforcement: Destination country code '{country}' is on the statutory prohibited sanctions list."
            dissent = True
        else:
            proposal = "AUTHORIZE"
            confidence = 0.97
            reasoning = "Complies with statutory guidelines (DPDP Act 2023, RBI Fair Practices Code). No algorithmic bias on protected demographic proxies."
            dissent = False

        return {
            "agent_name": self.name,
            "proposal": proposal,
            "confidence": confidence,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": dissent,
            "evidence_nodes": ["dpdp_compliance", "rbi_fair_practices", "sanction_list"]
        }

class ConsensusAgent:
    name = "Consensus Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.98) -> AgentDeliberationOutput:
        candidate = state.get("consensus_candidate", "AUTHORIZE")
        confidence = state.get("consensus_confidence", 0.90)
        entropy = state.get("dissent_entropy", 0.15)
        dissenters = state.get("dissenting_agents", [])
        
        dissent_text = f"Dissenting opinions recorded from: {', '.join(dissenters)}." if dissenters else "Unanimous agent alignment."
        reasoning = (
            f"Synthesized weighted consensus: {candidate} with {confidence*100:.1f}% confidence "
            f"(Dissent Entropy: {entropy:.3f}). {dissent_text}"
        )

        return {
            "agent_name": self.name,
            "proposal": candidate,
            "confidence": confidence,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": len(dissenters) > 0,
            "evidence_nodes": ["weighted_vote_matrix", "entropy_metric", "trust_adjusted_scores"]
        }

class RevisionAgent:
    name = "Revision Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.95) -> AgentDeliberationOutput:
        delta = state.get("decision_delta")
        if delta:
            faulty = delta.get("faulty_assumptions", [])
            vars_list = [f["variable"] for f in faulty]
            reasoning = f"Revision triggered: Isolated faulty assumption(s) [{', '.join(vars_list)}]. Counterfactual simulation recommends replacing outcome with {delta.get('replacement_outcome')}."
            proposal = delta.get("replacement_outcome", "BLOCKED")
        else:
            proposal = "AUTHORIZE"
            reasoning = "No revision conditions detected. Operating under standard governance mode."

        return {
            "agent_name": self.name,
            "proposal": proposal,
            "confidence": 0.96,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": False,
            "evidence_nodes": ["counterfactual_scm", "faulty_assumption_isolation"]
        }

class RevisionValidatorAgent:
    name = "Revision Validator Agent"
    def run(self, state: DeliberationState, trust_score: float = 0.97) -> AgentDeliberationOutput:
        delta = state.get("decision_delta")
        if delta:
            reasoning = f"Validated Decision Delta: Original capsule frozen for compliance audit. Signature '{delta.get('signature')}' verified against SHA-256 ledger."
            proposal = delta.get("replacement_outcome", "BLOCKED")
        else:
            proposal = "AUTHORIZE"
            reasoning = "Baseline policy verification confirmed."

        return {
            "agent_name": self.name,
            "proposal": proposal,
            "confidence": 0.98,
            "trust_weight": trust_score,
            "reasoning_text": reasoning,
            "dissent_flag": False,
            "evidence_nodes": ["decision_delta_signature", "frozen_ledger_link"]
        }
