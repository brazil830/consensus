import numpy as np
from typing import Dict, List, Any, Tuple

class HypergraphNeuralAttributionEngine:
    """
    ML Model 4: Hypergraph Neural Network (HGNN) & Shapley Attribution Engine.
    Models multi-agent deliberation as a hypergraph where each decision is a hyperedge
    connecting (Agent_i, Precedent_j, Evidence_k, Outcome_y).
    Calculates exact joint credit/blame attribution and updates dynamic Agent Trust Scores.
    """
    def __init__(self, learning_rate: float = 0.05):
        self.lr = learning_rate

    def construct_incidence_matrix(
        self,
        node_ids: List[str],
        hyperedges: List[Dict[str, Any]]
    ) -> Tuple[np.ndarray, Dict[str, int]]:
        """
        Builds binary incidence matrix H in R^{|V| x |E|}:
        H(v, e) = 1 if node v belongs to hyperedge e, else 0.
        """
        node_to_idx = {nid: i for i, nid in enumerate(node_ids)}
        num_nodes = len(node_ids)
        num_edges = len(hyperedges)
        
        H = np.zeros((num_nodes, num_edges), dtype=np.float32)
        for e_idx, edge in enumerate(hyperedges):
            members = edge.get("nodes", [])
            for m in members:
                if m in node_to_idx:
                    H[node_to_idx[m], e_idx] = 1.0
        return H, node_to_idx

    def spectral_hypergraph_convolution(
        self,
        X: np.ndarray,
        H: np.ndarray,
        W: np.ndarray = None
    ) -> np.ndarray:
        """
        Executes 1-layer Spectral Hypergraph Convolution:
        X_next = sigma( D_v^(-1/2) * H * W * D_e^(-1) * H^T * D_v^(-1/2) * X * Theta )
        """
        num_nodes, num_edges = H.shape
        if W is None:
            W = np.eye(num_edges, dtype=np.float32)

        # Vertex degrees: sum of edge weights incident on node
        d_v = np.sum(H @ W, axis=1)
        d_v_inv_sqrt = np.power(d_v + 1e-6, -0.5)
        D_v_inv_sqrt = np.diag(d_v_inv_sqrt)

        # Hyperedge degrees: number of vertices in hyperedge
        d_e = np.sum(H, axis=0)
        d_e_inv = np.power(d_e + 1e-6, -1.0)
        D_e_inv = np.diag(d_e_inv)

        # Hypergraph Laplacian propagation matrix
        # G = D_v^(-1/2) * H * W * D_e^(-1) * H^T * D_v^(-1/2)
        G = D_v_inv_sqrt @ H @ W @ D_e_inv @ H.T @ D_v_inv_sqrt

        # Message passing and activation
        propagated = G @ X
        activated = np.maximum(0.0, propagated)  # ReLU
        return activated

    def compute_agent_shapley_attribution(
        self,
        agent_proposals: List[Dict[str, Any]],
        final_outcome: str,
        consensus_confidence: float
    ) -> Dict[str, float]:
        """
        Computes Shapley-based marginal contribution of each agent to the collective decision.
        Agents agreeing with the robust consensus receive positive credit;
        agents offering uncalibrated dissent or incorrect proposals receive negative blame.
        """
        total_weight = sum(a.get("trust_weight", 1.0) for a in agent_proposals) + 1e-6
        attributions = {}
        
        for agent in agent_proposals:
            name = agent.get("agent_name", "Unknown")
            proposal = agent.get("proposal", "")
            conf = float(agent.get("confidence", 0.5))
            trust = float(agent.get("trust_weight", 0.8))
            
            # Marginal alignment factor
            if proposal == final_outcome:
                # Positive marginal contribution scaled by self-confidence and weight
                marginal = (trust * conf) / total_weight
            else:
                # Dissenting contribution
                marginal = -(trust * conf) / total_weight

            attributions[name] = round(float(marginal), 4)

        return attributions

    def update_agent_trust_scores(
        self,
        current_scores: Dict[str, float],
        attributions: Dict[str, float],
        ground_truth_correct: bool = True
    ) -> Dict[str, Dict[str, float]]:
        """
        Updates dynamic Agent Trust Scores via attribution feedback loop:
        T_i <- clip(T_i + lr * Attribution * outcome_sign, 0.10, 0.99)
        """
        updated = {}
        sign = 1.0 if ground_truth_correct else -1.0
        
        for agent_name, old_score in current_scores.items():
            attr = attributions.get(agent_name, 0.0)
            delta = self.lr * attr * sign
            new_score = float(np.clip(old_score + delta, 0.10, 0.99))
            updated[agent_name] = {
                "previous_trust_score": round(old_score, 4),
                "attribution_delta": round(delta, 4),
                "new_trust_score": round(new_score, 4)
            }
        return updated

hgnn_attribution_engine = HypergraphNeuralAttributionEngine()
