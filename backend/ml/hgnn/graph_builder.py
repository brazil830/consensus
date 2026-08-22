from typing import Dict, List, Any
from ml.hgnn.schemas import GraphNode, GraphEdge

class CausalGraphBuilder:
    def __init__(self):
        self.node_types = ["Agent", "MemoryCapsule", "ContextVariable", "Evidence", "Outcome"]
        self.edge_types = ["PROPOSED", "CITES", "EVALUATED", "PRODUCED"]

    def build_case_graph(
        self,
        case_id: str,
        deliberations: List[Dict[str, Any]],
        capsule_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []

        # 1. Outcome Node
        out_id = f"OUT-{case_id}"
        outcome_val = capsule_data.get('outcome', 'AUTHORIZED') if capsule_data else 'IN_PROGRESS'
        nodes.append({
            'id': out_id,
            'type': 'Outcome',
            'label': f"Outcome: {outcome_val}",
            'weight': 1.0
        })

        # 2. Memory Capsule Node
        cap_id = capsule_data.get('capsule_id', f"MC-{case_id}") if capsule_data else f"MC-{case_id}"
        nodes.append({
            'id': cap_id,
            'type': 'MemoryCapsule',
            'label': f"Capsule Block #{cap_id[:8]}",
            'weight': 0.92
        })
        edges.append({
            'source': cap_id,
            'target': out_id,
            'type': 'PRODUCED',
            'weight': float(capsule_data.get('consensus_confidence', 0.90)) if capsule_data else 0.90
        })

        # 3. Context Variable Nodes
        cv1_id = f"CV-AMOUNT-{case_id}"
        cv2_id = f"CV-REGIME-{case_id}"
        nodes.append({'id': cv1_id, 'type': 'ContextVariable', 'label': 'Transaction Velocity & Amount', 'weight': 0.82})
        nodes.append({'id': cv2_id, 'type': 'ContextVariable', 'label': 'RBI Regulatory Regime', 'weight': 0.88})
        edges.append({'source': cap_id, 'target': cv1_id, 'type': 'EVALUATED', 'weight': 0.82})
        edges.append({'source': cap_id, 'target': cv2_id, 'type': 'EVALUATED', 'weight': 0.88})

        # 4. Specialist Agents & Evidence Nodes
        for idx, delib in enumerate(deliberations):
            agent_name = delib.get('agent_name', f"Agent-{idx}")
            agent_slug = agent_name.replace(' ', '_')
            agent_id = f"AG-{agent_slug}"

            # Agent Node
            if not any(n['id'] == agent_id for n in nodes):
                nodes.append({
                    'id': agent_id,
                    'type': 'Agent',
                    'label': agent_name,
                    'weight': float(delib.get('trust_weight', 0.90))
                })
            
            # Agent -> Capsule PROPOSED Edge
            edges.append({
                'source': agent_id,
                'target': cap_id,
                'type': 'PROPOSED',
                'weight': float(delib.get('confidence', 0.85))
            })

            # Evidence Nodes
            evidence_list = delib.get('evidence_nodes', [])
            if not evidence_list:
                evidence_list = [f"Evidence E-{idx+101}"]

            for evd_name in evidence_list:
                evd_id = f"EVD-{str(evd_name).replace(' ', '_')}"
                if not any(n['id'] == evd_id for n in nodes):
                    nodes.append({
                        'id': evd_id,
                        'type': 'Evidence',
                        'label': f"Evidence: {evd_name}",
                        'weight': 0.86
                    })
                edges.append({
                    'source': cap_id,
                    'target': evd_id,
                    'type': 'CITES',
                    'weight': 0.86
                })

        return {
            'case_id': case_id,
            'nodes': nodes,
            'edges': edges
        }

graph_builder = CausalGraphBuilder()
