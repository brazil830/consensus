"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTaskSchema = exports.tasksTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.tasksTable = (0, pg_core_1.pgTable)("tasks", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    command: (0, pg_core_1.text)("command").notNull(),
    context: (0, pg_core_1.text)("context").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pending"),
    routingPath: (0, pg_core_1.text)("routing_path").notNull().default("cognitive_debate"),
    urgencyScore: (0, pg_core_1.real)("urgency_score").notNull().default(0),
    finalAction: (0, pg_core_1.text)("final_action"),
    consensusScore: (0, pg_core_1.real)("consensus_score"),
    overrideAction: (0, pg_core_1.text)("override_action"),
    overrideRationale: (0, pg_core_1.text)("override_rationale"),
    executionTimeMs: (0, pg_core_1.integer)("execution_time_ms"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
exports.insertTaskSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tasksTable).omit({ id: true, createdAt: true, updatedAt: true });
//# sourceMappingURL=tasks.js.map