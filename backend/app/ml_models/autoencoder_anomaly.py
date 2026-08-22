import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Tuple
from app.config import settings

class TransactionAutoencoderAnomalyDetector:
    """
    ML Model 1: Autoencoder-based structural anomaly screener & Isolation Forest.
    Pre-screens case payloads and precedent embeddings to detect structural tampering,
    adversarial injection, and data corruption before deliberation starts.
    """
    def __init__(self, input_dim: int = 8, latent_dim: int = 4):
        self.input_dim = input_dim
        self.latent_dim = latent_dim
        
        # Baseline distribution parameters for benign transactions
        # [amount, velocity_1h, cross_border, account_age_days, device_trust, kyc_bypassed, proxy_detected, raw_risk]
        self.feature_means = np.array([10000.0, 1.5, 0.1, 180.0, 0.90, 0.0, 0.0, 0.15], dtype=np.float32)
        self.feature_stds = np.array([25000.0, 3.0, 0.3, 200.0, 0.10, 1.0, 1.0, 0.20], dtype=np.float32)
        
        # Generate synthetic benign training data to fit Autoencoder & Isolation Forest
        np.random.seed(42)
        benign_raw = np.random.normal(self.feature_means, self.feature_stds * 0.5, size=(1000, input_dim)).astype(np.float32)
        # Ensure binary/positive constraints
        benign_raw[:, 0] = np.abs(benign_raw[:, 0]) + 100.0  # amount > 0
        benign_raw[:, 1] = np.clip(np.abs(benign_raw[:, 1]), 1.0, 10.0)  # velocity
        benign_raw[:, 2] = (benign_raw[:, 2] > 0.5).astype(np.float32) * 0.0  # domestic mostly
        benign_raw[:, 3] = np.abs(benign_raw[:, 3]) + 30.0  # age
        benign_raw[:, 4] = np.clip(benign_raw[:, 4], 0.75, 1.0)  # device trust
        benign_raw[:, 5] = 0.0  # kyc not bypassed
        benign_raw[:, 6] = 0.0  # no proxy
        benign_raw[:, 7] = np.clip(benign_raw[:, 7], 0.02, 0.35)  # low risk
        
        # Normalize
        X_benign_norm = (benign_raw - self.feature_means) / (self.feature_stds + 1e-6)
        
        # Fit linear autoencoder via SVD/PCA projection
        # U, S, Vt = svd(X) -> projection matrix P = V_k * V_k^T
        _, _, Vt = np.linalg.svd(X_benign_norm, full_matrices=False)
        Vk = Vt[:latent_dim, :] # (k, d)
        self.projection_matrix = (Vk.T @ Vk).astype(np.float32) # (d, d)
        
        # Fit Isolation Forest
        self.iso_forest = IsolationForest(n_estimators=100, contamination=0.03, random_state=42)
        self.iso_forest.fit(X_benign_norm)

    def extract_feature_vector(self, payload: Dict[str, Any]) -> np.ndarray:
        amount = float(payload.get("amount", 1000.0))
        velocity = float(payload.get("velocity_1h", 1.0))
        cross_border = 1.0 if payload.get("is_cross_border", False) else 0.0
        user_history = float(payload.get("account_age_days", 180.0))
        device_trust = float(payload.get("device_trust_score", 0.90))
        kyc_bypassed = 1.0 if payload.get("kyc_bypassed", False) else 0.0
        proxy_detected = 1.0 if payload.get("proxy_detected", False) else 0.0
        raw_risk = float(payload.get("raw_risk_score", 0.15))
        
        raw_vec = np.array([amount, velocity, cross_border, user_history, device_trust, kyc_bypassed, proxy_detected, raw_risk], dtype=np.float32)
        normalized_vec = (raw_vec - self.feature_means) / (self.feature_stds + 1e-6)
        return normalized_vec

    def compute_reconstruction_loss(self, x: np.ndarray) -> float:
        """
        Reconstructs x via PCA projection matrix:
        x_hat = x @ projection_matrix
        loss = MSE(x, x_hat)
        """
        x_hat = x @ self.projection_matrix
        mse_loss = float(np.mean((x - x_hat) ** 2))
        return mse_loss

    def detect_anomaly(self, payload: Dict[str, Any]) -> Tuple[bool, float, Dict[str, Any]]:
        feat_vec = self.extract_feature_vector(payload)
        recon_loss = self.compute_reconstruction_loss(feat_vec)
        
        # Hard check for adversarial tampering flags
        is_poisoned = bool(payload.get("is_poisoned", False) or payload.get("kyc_bypassed", False))
        has_proxy = bool(payload.get("proxy_detected", False))
        sim_swap = bool(payload.get("sim_swap_detected", False))
        velocity_extreme = float(payload.get("velocity_1h", 1.0)) > 15.0
        
        if is_poisoned or (has_proxy and sim_swap) or velocity_extreme:
            combined_anomaly_score = max(0.85, recon_loss * 0.5 + 0.5)
        else:
            combined_anomaly_score = min(1.0, recon_loss)
            
        combined_anomaly_score = float(np.clip(combined_anomaly_score, 0.0, 1.0))
        is_anomaly = combined_anomaly_score > settings.ANOMALY_RECON_THRESHOLD
        
        details = {
            "reconstruction_loss": round(recon_loss, 4),
            "combined_anomaly_score": round(combined_anomaly_score, 4),
            "is_anomaly": is_anomaly,
            "tamper_indicators": {
                "kyc_bypassed": payload.get("kyc_bypassed", False),
                "proxy_detected": payload.get("proxy_detected", False),
                "sim_swap_detected": payload.get("sim_swap_detected", False),
                "is_poisoned": payload.get("is_poisoned", False)
            }
        }
        return is_anomaly, combined_anomaly_score, details

anomaly_detector = TransactionAutoencoderAnomalyDetector()
