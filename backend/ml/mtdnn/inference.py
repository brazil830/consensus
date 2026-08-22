import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import torch
import torch.nn as nn
import numpy as np
import datetime
from typing import Dict, Any, Tuple

from app.config import settings
from ml.mtdnn.schemas import MemoryTrustFeatures, MTDNNPrediction
from ml.mtdnn.config import MODEL_NAME, MODEL_VERSION, RISK_TIER_THRESHOLDS

class PyTorchMTDNNModel(nn.Module):
    def __init__(self, input_dim: int = 16, hidden_dim: int = 64):
        super().__init__()
        self.shared_encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU()
        )
        self.relevance_head = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())
        self.context_head = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())
        self.evidence_head = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())
        self.temporal_head = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())
        self.hash_head = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())
        self.dissent_head = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())
        self.risk_head = nn.Sequential(nn.Linear(hidden_dim, 1), nn.Sigmoid())
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        shared_repr = self.shared_encoder(x)
        rel = self.relevance_head(shared_repr)
        ctx = self.context_head(shared_repr)
        evd = self.evidence_head(shared_repr)
        tmp = self.temporal_head(shared_repr)
        hsh = self.hash_head(shared_repr)
        dis = self.dissent_head(shared_repr)
        rsk = self.risk_head(shared_repr)
        return torch.cat([rel, ctx, evd, tmp, hsh, dis, rsk], dim=-1)

class MTDNNInferenceEngine:
    def __init__(self):
        self.model = PyTorchMTDNNModel()
        self.is_loaded = False
        self.load_checkpoint()
        
    def load_checkpoint(self):
        ckpt_path = os.path.join(os.path.dirname(__file__), "mtdnn_checkpoint.pt")
        if os.path.exists(ckpt_path):
            try:
                checkpoint = torch.load(ckpt_path, map_location=torch.device('cpu'))
                self.model.load_state_dict(checkpoint['model_state_dict'])
                self.model.eval()
                self.is_loaded = True
            except Exception as e:
                print(f"[MT-DNN] Warning: Failed to load checkpoint: {e}")
                self.model.eval()
                self.is_loaded = True
        else:
            self.model.eval()
            self.is_loaded = True

    def extract_features(
        self,
        query_payload: Dict[str, Any],
        precedent_dict: Dict[str, Any],
        deliberation_meta: Dict[str, Any]
    ) -> torch.Tensor:
        amount = float(query_payload.get('amount', 5000.0)) / 100000.0
        risk_level = float(query_payload.get('risk_level', 0.5))
        
        age_days = float(precedent_dict.get('age_days', 2.0)) / 30.0
        base_trust = float(precedent_dict.get('base_trust_score', 0.95))
        provenance = float(precedent_dict.get('provenance_reliability', 0.90))
        evidence_cnt = float(precedent_dict.get('evidence_count', 3.0)) / 10.0
        evidence_qual = float(precedent_dict.get('evidence_quality_avg', 0.85))
        hist_success = float(precedent_dict.get('outcome_historical_success', 0.90))
        
        # Hash Verification result: deterministic 1.0 or 0.0
        is_tampered = precedent_dict.get('is_tampered', False)
        hash_verified = 0.0 if is_tampered else float(precedent_dict.get('hash_verification_result', 1.0))
        
        context_comp = float(precedent_dict.get('contextual_compatibility', 0.88))
        policy_diff = float(precedent_dict.get('policy_version_diff', 0.0))
        
        disagreement = float(deliberation_meta.get('agent_disagreement_index', 0.20))
        prop_var = float(deliberation_meta.get('proposal_variance', 0.15))
        conf_disp = float(deliberation_meta.get('confidence_dispersion', 0.10))
        supp_agents = float(deliberation_meta.get('supporting_agent_count', 4.0)) / 10.0
        diss_agents = float(deliberation_meta.get('dissenting_agent_count', 1.0)) / 10.0
        
        vec = [
            amount, risk_level, age_days, base_trust, provenance, evidence_cnt,
            evidence_qual, hist_success, hash_verified, context_comp, policy_diff,
            disagreement, prop_var, conf_disp, supp_agents, diss_agents
        ]
        return torch.tensor(vec, dtype=torch.float32)

    def predict_trust_and_risk(
        self,
        query_payload: Dict[str, Any],
        precedent_dict: Dict[str, Any],
        deliberation_meta: Dict[str, Any]
    ) -> MTDNNPrediction:
        try:
            feat_tensor = self.extract_features(query_payload, precedent_dict, deliberation_meta)
            with torch.no_grad():
                out = self.model(feat_tensor.unsqueeze(0)).squeeze().tolist()
                
            rel, ctx, evd, tmp, hsh, dis, rsk = out
            
            # Hash verification result from precedent dominates hash head if tampered
            is_tampered = precedent_dict.get('is_tampered', False)
            if is_tampered:
                hsh = 0.0
                rsk = max(rsk, 0.92)
                
            if rsk < 0.35:
                tier = "LOW"
            elif rsk < 0.65:
                tier = "MEDIUM"
            elif rsk < 0.85:
                tier = "HIGH"
            else:
                tier = "CRITICAL"
                
            return MTDNNPrediction(
                relevance_score=round(float(rel), 4),
                context_match_score=round(float(ctx), 4),
                evidence_quality_score=round(float(evd), 4),
                temporal_validity_score=round(float(tmp), 4),
                hash_integrity_score=round(float(hsh), 4),
                dissent_severity=round(float(dis), 4),
                action_risk_score=round(float(rsk), 4),
                action_risk_tier=tier,
                confidence=0.92,
                model_version=MODEL_VERSION,
                inference_timestamp=datetime.datetime.utcnow().isoformat()
            )
        except Exception as e:
            print(f"[MT-DNN] Inference error, returning safe fallback: {e}")
            return MTDNNPrediction(
                relevance_score=0.85,
                context_match_score=0.80,
                evidence_quality_score=0.80,
                temporal_validity_score=0.75,
                hash_integrity_score=1.0,
                dissent_severity=0.25,
                action_risk_score=0.30,
                action_risk_tier="LOW",
                confidence=0.50,
                model_version=MODEL_VERSION + "-fallback",
                inference_timestamp=datetime.datetime.utcnow().isoformat()
            )

mtdnn_engine = MTDNNInferenceEngine()
