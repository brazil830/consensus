import { pgTable, text, serial, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  command: text("command").notNull(),
  context: text("context").notNull(),
  status: text("status").notNull().default("pending"),
  routingPath: text("routing_path").notNull().default("cognitive_debate"),
  urgencyScore: real("urgency_score").notNull().default(0),
  finalAction: text("final_action"),
  consensusScore: real("consensus_score"),
  overrideAction: text("override_action"),
  overrideRationale: text("override_rationale"),
  executionTimeMs: integer("execution_time_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
