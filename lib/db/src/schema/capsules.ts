import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const capsulesTable = pgTable("capsules", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  blockHash: text("block_hash").notNull(),
  previousHash: text("previous_hash").notNull(),
  blockIndex: integer("block_index").notNull(),
  payload: text("payload"),
  verified: boolean("verified").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCapsuleSchema = createInsertSchema(capsulesTable).omit({ id: true, createdAt: true });
export type InsertCapsule = z.infer<typeof insertCapsuleSchema>;
export type Capsule = typeof capsulesTable.$inferSelect;
