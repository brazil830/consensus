"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDeliberationSchema = exports.deliberationsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.deliberationsTable = (0, pg_core_1.pgTable)("deliberations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    taskId: (0, pg_core_1.integer)("task_id").notNull(),
    agentName: (0, pg_core_1.text)("agent_name").notNull(),
    agentRole: (0, pg_core_1.text)("agent_role").notNull(),
    proposal: (0, pg_core_1.text)("proposal").notNull(),
    reasoning: (0, pg_core_1.text)("reasoning"),
    priorityWeight: (0, pg_core_1.real)("priority_weight").notNull().default(1.0),
    vetoed: (0, pg_core_1.boolean)("vetoed").notNull().default(false),
    vetoReason: (0, pg_core_1.text)("veto_reason"),
    confidenceScore: (0, pg_core_1.real)("confidence_score").notNull().default(0.5),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
});
exports.insertDeliberationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.deliberationsTable).omit({ id: true, createdAt: true });
//# sourceMappingURL=deliberations.js.map