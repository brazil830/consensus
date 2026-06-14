"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCapsuleSchema = exports.capsulesTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
exports.capsulesTable = (0, pg_core_1.pgTable)("capsules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    taskId: (0, pg_core_1.integer)("task_id").notNull(),
    blockHash: (0, pg_core_1.text)("block_hash").notNull(),
    previousHash: (0, pg_core_1.text)("previous_hash").notNull(),
    blockIndex: (0, pg_core_1.integer)("block_index").notNull(),
    payload: (0, pg_core_1.text)("payload"),
    verified: (0, pg_core_1.boolean)("verified").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).notNull().defaultNow(),
});
exports.insertCapsuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.capsulesTable).omit({ id: true, createdAt: true });
//# sourceMappingURL=capsules.js.map