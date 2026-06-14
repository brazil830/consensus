"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("@workspace/db");
const db_2 = require("@workspace/db");
const drizzle_orm_1 = require("drizzle-orm");
const api_zod_1 = require("@workspace/api-zod");
const router = (0, express_1.Router)();
router.get("/dashboard/stats", async (_req, res) => {
    const tasks = await db_1.db.select().from(db_2.tasksTable);
    const capsules = await db_1.db.select().from(db_2.capsulesTable).orderBy(db_2.capsulesTable.blockIndex);
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
    res.json(api_zod_1.GetDashboardStatsResponse.parse({
        totalTasks,
        fastPathCount,
        cognitiveDebateCount,
        completedCount,
        failedCount,
        overriddenCount,
        avgConsensusScore,
        avgExecutionTimeMs,
        chainIntegrityRate,
    }));
});
router.get("/dashboard/recent-activity", async (_req, res) => {
    const tasks = await db_1.db
        .select({
        id: db_2.tasksTable.id,
        command: db_2.tasksTable.command,
        status: db_2.tasksTable.status,
        routingPath: db_2.tasksTable.routingPath,
        urgencyScore: db_2.tasksTable.urgencyScore,
        finalAction: db_2.tasksTable.finalAction,
        createdAt: db_2.tasksTable.createdAt,
    })
        .from(db_2.tasksTable)
        .orderBy((0, drizzle_orm_1.desc)(db_2.tasksTable.createdAt))
        .limit(20);
    res.json(api_zod_1.GetRecentActivityResponse.parse(tasks.map((t) => ({
        ...t,
        urgencyScore: t.urgencyScore ?? 0,
        createdAt: t.createdAt.toISOString(),
    }))));
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map