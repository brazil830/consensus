import math
import datetime
from typing import Dict, Any, Tuple, List
from app.config import settings

class InfluenceMode:
    ADVISORY = "ADVISORY"          # S(t) >= 0.85 & fresh
    WEIGHTED = "WEIGHTED"          # 0.65 <= S(t) < 0.85
    RESTRICTED = "RESTRICTED"      # 0.40 <= S(t) < 0.65
    REJECTED = "REJECTED"          # S(t) < 0.40 or regime mismatch
    QUARANTINED = "QUARANTINED"    # Tampered / poisoned / anomaly flagged
    ESCALATED = "ESCALATED"        # Conflicting high-trust precedents

class TemporalDecayEngine:
    """
    ML Model 2: Temporal Knowledge Graph & Exponential Temporal Decay Engine.
    Computes mathematical time-decay validity of retrieved historical precedents,
    evaluates policy regime consistency, and assigns the 6 Influence Modes.
    """
    def __init__(self, default_lambda: float = settings.DEFAULT_LAMBDA_DECAY):
        self.default_lambda = default_lambda

    def calculate_decay_score(
        self,
        base_trust: float,
        created_at: datetime.datetime,
        current_time: datetime.datetime = None,
        regulatory_regime: str = "RBI_2026_V2",
        provenance_weights: List[float] = None,
        lambda_rate: float = None,
        is_tampered: bool = False
    ) -> Tuple[float, Dict[str, Any]]:
        """
        S(t) = S_0 * exp(-lambda * delta_days) * prod(w_i) * I(regime_match)
        """
        if current_time is None:
            current_time = datetime.datetime.utcnow()

        if provenance_weights is None:
            provenance_weights = [1.0]

        rate = lambda_rate if lambda_rate is not None else self.default_lambda

        # Delta time in days
        delta_seconds = max(0.0, (current_time - created_at).total_seconds())
        delta_days = delta_seconds / 86400.0

        # Exponential time factor
        time_factor = math.exp(-rate * delta_days)

        # Provenance factor product
        provenance_factor = 1.0
        for w in provenance_weights:
            provenance_factor *= max(0.1, min(1.0, w))

        # Regime indicator function: collapses score if policy version is outdated
        regime_match = (regulatory_regime == settings.CURRENT_REGULATORY_REGIME)
        regime_indicator = 1.0 if regime_match else 0.0

        if is_tampered:
            final_score = 0.0
        else:
            final_score = base_trust * time_factor * provenance_factor * regime_indicator

        final_score = max(0.0, min(1.0, final_score))

        # Half life in days = ln(2) / lambda
        half_life_days = math.log(2) / rate if rate > 0 else 9999.0

        details = {
            "base_trust_score": base_trust,
            "delta_days": round(delta_days, 2),
            "time_factor": round(time_factor, 4),
            "provenance_factor": round(provenance_factor, 4),
            "regime_match": regime_match,
            "regime_indicator": regime_indicator,
            "regulatory_regime": regulatory_regime,
            "current_regime": settings.CURRENT_REGULATORY_REGIME,
            "half_life_days": round(half_life_days, 1),
            "lambda_decay_rate": rate,
            "computed_trust_score": round(final_score, 4)
        }
        return final_score, details

    def classify_influence_mode(
        self,
        trust_score: float,
        is_tampered: bool = False,
        anomaly_score: float = 0.0,
        has_conflict: bool = False,
        regime_match: bool = True
    ) -> Tuple[str, str]:
        """
        Maps numerical score and flags into one of the 6 formal Influence Modes.
        """
        if is_tampered or anomaly_score > settings.ANOMALY_RECON_THRESHOLD:
            return InfluenceMode.QUARANTINED, "Adversarial tampering or structural anomaly detected. Isolated in security vault."

        if has_conflict:
            return InfluenceMode.ESCALATED, "Conflicting high-trust historical precedents detected. Requires human arbitration."

        if not regime_match or trust_score < settings.RESTRICTED_THRESHOLD:
            return InfluenceMode.REJECTED, "Precedent is expired, outdated, or policy regime has been superseded."

        if settings.RESTRICTED_THRESHOLD <= trust_score < settings.WEIGHTED_THRESHOLD:
            return InfluenceMode.RESTRICTED, "Precedent has moderate temporal decay. Injected only with explicit staleness constraint."

        if settings.WEIGHTED_THRESHOLD <= trust_score < settings.ADVISORY_THRESHOLD:
            return InfluenceMode.WEIGHTED, "Precedent is valid but aging. Injected with confidence down-weight factor."

        return InfluenceMode.ADVISORY, "Precedent is fresh, verified, and adheres to current regulatory regime."

    def generate_decay_curve_points(
        self,
        base_trust: float = 0.95,
        lambda_rate: float = None,
        max_days: int = 60,
        steps: int = 15
    ) -> List[Dict[str, Any]]:
        """
        Generates data points for UI plotting of exponential decay half-life curves.
        """
        rate = lambda_rate if lambda_rate is not None else self.default_lambda
        points = []
        for d in range(0, max_days + 1, max_days // steps):
            score = base_trust * math.exp(-rate * d)
            points.append({
                "day": d,
                "trust_score": round(score, 3),
                "threshold_advisory": settings.ADVISORY_THRESHOLD,
                "threshold_weighted": settings.WEIGHTED_THRESHOLD,
                "threshold_restricted": settings.RESTRICTED_THRESHOLD
            })
        return points

temporal_decay_engine = TemporalDecayEngine()
