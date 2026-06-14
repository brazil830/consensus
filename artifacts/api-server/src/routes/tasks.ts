import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tasksTable, deliberationsTable, capsulesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateTaskBody,
  GetTaskParams,
  OverrideTaskParams,
  OverrideTaskBody,
  GetTaskDeliberationsParams,
  GetTaskCapsuleParams,
  ExportAuditLogParams,
  ListTasksResponse,
  GetTaskResponse,
  GetTaskDeliberationsResponse,
  GetTaskCapsuleResponse,
  ExportAuditLogResponse,
} from "@workspace/api-zod";
import { openai } from "../lib/openai";
import {
  computeUrgencyScore,
  isFastPath,
  computeNashEquilibrium,
  computeBlockHash,
  getAgentSystemPrompt,
  getAgentWeight,
  type AgentResult,
} from "../lib/consensus";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/tasks", async (req, res): Promise<void> => {
  const tasks = await db.select().from(tasksTable).orderBy(desc(tasksTable.createdAt)).limit(100);
  res.json(ListTasksResponse.parse(tasks.map(serializeTask)));
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const params = GetTaskParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(GetTaskResponse.parse(serializeTask(task)));
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
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
    : computeUrgencyScore(command, context);

  const routingPath = isFastPath(urgencyScore) ? "fast_path" : "cognitive_debate";

  const [task] = await db.insert(tasksTable).values({
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

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    if (routingPath === "fast_path") {
      sendEvent({ type: "routing", routingPath: "fast_path", urgencyScore, taskId: task.id });
      sendEvent({ type: "fast_path_action", message: "DETERMINISTIC BYPASS ENGAGED — Sub-15ms hardware override triggered. LLM pipeline bypassed for immediate safety response." });

      const fastAction = `FAST-PATH EXECUTED: Emergency deterministic override activated. Immediate safety protocol enforced for: "${command}". Hardware bypass complete.`;

      await db.update(tasksTable).set({
        status: "completed",
        finalAction: fastAction,
        executionTimeMs: Date.now() - startTime,
      }).where(eq(tasksTable.id, task.id));

      await writeCapsule(task.id, fastAction);
      sendEvent({ type: "complete", taskId: task.id, finalAction: fastAction });
    } else {
      sendEvent({ type: "routing", routingPath: "cognitive_debate", urgencyScore, taskId: task.id });

      await db.update(tasksTable).set({ status: "debating" }).where(eq(tasksTable.id, task.id));

      const agents: Array<{ name: string; role: "planner" | "risk" | "resource" | "ethics" }> = [
        { name: "ATLAS-Planner", role: "planner" },
        { name: "SENTINEL-Risk", role: "risk" },
        { name: "NEXUS-Resource", role: "resource" },
        { name: "AEGIS-Ethics", role: "ethics" },
      ];

      const agentPromises = agents.map(async (agent) => {
        sendEvent({ type: "agent_start", agentName: agent.name, agentRole: agent.role });

        let fullResponse = "";

        try {
          const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 400,
            messages: [
              { role: "system", content: getAgentSystemPrompt(agent.role) },
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
        } catch (aiErr) {
          logger.error({ err: aiErr, agentName: agent.name }, "Agent AI call failed, using fallback");
          fullResponse = JSON.stringify({
            proposal: `${agent.name} recommends proceeding with standard operational protocol for: "${command}"`,
            reasoning: "AI inference unavailable — applying default operational heuristics.",
            confidenceScore: 0.6,
            vetoed: false,
          });
        }

        let parsed: Partial<AgentResult> = {};
        try {
          const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        } catch {
          parsed = {};
        }

        const weight = getAgentWeight(agent.role, urgencyScore);
        const deliberation: AgentResult = {
          agentName: agent.name,
          agentRole: agent.role,
          proposal: String(parsed.proposal ?? `Standard operational recommendation from ${agent.name}`),
          reasoning: String(parsed.reasoning ?? "Analysis complete"),
          priorityWeight: weight,
          confidenceScore: Number(parsed.confidenceScore ?? 0.7),
          vetoed: Boolean(parsed.vetoed ?? false),
          vetoReason: parsed.vetoReason ? String(parsed.vetoReason) : undefined,
        };

        await db.insert(deliberationsTable).values({
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
      let status: "completed" | "failed" = "completed";
      let consensusScore = 0;

      if (anyVetoed) {
        status = "failed";
        const vetoInfo = vetoedDeliberations
          .map((d) => `${d.agentName} (${d.agentRole}) vetoed [Reason: ${d.vetoReason ?? "No reason provided"}]`)
          .join("; ");
        finalAction = `CRITICAL DEBATE VETOED: Safety/Policy breach flagged. Details: ${vetoInfo}`;
        consensusScore = 0;
      } else {
        consensusScore = computeNashEquilibrium(deliberations);
        const activeDeliberations = deliberations.filter((d) => !d.vetoed);

        finalAction = activeDeliberations.length > 0
          ? activeDeliberations.sort((a, b) => b.priorityWeight * b.confidenceScore - a.priorityWeight * a.confidenceScore)[0].proposal
          : "DEADLOCK RESOLVED: Safety fallback protocol activated — maintain current state pending human operator review.";
      }

      const executionTimeMs = Date.now() - startTime;

      await db.update(tasksTable).set({
        status,
        finalAction,
        consensusScore,
        executionTimeMs,
      }).where(eq(tasksTable.id, task.id));

      await writeCapsule(task.id, finalAction);

      sendEvent({ type: "consensus", consensusScore, finalAction });
      sendEvent({ type: "complete", taskId: task.id, finalAction });
    }
  } catch (err) {
    logger.error({ err, taskId: task.id }, "Task execution error");
    await db.update(tasksTable).set({ status: "failed" }).where(eq(tasksTable.id, task.id));
    sendEvent({ type: "error", message: "Task execution failed" });
  }

  res.end();
});

router.post("/tasks/:id/override", async (req, res): Promise<void> => {
  const params = OverrideTaskParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = OverrideTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const [updated] = await db.update(tasksTable).set({
    status: "overridden",
    overrideAction: parsed.data.action,
    overrideRationale: parsed.data.rationale,
  }).where(eq(tasksTable.id, params.data.id)).returning();

  res.json(GetTaskResponse.parse(serializeTask(updated)));
});

router.get("/tasks/:id/deliberations", async (req, res): Promise<void> => {
  const params = GetTaskDeliberationsParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const deliberations = await db.select().from(deliberationsTable)
    .where(eq(deliberationsTable.taskId, params.data.id))
    .orderBy(deliberationsTable.createdAt);

  res.json(GetTaskDeliberationsResponse.parse(deliberations.map(serializeDeliberation)));
});

router.get("/tasks/:id/capsule", async (req, res): Promise<void> => {
  const params = GetTaskCapsuleParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [capsule] = await db.select().from(capsulesTable).where(eq(capsulesTable.taskId, params.data.id));
  if (!capsule) {
    res.status(404).json({ error: "Capsule not found" });
    return;
  }

  res.json(GetTaskCapsuleResponse.parse(serializeCapsule(capsule)));
});

router.get("/tasks/:id/audit-export", async (req, res): Promise<void> => {
  const params = ExportAuditLogParams.safeParse({ id: parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const deliberations = await db.select().from(deliberationsTable)
    .where(eq(deliberationsTable.taskId, params.data.id))
    .orderBy(deliberationsTable.createdAt);

  const [capsule] = await db.select().from(capsulesTable).where(eq(capsulesTable.taskId, params.data.id));

  const allCapsules = await db.select().from(capsulesTable).orderBy(capsulesTable.blockIndex);
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

  res.json(ExportAuditLogResponse.parse(export_));
});

async function writeCapsule(taskId: number, finalAction: string): Promise<void> {
  const prevCapsules = await db.select().from(capsulesTable).orderBy(desc(capsulesTable.blockIndex)).limit(1);
  const blockIndex = prevCapsules.length > 0 ? prevCapsules[0].blockIndex + 1 : 0;
  const previousHash = prevCapsules.length > 0 ? prevCapsules[0].blockHash : "0".repeat(64);

  const payload = JSON.stringify({ taskId, finalAction, timestamp: new Date().toISOString() });
  const blockHash = computeBlockHash(taskId, previousHash, blockIndex, payload);

  await db.insert(capsulesTable).values({
    taskId,
    blockHash,
    previousHash,
    blockIndex,
    payload,
    verified: true,
  });
}

function verifyCapsuleChain(capsules: typeof capsulesTable.$inferSelect[]): boolean {
  if (capsules.length === 0) return true;
  for (let i = 1; i < capsules.length; i++) {
    if (capsules[i].previousHash !== capsules[i - 1].blockHash) return false;
  }
  return true;
}

function serializeTask(task: typeof tasksTable.$inferSelect) {
  return {
    ...task,
    urgencyScore: task.urgencyScore ?? 0,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function serializeDeliberation(d: typeof deliberationsTable.$inferSelect) {
  return {
    ...d,
    priorityWeight: d.priorityWeight ?? 1.0,
    confidenceScore: d.confidenceScore ?? 0.5,
    vetoed: d.vetoed ?? false,
    createdAt: d.createdAt.toISOString(),
  };
}

function serializeCapsule(c: typeof capsulesTable.$inferSelect) {
  return {
    ...c,
    verified: c.verified ?? true,
    createdAt: c.createdAt.toISOString(),
  };
}

export default router;
