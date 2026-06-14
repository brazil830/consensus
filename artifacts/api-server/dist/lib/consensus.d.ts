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
export declare function computeUrgencyScore(command: string, context: string): number;
export declare function isFastPath(urgencyScore: number): boolean;
export declare function computeNashEquilibrium(deliberations: AgentResult[]): number;
export declare function computeBlockHash(taskId: number, previousHash: string, blockIndex: number, payload: string): string;
export declare function getAgentSystemPrompt(role: "planner" | "risk" | "resource" | "ethics"): string;
export declare function getAgentWeight(role: "planner" | "risk" | "resource" | "ethics", urgencyScore: number): number;
//# sourceMappingURL=consensus.d.ts.map