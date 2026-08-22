# MT-DNN Model Configuration

MODEL_NAME = "MT-DNN-Governance"
MODEL_VERSION = "v1.0.0"
FEATURE_SCHEMA_VERSION = "v1.0"

# Feature vector size
NUM_NUMERICAL_FEATURES = 16

# Loss weights for multi-task training (w1..w7)
LOSS_WEIGHTS = {
    "relevance": 1.0,
    "context": 1.0,
    "evidence": 1.0,
    "temporal": 1.0,
    "integrity": 2.0,  # Higher weight on cryptographic hash integrity
    "dissent": 1.2,
    "risk": 1.5
}

# Risk tier boundaries
RISK_TIER_THRESHOLDS = {
    "LOW": (0.0, 0.35),
    "MEDIUM": (0.35, 0.65),
    "HIGH": (0.65, 0.85),
    "CRITICAL": (0.85, 1.0)
}
