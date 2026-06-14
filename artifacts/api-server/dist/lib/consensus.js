"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeUrgencyScore = computeUrgencyScore;
exports.isFastPath = isFastPath;
exports.computeNashEquilibrium = computeNashEquilibrium;
exports.computeBlockHash = computeBlockHash;
exports.getAgentSystemPrompt = getAgentSystemPrompt;
exports.getAgentWeight = getAgentWeight;
const crypto_1 = __importDefault(require("crypto"));
function computeUrgencyScore(command, context) {
    const urgentKeywords = ["emergency", "critical", "danger", "threat", "collision", "fail", "crash", "alert", "bypass", "immediate", "abort", "stop"];
    const text = `${command} ${context}`.toLowerCase();
    const matches = urgentKeywords.filter((k) => text.includes(k)).length;
    return Math.min(1.0, matches * 0.25 + (text.length > 100 ? 0.1 : 0));
}
function isFastPath(urgencyScore) {
    return urgencyScore >= 0.75;
}
function computeNashEquilibrium(deliberations) {
    const activeAgents = deliberations.filter((d) => !d.vetoed);
    if (activeAgents.length === 0)
        return 0;
    const totalWeight = activeAgents.reduce((sum, d) => sum + d.priorityWeight, 0);
    const weightedConfidence = activeAgents.reduce((sum, d) => sum + d.confidenceScore * d.priorityWeight, 0);
    return totalWeight > 0 ? weightedConfidence / totalWeight : 0;
}
function computeBlockHash(taskId, previousHash, blockIndex, payload) {
    const content = JSON.stringify({ taskId, previousHash, blockIndex, payload, timestamp: Date.now() });
    return crypto_1.default.createHash("sha256").update(content).digest("hex");
}
function getAgentSystemPrompt(role) {
    const prompts = {
        planner: `You are the Planner Agent in a multi-agent autonomous governance system. Your role is objective optimization — find the most efficient path to complete the mission. Analyze the operational command and context, then propose a concrete action plan. Be decisive and goal-oriented. Respond in JSON with: {"proposal": "...", "reasoning": "...", "confidenceScore": 0.0-1.0, "vetoed": false}`,
        risk: `You are the Risk Agent in a multi-agent autonomous governance system. Your role is telemetry anomaly and failure scanning. Critically evaluate the proposed operation for potential hazards, edge cases, and failure modes. If the risk is unacceptable, you may veto. Respond in JSON with: {"proposal": "...", "reasoning": "...", "confidenceScore": 0.0-1.0, "vetoed": true/false, "vetoReason": "if vetoed"}`,
        resource: `You are the Resource Agent in a multi-agent autonomous governance system. Your role is asset telemetry and energy capacity management. Assess whether available resources (energy, bandwidth, computational capacity) can support the proposed operation. Optimize for efficiency. Respond in JSON with: {"proposal": "...", "reasoning": "...", "confidenceScore": 0.0-1.0, "vetoed": false}`,
        ethics: `You are the Ethics & Safety Agent in a multi-agent autonomous governance system. Your role is compliance boundaries and policy enforcement. Evaluate the operation against safety protocols, regulatory compliance (FAA, HIPAA, ISO 42001), and ethical constraints. This is your highest-priority function. Respond in JSON with: {"proposal": "...", "reasoning": "...", "confidenceScore": 0.0-1.0, "vetoed": true/false, "vetoReason": "if vetoed"}`,
    };
    return prompts[role];
}
function getAgentWeight(role, urgencyScore) {
    if (urgencyScore >= 0.75) {
        return { planner: 0.2, risk: 0.4, resource: 0.1, ethics: 0.3 }[role] ?? 1.0;
    }
    return { planner: 0.35, risk: 0.25, resource: 0.2, ethics: 0.2 }[role] ?? 1.0;
}
//# sourceMappingURL=consensus.js.map