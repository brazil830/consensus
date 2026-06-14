import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tasksTable, capsulesTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import { GetDashboardStatsResponse, GetRecentActivityResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const tasks = await db.select().from(tasksTable);
  const capsules = await db.select().from(capsulesTable).orderBy(capsulesTable.blockIndex);

  const totalTasks = tasks.length;
  const fastPathCount = tasks.filter((t) => t.routingPath === "fast_path").length;
  const cognitiveDebateCount = tasks.filter((t) => t.routingPath === "cognitive_debate").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const failedCount = tasks.filter((t) => t.status === "failed").length;
  const overriddenCount = tasks.filter((t) => t.status === "overridden").length;

  const tasksWithConsensus = tasks.filter((t) => t.consensusScore != null);
  const avgConsensusScore = tasksWithConsensus.length > 0
    ? tasksWithConsensus.reduce((sum, t) => sum + (t.consensusScore ?? 0), 0) / tasksWithConsensus.length
    : 0;

  const tasksWithTime = tasks.filter((t) => t.executionTimeMs != null);
  const avgExecutionTimeMs = tasksWithTime.length > 0
    ? tasksWithTime.reduce((sum, t) => sum + (t.executionTimeMs ?? 0), 0) / tasksWithTime.length
    : 0;

  const verifiedCapsules = capsules.filter((c) => c.verified).length;
  const chainIntegrityRate = capsules.length > 0 ? verifiedCapsules / capsules.length : 1.0;

  res.json(
    GetDashboardStatsResponse.parse({
      totalTasks,
      fastPathCount,
      cognitiveDebateCount,
      completedCount,
      failedCount,
      overriddenCount,
      avgConsensusScore,
      avgExecutionTimeMs,
      chainIntegrityRate,
    })
  );
});

router.get("/dashboard/recent-activity", async (_req, res): Promise<void> => {
  const tasks = await db
    .select({
      id: tasksTable.id,
      command: tasksTable.command,
      status: tasksTable.status,
      routingPath: tasksTable.routingPath,
      urgencyScore: tasksTable.urgencyScore,
      finalAction: tasksTable.finalAction,
      createdAt: tasksTable.createdAt,
    })
    .from(tasksTable)
    .orderBy(desc(tasksTable.createdAt))
    .limit(20);

  res.json(
    GetRecentActivityResponse.parse(
      tasks.map((t) => ({
        ...t,
        urgencyScore: t.urgencyScore ?? 0,
        createdAt: t.createdAt.toISOString(),
      }))
    )
  );
});

export default router;
