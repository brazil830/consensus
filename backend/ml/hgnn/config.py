# HGNN Model Configuration

MODEL_NAME = "HGNN-CausalAttribution"
MODEL_VERSION = "v1.0.0"
GRAPH_SCHEMA_VERSION = "v1.0"

NODE_TYPES = ["Agent", "MemoryCapsule", "ContextVariable", "Evidence", "Outcome"]
EDGE_TYPES = [
    ("Agent", "PROPOSED", "MemoryCapsule"),
    ("MemoryCapsule", "CITES", "Evidence"),
    ("MemoryCapsule", "EVALUATED", "ContextVariable"),
    ("MemoryCapsule", "PRODUCED", "Outcome")
]

EMBEDDING_DIM = 64
NUM_HGT_HEADS = 4
ANOMALY_THRESHOLD = 0.65
