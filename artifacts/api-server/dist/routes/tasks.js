"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("@workspace/db");
const db_2 = require("@workspace/db");
const drizzle_orm_1 = require("drizzle-orm");
const api_zod_1 = require("@workspace/api-zod");
const openai_1 = require("../lib/openai");
const consensus_1 = require("../lib/consensus");
const logger_1 = require("../lib/logger");
const router = (0, express_1.Router)();
router.get("/tasks", async (req, res) => {
    const tasks = await db_1.db.select().from(db_2.tasksTable).orderBy((0, drizzle_orm_1.desc)(db_2.tasksTable.createdAt)).limit(100);
    res.json(api_zod_1.ListTasksResponse.parse(tasks.map(serializeTask)));
});
router.get("/tasks/:id", async (req, res) => {
    const params = api_zod_1.GetTaskParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [task] = await db_1.db.select().from(db_2.tasksTable).where((0, drizzle_orm_1.eq)(db_2.tasksTable.id, params.data.id));
    if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    res.json(api_zod_1.GetTaskResponse.parse(serializeTask(task)));
});
router.post("/tasks", async (req, res) => {
    const parsed = api_zod_1.CreateTaskBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const { command, context, urgencyLevel } = parsed.data;
    const startTime = Date.now();
    const urgencyScore = urgencyLevel === "critical" ? 1.0
        : urgencyLevel === "high" ? 0.8
            : urgencyLevel === "medium" ? 0.5
                : urgencyLevel === "low" ? 0.2
                    : (0, consensus_1.computeUrgencyScore)(command, context);
    const routingPath = (0, consensus_1.isFastPath)(urgencyScore) ? "fast_path" : "cognitive_debate";
    const [task] = await db_1.db.insert(db_2.tasksTable).values({
        command,
        context,
        status: "pending",
        routingPath,
        urgencyScore,
    }).returning();
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Task-Id", String(task.id));
    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    try {
        if (routingPath === "fast_path") {
            sendEvent({ type: "routing", routingPath: "fast_path", urgencyScore, taskId: task.id });
            sendEvent({ type: "fast_path_action", message: "DETERMINISTIC BYPASS ENGAGED — Sub-15ms hardware override triggered. LLM pipeline bypassed for immediate safety response." });
            const fastAction = `FAST-PATH EXECUTED: Emergency deterministic override activated. Immediate safety protocol enforced for: "${command}". Hardware bypass complete.`;
            await db_1.db.update(db_2.tasksTable).set({
                status: "completed",
                finalAction: fastAction,
                executionTimeMs: Date.now() - startTime,
            }).where((0, drizzle_orm_1.eq)(db_2.tasksTable.id, task.id));
            await writeCapsule(task.id, fastAction);
            sendEvent({ type: "complete", taskId: task.id, finalAction: fastAction });
        }
        else {
            sendEvent({ type: "routing", routingPath: "cognitive_debate", urgencyScore, taskId: task.id });
            await db_1.db.update(db_2.tasksTable).set({ status: "debating" }).where((0, drizzle_orm_1.eq)(db_2.tasksTable.id, task.id));
            const agents = [
                { name: "ATLAS-Planner", role: "planner" },
                { name: "SENTINEL-Risk", role: "risk" },
                { name: "NEXUS-Resource", role: "resource" },
                { name: "AEGIS-Ethics", role: "ethics" },
            ];
            const agentPromises = agents.map(async (agent) => {
                sendEvent({ type: "agent_start", agentName: agent.name, agentRole: agent.role });
                let fullResponse = "";
                try {
                    const stream = await openai_1.openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        max_tokens: 400,
                        messages: [
                            { role: "system", content: (0, consensus_1.getAgentSystemPrompt)(agent.role) },
                            { role: "user", content: `OPERATIONAL COMMAND: ${command}\n\nCONTEXT: ${context}\n\nURGENCY SCORE: ${urgencyScore.toFixed(2)}\n\nProvide your analysis as JSON.` },
                        ],
                        response_format: {
                            type: "json_schema",
                            json_schema: {
                                name: "agent_analysis",
                                schema: {
                                    type: "object",
                                    properties: {
                                        proposal: { type: "string" },
                                        reasoning: { type: "string" },
                                        confidenceScore: { type: "number" },
                                        vetoed: { type: "boolean" },
                                        vetoReason: { type: "string" }
                                    },
                                    required: ["proposal", "reasoning", "confidenceScore", "vetoed"],
                                    additionalProperties: false
                                }
                            }
                        },
                        stream: true,
                    });
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            fullResponse += content;
                            sendEvent({ type: "agent_token", agentName: agent.name, agentRole: agent.role, token: content });
                        }
                    }
                }
                catch (aiErr) {
                    logger_1.logger.error({ err: aiErr, agentName: agent.name }, "Agent AI call failed, using fallback");
                    fullResponse = JSON.stringify({
                        proposal: `${agent.name} recommends proceeding with standard operational protocol for: "${command}"`,
                        reasoning: "AI inference unavailable — applying default operational heuristics.",
                        confidenceScore: 0.6,
                        vetoed: false,
                    });
                }
                let parsed = {};
                try {
                    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch)
                        parsed = JSON.parse(jsonMatch[0]);
                }
                catch {
                    parsed = {};
                }
                const weight = (0, consensus_1.getAgentWeight)(agent.role, urgencyScore);
                const deliberation = {
                    agentName: agent.name,
                    agentRole: agent.role,
                    proposal: String(parsed.proposal ?? `Standard operational recommendation from ${agent.name}`),
                    reasoning: String(parsed.reasoning ?? "Analysis complete"),
                    priorityWeight: weight,
                    confidenceScore: Number(parsed.confidenceScore ?? 0.7),
                    vetoed: Boolean(parsed.vetoed ?? false),
                    vetoReason: parsed.vetoReason ? String(parsed.vetoReason) : undefined,
                };
                await db_1.db.insert(db_2.deliberationsTable).values({
                    taskId: task.id,
                    agentName: deliberation.agentName,
                    agentRole: deliberation.agentRole,
                    proposal: deliberation.proposal,
                    reasoning: deliberation.reasoning,
                    priorityWeight: deliberation.priorityWeight,
                    vetoed: deliberation.vetoed,
                    vetoReason: deliberation.vetoReason ?? null,
                    confidenceScore: deliberation.confidenceScore,
                });
                sendEvent({
                    type: "agent_complete",
                    agentName: agent.name,
                    agentRole: agent.role,
                    proposal: deliberation.proposal,
                    confidenceScore: deliberation.confidenceScore,
                    vetoed: deliberation.vetoed,
                });
                return deliberation;
            });
            const deliberations = await Promise.all(agentPromises);
            const vetoedDeliberations = deliberations.filter((d) => d.vetoed);
            const anyVetoed = vetoedDeliberations.length > 0;
            let finalAction = "";
            let status = "completed";
            let consensusScore = 0;
            if (anyVetoed) {
                status = "failed";
                const vetoInfo = vetoedDeliberations
                    .map((d) => `${d.agentName} (${d.agentRole}) vetoed [Reason: ${d.vetoReason ?? "No reason provided"}]`)
                    .join("; ");
                finalAction = `CRITICAL DEBATE VETOED: Safety/Policy breach flagged. Details: ${vetoInfo}`;
                consensusScore = 0;
            }
            else {
                consensusScore = (0, consensus_1.computeNashEquilibrium)(deliberations);
                const activeDeliberations = deliberations.filter((d) => !d.vetoed);
                finalAction = activeDeliberations.length > 0
                    ? activeDeliberations.sort((a, b) => b.priorityWeight * b.confidenceScore - a.priorityWeight * a.confidenceScore)[0].proposal
                    : "DEADLOCK RESOLVED: Safety fallback protocol activated — maintain current state pending human operator review.";
            }
            const executionTimeMs = Date.now() - startTime;
            await db_1.db.update(db_2.tasksTable).set({
                status,
                finalAction,
                consensusScore,
                executionTimeMs,
            }).where((0, drizzle_orm_1.eq)(db_2.tasksTable.id, task.id));
            await writeCapsule(task.id, finalAction);
            sendEvent({ type: "consensus", consensusScore, finalAction });
            sendEvent({ type: "complete", taskId: task.id, finalAction });
        }
    }
    catch (err) {
        logger_1.logger.error({ err, taskId: task.id }, "Task execution error");
        await db_1.db.update(db_2.tasksTable).set({ status: "failed" }).where((0, drizzle_orm_1.eq)(db_2.tasksTable.id, task.id));
        sendEvent({ type: "error", message: "Task execution failed" });
    }
    res.end();
});
router.post("/tasks/:id/override", async (req, res) => {
    const params = api_zod_1.OverrideTaskParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const parsed = api_zod_1.OverrideTaskBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.message });
        return;
    }
    const [task] = await db_1.db.select().from(db_2.tasksTable).where((0, drizzle_orm_1.eq)(db_2.tasksTable.id, params.data.id));
    if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    const [updated] = await db_1.db.update(db_2.tasksTable).set({
        status: "overridden",
        overrideAction: parsed.data.action,
        overrideRationale: parsed.data.rationale,
    }).where((0, drizzle_orm_1.eq)(db_2.tasksTable.id, params.data.id)).returning();
    res.json(api_zod_1.GetTaskResponse.parse(serializeTask(updated)));
});
router.get("/tasks/:id/deliberations", async (req, res) => {
    const params = api_zod_1.GetTaskDeliberationsParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const deliberations = await db_1.db.select().from(db_2.deliberationsTable)
        .where((0, drizzle_orm_1.eq)(db_2.deliberationsTable.taskId, params.data.id))
        .orderBy(db_2.deliberationsTable.createdAt);
    res.json(api_zod_1.GetTaskDeliberationsResponse.parse(deliberations.map(serializeDeliberation)));
});
router.get("/tasks/:id/capsule", async (req, res) => {
    const params = api_zod_1.GetTaskCapsuleParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [capsule] = await db_1.db.select().from(db_2.capsulesTable).where((0, drizzle_orm_1.eq)(db_2.capsulesTable.taskId, params.data.id));
    if (!capsule) {
        res.status(404).json({ error: "Capsule not found" });
        return;
    }
    res.json(api_zod_1.GetTaskCapsuleResponse.parse(serializeCapsule(capsule)));
});
router.get("/tasks/:id/audit-export", async (req, res) => {
    const params = api_zod_1.ExportAuditLogParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
    if (!params.success) {
        res.status(400).json({ error: params.error.message });
        return;
    }
    const [task] = await db_1.db.select().from(db_2.tasksTable).where((0, drizzle_orm_1.eq)(db_2.tasksTable.id, params.data.id));
    if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
    }
    const deliberations = await db_1.db.select().from(db_2.deliberationsTable)
        .where((0, drizzle_orm_1.eq)(db_2.deliberationsTable.taskId, params.data.id))
        .orderBy(db_2.deliberationsTable.createdAt);
    const [capsule] = await db_1.db.select().from(db_2.capsulesTable).where((0, drizzle_orm_1.eq)(db_2.capsulesTable.taskId, params.data.id));
    const allCapsules = await db_1.db.select().from(db_2.capsulesTable).orderBy(db_2.capsulesTable.blockIndex);
    const chainValid = verifyCapsuleChain(allCapsules);
    const export_ = {
        "@context": "https://consensusai.io/audit/v1",
        taskId: task.id,
        command: task.command,
        finalAction: task.finalAction ?? "N/A",
        capsule: capsule ? serializeCapsule(capsule) : null,
        deliberations: deliberations.map(serializeDeliberation),
        chainValid,
    };
    res.json(api_zod_1.ExportAuditLogResponse.parse(export_));
});
async function writeCapsule(taskId, finalAction) {
    const prevCapsules = await db_1.db.select().from(db_2.capsulesTable).orderBy((0, drizzle_orm_1.desc)(db_2.capsulesTable.blockIndex)).limit(1);
    const blockIndex = prevCapsules.length > 0 ? prevCapsules[0].blockIndex + 1 : 0;
    const previousHash = prevCapsules.length > 0 ? prevCapsules[0].blockHash : "0".repeat(64);
    const payload = JSON.stringify({ taskId, finalAction, timestamp: new Date().toISOString() });
    const blockHash = (0, consensus_1.computeBlockHash)(taskId, previousHash, blockIndex, payload);
    await db_1.db.insert(db_2.capsulesTable).values({
        taskId,
        blockHash,
        previousHash,
        blockIndex,
        payload,
        verified: true,
    });
}
function verifyCapsuleChain(capsules) {
    if (capsules.length === 0)
        return true;
    for (let i = 1; i < capsules.length; i++) {
        if (capsules[i].previousHash !== capsules[i - 1].blockHash)
            return false;
    }
    return true;
}
function serializeTask(task) {
    return {
        ...task,
        urgencyScore: task.urgencyScore ?? 0,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
    };
}
function serializeDeliberation(d) {
    return {
        ...d,
        priorityWeight: d.priorityWeight ?? 1.0,
        confidenceScore: d.confidenceScore ?? 0.5,
        vetoed: d.vetoed ?? false,
        createdAt: d.createdAt.toISOString(),
    };
}
function serializeCapsule(c) {
    return {
        ...c,
        verified: c.verified ?? true,
        createdAt: c.createdAt.toISOString(),
    };
}
exports.default = router;
//# sourceMappingURL=tasks.js.map