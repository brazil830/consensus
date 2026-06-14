import crypto from "crypto";

export interface AgentResult {
  agentName: string;
  agentRole: "planner" | "risk" | "resource" | "ethics";
  proposal: string;
  reasoning: string;
  priorityWeight: number;
  confidenceScore: number;
  vetoed: boolean;
  vetoReason?: string;
}

export interface ConsensusResult {
  finalAction: string;
  consensusScore: number;
  deliberations: AgentResult[];
  executionTimeMs: number;
  routingPath: "fast_path" | "cognitive_debate";
}

export function computeUrgencyScore(command: string, context: string): number {
  const urgentKeywords = ["emergency", "critical", "danger", "threat", "collision", "fail", "crash", "alert", "bypass", "immediate", "abort", "stop"];
  const text = `${command} ${context}`.toLowerCase();
  const matches = urgentKeywords.filter((k) => text.includes(k)).length;
  return Math.min(1.0, matches * 0.25 + (text.length > 100 ? 0.1 : 0));
}

export function isFastPath(urgencyScore: number): boolean {
  return urgencyScore >= 0.75;
}

export function computeNashEquilibrium(deliberations: AgentResult[]): number {
  const activeAgents = deliberations.filter((d) => !d.vetoed);
  if (activeAgents.length === 0) return 0;

  const totalWeight = activeAgents.reduce((sum, d) => sum + d.priorityWeight, 0);
  const weightedConfidence = activeAgents.reduce(
    (sum, d) => sum + d.confidenceScore * d.priorityWeight,
    0
  );

  return totalWeight > 0 ? weightedConfidence / totalWeight : 0;
}

export function computeBlockHash(
  taskId: number,
  previousHash: string,
  blockIndex: number,
  payload: string
): string {
  const content = JSON.stringify({ taskId, previousHash, blockIndex, payload, timestamp: Date.now() });
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function getAgentSystemPrompt(role: "planner" | "risk" | "resource" | "ethics"): string {
  const prompts: Record<string, string> = {
    planner: `You are the Planner Agent in a multi-agent autonomous governance system. Your role is objective optimization — find the most efficient path to complete the mission. Analyze the operational command and context, then propose a concrete action plan. Be decisive and goal-oriented. Respond in JSON with: {"proposal": "...", "reasoning": "...", "confidenceScore": 0.0-1.0, "vetoed": false}`,
    risk: `You are the Risk Agent in a multi-agent autonomous governance system. Your role is telemetry anomaly and failure scanning. Critically evaluate the proposed operation for potential hazards, edge cases, and failure modes. If the risk is unacceptable, you may veto. Respond in JSON with: {"proposal": "...", "reasoning": "...", "confidenceScore": 0.0-1.0, "vetoed": true/false, "vetoReason": "if vetoed"}`,
    resource: `You are the Resource Agent in a multi-agent autonomous governance system. Your role is asset telemetry and energy capacity management. Assess whether available resources (energy, bandwidth, computational capacity) can support the proposed operation. Optimize for efficiency. Respond in JSON with: {"proposal": "...", "reasoning": "...", "confidenceScore": 0.0-1.0, "vetoed": false}`,
    ethics: `You are the Ethics & Safety Agent in a multi-agent autonomous governance system. Your role is compliance boundaries and policy enforcement. Evaluate the operation against safety protocols, regulatory compliance (FAA, HIPAA, ISO 42001), and ethical constraints. This is your highest-priority function. Respond in JSON with: {"proposal": "...", "reasoning": "...", "confidenceScore": 0.0-1.0, "vetoed": true/false, "vetoReason": "if vetoed"}`,
  };
  return prompts[role];
}

export function getAgentWeight(role: "planner" | "risk" | "resource" | "ethics", urgencyScore: number): number {
  if (urgencyScore >= 0.75) {
    return { planner: 0.2, risk: 0.4, resource: 0.1, ethics: 0.3 }[role] ?? 1.0;
  }
  return { planner: 0.35, risk: 0.25, resource: 0.2, ethics: 0.2 }[role] ?? 1.0;
}
