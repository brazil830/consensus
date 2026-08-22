from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class GraphNode(BaseModel):
    node_id: str
    node_type: str  # "Agent", "MemoryCapsule", "ContextVariable", "Evidence", "Outcome"
    label: str = ""
    properties: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    source_id: str
    target_id: str
    edge_type: str  # "PROPOSED", "CITES", "EVALUATED", "PRODUCED"
    weight: float = 1.0

class AttributionContributor(BaseModel):
    node_id: str
    node_type: str
    attention_weight: float
    contribution_score: float
    role: str

class AttributionResult(BaseModel):
    outcome_id: str
    contributors: List[AttributionContributor]
    confidence: float = 0.90
    graph_path: List[str] = Field(default_factory=list)
    explanation: str = ""

class GraphAnomalyResult(BaseModel):
    anomaly_detected: bool = False
    anomaly_score: float = 0.0
    anomaly_type: str = "NONE"
    affected_nodes: List[str] = Field(default_factory=list)
    affected_edges: List[str] = Field(default_factory=list)
    explanation: str = ""
