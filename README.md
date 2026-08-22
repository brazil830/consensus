# ConsensusAI Platform — Comprehensive System & Operations Manual

> **Tagline:** *"Detect. Reconsider. Decide again — with evidence."*  
> **Domain:** Autonomous Agent Governance, Agentic AI Risk Management, & Memory Trust Infrastructure  
> **Version:** 1.0.0 (August 2026)

---

## 1. Executive Summary & System Overview

**ConsensusAI** is an enterprise-grade decision governance, causal memory, and policy enforcement layer designed for multi-agent autonomous systems operating in high-stakes, regulated environments (such as banking fraud detection, credit underwriting, healthcare triage support, and industrial operations).

### Key Value Propositions
1. **Explainable Autonomy:** Every decision is accompanied by a full audit trail including raw telemetry, specialist agent reasoning, dissent records, and evidence nodes.
2. **Deterministic Memory Trust:** Historical precedents retrieved via RAG/Vector search are mathematically evaluated using temporal exponential decay and regulatory regime matching before they are permitted to influence agent deliberations.
3. **5-Gate Governance Engine:** Multi-agent proposals pass through deterministic hard policy rules, ML anomaly screening, and evidence integrity gates.
4. **Tamper-Evident Causal Memory Capsule:** Decisions, payload hashes, and outcomes are locked into an immutable SHA-256 hash-chained ledger linked with a Heterogeneous Graph Neural Network (HGNN) for credit/blame attribution.
5. **Counterfactual Decision Revision Engine:** When historical decisions are flagged invalid or challenged with new evidence, the system isolates faulty assumptions, freezes the original record for compliance, and generates a cryptographically signed **Decision Delta** without silent database overwrites.

---

## 2. Platform Architecture & 5-Gate Governance Workflow

ConsensusAI wraps autonomous multi-agent deliberations in a sequential, 6-phase (Stage 0 to Stage 5) pipeline:

```
 Incoming Case Payload
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 0: Evidence Integrity & Causal Governance Gate   │ ──► Checks telemetry completeness, consistency & schema
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 1: ML Pre-Screening (Autoencoder)                │ ──► Detects payload anomalies & memory poisoning attempts
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 2: Memory Trust Gate & Temporal Decay            │ ──► Scores precedents (Advisory, Weighted, Restricted, 
└────────────────────────┬───────────────────────────────┘     Rejected, Quarantined, Escalated)
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 3: 10 Specialist Agent Panel Deliberation        │ ──► Parallel reasoning by domain-specific agents
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 4: Consensus Synthesis & HGNN Attribution        │ ──► Trust-scaled voting, Shannon dissent entropy, 
└────────────────────────┬───────────────────────────────┘     and Shapley attribution calculations
                         │
                         ▼
┌────────────────────────────────────────────────────────┐
│ STAGE 5: Deterministic Policy & Action Gate            │ ──► Evaluates hard statutory rules & seals decision 
└────────────────────────┬───────────────────────────────┘     into SHA-256 Hash Capsule ledger
                         │
                         ▼
             AUTHORIZE / BLOCK / ESCALATE
```

---

## 3. Specialist Agents Breakdown (The 10-Agent Panel)

ConsensusAI employs 10 specialized agents operating with role separation to analyze cases, evaluate risks, enforce ethics, and handle decision revisions:

| Agent Name | Primary Responsibility | Key Evidence Nodes Evaluated | Default Proposal Output |
| :--- | :--- | :--- | :--- |
| **Context Analyzer Agent** | Evaluates baseline transaction profiles, customer transaction velocity, and historical deviation. | `baseline_profile`, `velocity_metric`, `amount_tier` | `AUTHORIZE` / `ESCALATE` / `BLOCK` |
| **Data Verification Agent** | Performs telemetry verification, device fingerprinting, TLS signal checks, SIM swap detection, and proxy checks. | `device_fingerprint`, `telemetry_tls`, `sim_swap_signal` | `AUTHORIZE` / `BLOCK` / `ESCALATE` |
| **Planner Agent** | Determines investigation pathways and responds to pre-screening ML autoencoder flags. | `investigation_pathway`, `anomaly_screener_output` | `AUTHORIZE` / `ESCALATE` |
| **Memory Trust Agent** | Evaluates retrieved precedent influence modes (Advisory, Weighted, Restricted, Quarantined) and flags regime shifts. | `memory_trust_gate`, `temporal_decay_factor`, `regime_indicator` | `AUTHORIZE` / `ESCALATE` / `BLOCK` |
| **Risk Assessment Agent** | Evaluates exposure limits, loss probability, and merchant category risk (MCC codes). | `mcc_risk_tier`, `loss_probability`, `exposure_limit` | `AUTHORIZE` / `ESCALATE` / `BLOCK` |
| **Resource & Impact Agent** | Analyzes customer lifetime value (VIP status), friction impact, and operational remediation costs. | `customer_lifetime_value`, `friction_cost`, `remediation_overhead` | `AUTHORIZE` / `ESCALATE` |
| **Ethics & Safety Agent** | Enforces regulatory compliance (DPDP Act 2023, RBI Fair Practices Code) and international sanctions lists. | `dpdp_compliance`, `rbi_fair_practices`, `sanction_list` | `AUTHORIZE` / `BLOCK` |
| **Consensus Agent** | Synthesizes proposals across all agents using trust-scaled voting, computes Shannon entropy, and records dissenters. | `weighted_vote_matrix`, `entropy_metric`, `trust_adjusted_scores` | `AUTHORIZE` / `BLOCK` / `ESCALATE` |
| **Revision Agent** | Runs counterfactual Structural Causal Models (SCM) to isolate faulty assumptions when cases are challenged. | `counterfactual_scm`, `faulty_assumption_isolation` | `REVISED` outcome proposal |
| **Revision Validator Agent** | Cryptographically verifies Decision Delta signatures against the frozen SHA-256 ledger. | `decision_delta_signature`, `frozen_ledger_link` | Verified replacement verdict |

---

## 4. Machine Learning & Core Governance Infrastructure

ConsensusAI combines deterministic Python governance code with multi-task machine learning models:

### 1. Multi-Task Deep Neural Network (MT-DNN Governance Model)
- **7-Dimension Trust & Risk Assessment:** Computes relevance, context match, evidence quality, temporal validity, hash integrity, dissent severity, and action risk tier (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Features:** Evaluates 16-dimensional vector inputs across precedent properties and case telemetry.

### 2. Heterogeneous Graph Neural Network (HGNN)
- **Causal Graph Topology:** Constructs graphs with node types `Agent`, `MemoryCapsule`, `ContextVariable`, `Evidence`, and `Outcome`.
- **Shapley Attribution Engine:** Computes exact Shapley attention weights and contribution scores to assign credit or blame to individual agents and evidence nodes.
- **Graph Anomaly Screener:** Detects abnormal agent clustering or structural graph manipulation attempts.

### 3. SHA-256 Hash Capsule Ledger
- Each decision is assigned a sequence number and sealed into an immutable block containing `prev_hash`, `payload_hash`, `curr_hash`, `outcome`, `consensus_confidence`, and `dissent_entropy`.
- Genesis Block hash: `0000000000000000000000000000000000000000000000000000000000000000`.

### 4. Temporal Decay Engine (TKG)
- Precedents decay exponentially over time:
  $$\text{Score} = \text{BaseScore} \times e^{-\lambda \times \text{Days}}$$
- Down-ranks precedents if regulatory regime shifts occur (e.g., transition from `RBI_2025_V1` to `RBI_2026_V2`).

---

## 5. Platform Pages, User Interfaces & Operational Actions

The frontend is a modern, high-density Vite + React web application (`http://localhost:5173`) tailored for Risk Officers, Auditors, and Platform Engineers:

### 1. Landing Page (`/`)
- **Action:** Public showcase and interactive demo.
- **Features:** Live interactive architecture diagram showing how transactions flow through the 5 gates, core metrics, feature highlights, and direct login navigation.

### 2. Authentication Page (`/login`)
- **Action:** Secure User Login & Account Registration.
- **Features:** Supports JWT authentication, password hashing (bcrypt via Python passlib), and role selection (`analyst`, `risk_officer`, `admin`). Protects all internal governance routes.

### 3. Executive Dashboard (`/dashboard`)
- **Action:** Central Command Center for case monitoring.
- **Features:**
  - System status indicators: Ledger Integrity (`SECURE` / `TAMPER_DETECTED`), Active Regulatory Regime, Average Agent Trust Index.
  - Case search & domain/status filtering (`ALL`, `AUTHORIZED`, `BLOCKED`, `ESCALATED`, `REVISED`).
  - Action buttons to view case details, trigger live SSE deliberations, or open escalations.

### 4. Case Submission Page (`/submit`)
- **Action:** Submit new cases or transactions into the governance engine.
- **Features:**
  - One-click **Preset Scenario Loaders**:
    1. *Standard High-Value Transfer* (Triggers standard multi-agent deliberation).
    2. *Sanctioned Entity Transfer* (Triggers instant Ethics & Safety Agent veto).
    3. *Stale Historical Precedent* (Triggers Memory Trust Gate temporal decay downgrade).
    4. *Adversarial Anomaly Attack* (Triggers ML Autoencoder screening flag).
  - Custom JSON payload editor and instant case execution.

### 5. Live 5-Stage Deliberation View (`/cases/:id/live`)
- **Action:** Real-time visualization of the 5-Gate Deliberation process via Server-Sent Events (SSE).
- **Features:**
  - Stage-by-stage progression bar (Stages 0 to 5).
  - Live terminal logs showing agent reasoning as it streams.
  - Agent Orbit visualization & proposal cards with confidence meters.
  - Dissent Entropy gauge and final Policy Gate verdict seal.

### 6. Case Detail & Governance Hub (`/cases/:id`)
- **Action:** Deep-dive case inspection & governance control.
- **Features:**
  - 10-Agent proposal cards with reasoning text and evidence badges.
  - Dissent Analysis Panel (Shannon Entropy calculation & dissenting agent breakdown).
  - Interactive Causal Memory Graph & HGNN Attribution breakdown.
  - Capsule Hash Integrity Badge with prev/curr SHA-256 checksums.
  - **Action Button: "Trigger Decision Revision"** (Opens modal to supply invalidating evidence and execute Counterfactual SCM revision).
  - **Action Button: "Generate Explainability Report"** (Navigates to `/reports/:id`).

### 7. Human-in-the-Loop Escalations Queue (`/escalations`)
- **Action:** Review and resolve escalated or borderline cases.
- **Features:**
  - Escalation Queue displaying cases flagged by Policy Gate or agent dissent.
  - Full evidence bundle viewer and reviewer notes form.
  - **Action Buttons: "AUTHORIZE" or "BLOCK"**: Permanently seals reviewer ruling into the immutable hash capsule.

### 8. Multi-Level Explainability Reports (`/reports/:id`)
- **Action:** Generate audience-tailored decision reports.
- **Features:**
  - View switcher:
    - **Executive Summary:** High-level decision rationale for executive leadership.
    - **Compliance & Auditor Report:** Detailed evidence nodes, regulatory regime compliance, and hash chain audit trace.
    - **Technical Engineer View:** HGNN Shapley attributions, MT-DNN 7-dimension risk vector, and agent trust weights.
  - Print / Export PDF button.

### 9. Ops & Ledger Administration (`/ops`)
- **Action:** Platform engineering, ledger health, & security testing.
- **Features:**
  - **Cryptographic Hash Chain Integrity Checker:** Scans full capsule ledger.
  - **Action Button: "Simulate Adversarial Tamper"**: Injects a `DEADBEEF` payload attack into Block #1 to demonstrate live chain failure detection.
  - **Action Button: "1-Click Ledger Repair & Reseed"**: Restores ledger to clean cryptographic state.
  - Agent Trust Score management table and ML Model Telemetry monitors (MT-DNN & HGNN latency and status).

### 10. Settings & Regulatory Governance (`/settings`)
- **Action:** Global system configuration.
- **Features:** Regulatory Regime selector (`RBI_2026_V2`, `EU_AI_ACT_2026`, `US_OCC_AI_V3`), Temporal Decay half-life configuration, and system thresholds.

### Global Interface Tools
- **Command Palette (`Cmd+K` or `Ctrl+K`):** Quick navigation shortcut modal across all pages, cases, and actions.
- **Demo Mode Bar:** Quick toggle for demo scenarios and simulated telemetry.

---

## 6. Full API Endpoint Reference

The backend FastAPI server exposes the following REST and SSE streaming endpoints:

### Authentication & Profiles
- `POST /api/auth/register` — Register new account (`UserRegisterRequest`).
- `POST /api/auth/login` — Authenticate and receive JWT access token (`UserLoginRequest`).
- `GET /api/auth/me` — Fetch currently authenticated user profile.

### System & Health
- `GET /` — API root status.
- `GET /api/status` — Global system health, case counts, ledger integrity status, and average agent trust score.
- `GET /api/ml/status` — Telemetry for MT-DNN and HGNN models.

### Case Management & Deliberation
- `GET /api/cases` — List all processed cases with summary status.
- `POST /api/cases` — Submit a new case payload.
- `GET /api/cases/{case_id}` — Retrieve full case details, deliberations, capsule block, and decision deltas.
- `GET /api/cases/{case_id}/deliberate/stream` — **SSE Stream** for real-time 5-stage deliberation.

### Decision Revision & Human Escalation
- `POST /api/cases/{case_id}/revise` — Trigger Counterfactual SCM Revision Engine.
- `POST /api/escalation/{case_id}/resolve` — Capture human reviewer ruling and seal into hash capsule.

### Explainability & Reports
- `GET /api/reports/{case_id}?level=executive|auditor|technical` — Generate audience-tailored explainability report.

### Cryptographic Capsule Ledger & Security
- `GET /api/capsule/verify` — Execute full cryptographic audit of SHA-256 hash ledger.
- `POST /api/capsule/tamper-simulate?block_index=1` — Inject malicious tamper into historical block for security testing.
- `POST /api/capsule/tamper-repair` — Clear DB and re-seed clean ledger.

### Machine Learning & Knowledge Graph Analytics
- `GET /api/tkg` — Retrieve Temporal Knowledge Graph precedents and decay curve points.
- `GET /api/agents/trust` — Fetch agent participation counts, trust scores, and accuracy percentages.
- `GET /api/cases/{case_id}/trust-analysis` — 7-dimension MT-DNN risk and memory trust analysis.
- `GET /api/cases/{case_id}/graph` — Causal graph topology and anomaly analysis.
- `GET /api/cases/{case_id}/attribution` — HGNN Shapley credit/blame attributions.
- `GET /api/cases/{case_id}/evidence-integrity` — Stage 0 evidence integrity evaluation.

---

## 7. Database Schema & Data Models

The SQLite database (`consensus_ai.db`) contains 11 core tables managed via SQLAlchemy:

1. `cases`: Primary case records (`case_id`, `title`, `domain`, `status`, `payload`, `anomaly_score`, `created_at`, `resolved_at`).
2. `precedents_tkg`: Temporal Knowledge Graph precedents (`precedent_id`, `entity_id`, `relation`, `valid_from`, `regulatory_regime`, `base_trust_score`, `is_tampered`).
3. `agent_deliberations`: Deliberation proposals per agent (`deliberation_id`, `case_id`, `agent_name`, `proposal`, `confidence`, `trust_weight`, `reasoning_text`, `dissent_flag`, `evidence_nodes`).
4. `capsule_entries`: SHA-256 hash chain ledger (`capsule_id`, `case_id`, `sequence_num`, `prev_hash`, `payload_hash`, `curr_hash`, `outcome`, `consensus_confidence`, `dissent_entropy`, `policy_gate_verdict`, `frozen_flag`, `superseded_by`, `human_ruling`).
5. `decision_deltas`: Counterfactual revision deltas (`delta_id`, `original_capsule_id`, `revised_capsule_id`, `faulty_assumptions`, `causal_explanation`, `replacement_outcome`, `signature`).
6. `agent_trust_scores`: Agent accuracy tracking (`agent_name`, `current_trust_score`, `total_decisions_participated`, `accurate_decisions_count`).
7. `model_predictions`: MT-DNN model outputs (`id`, `case_id`, `memory_capsule_id`, `model_name`, `prediction_json`).
8. `hgnn_attributions`: HGNN Shapley node attributions (`id`, `case_id`, `outcome_id`, `node_id`, `attention_weight`, `contribution_score`, `role`).
9. `model_anomalies`: HGNN anomaly records (`id`, `case_id`, `model_name`, `anomaly_type`, `score`, `affected_nodes`).
10. `evidence_records`: Evidence telemetry tracking (`id`, `case_id`, `source`, `field`, `value`, `integrity_status`).
11. `users`: System user accounts for authentication & RBAC (`user_id`, `email`, `username`, `hashed_password`, `full_name`, `role`, `is_active`).

---

## 8. Commands to Run & Maintain the Application

### 1. Prerequisites
- **Python 3.11+** installed.
- **Node.js 20+** and **pnpm** (or `npm`) installed.
- **Git** installed.

### 2. Workspace Installation
From the repository root (`consensus-main`):
```bash
# Install workspace dependencies for frontend and monorepo tooling
pnpm install
```

### 3. Setting Up the Backend Python Environment
```bash
# Navigate to backend (or set up virtual environment at root)
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\activate
# On Linux / macOS:
source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt
```

### 4. Running the Backend Server (Development Mode)
With the virtual environment activated, run:
```bash
# From workspace root or backend directory
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

### 5. Running the Frontend Web UI (Development Mode)
In a separate terminal window:
```bash
cd frontend

# Run Vite dev server
pnpm dev
# (or using npm: npm run dev)
```
- Web Application URL: `http://localhost:5173`

### 6. Building for Production
```bash
# 1. Build frontend bundle
cd frontend
pnpm build

# 2. Run backend in production mode (without auto-reload)
cd ../backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 7. Database Reset & Reseeding
The SQLite database `consensus_ai.db` automatically seeds initial cases and precedents on backend startup. To perform a complete fresh reset:
```bash
# Delete SQLite database file
rm consensus_ai.db   # On Linux/macOS
del consensus_ai.db  # On Windows PowerShell

# Restart backend server – fresh database & seed data will load automatically
uvicorn app.main:app --reload
```
Alternatively, call the API endpoint:
```bash
curl -X POST http://127.0.0.1:8000/api/capsule/tamper-repair
```

### 8. Code Formatting & Quality Scripts
```bash
pnpm lint      # Run code linting across workspace
pnpm test      # Run test suites
pnpm format    # Apply Prettier formatting
```

---

## 9. Troubleshooting & FAQ

- **Issue: Port 8000 or 5173 already in use**
  - Solution: Specify a custom port for uvicorn (`--port 8001`) or Vite (`--port 5174`).
- **Issue: Hash Chain Integrity status displays `TAMPER_DETECTED`**
  - Solution: Navigate to the `/ops` page in the Web UI and click **"1-Click Ledger Repair & Reseed"**, or send a POST request to `/api/capsule/tamper-repair`.
- **Issue: Authentication failure on API calls**
  - Solution: Use the `/login` page to sign in, or pass the `Authorization: Bearer <token>` header obtained from `/api/auth/login`.

---

*Documentation maintained by ConsensusAI Platform Engineering Team.*
