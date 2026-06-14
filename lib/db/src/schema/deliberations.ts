import { pgTable, text, serial, timestamp, real, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const deliberationsTable = pgTable("deliberations", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  agentName: text("agent_name").notNull(),
  agentRole: text("agent_role").notNull(),
  proposal: text("proposal").notNull(),
  reasoning: text("reasoning"),
  priorityWeight: real("priority_weight").notNull().default(1.0),
  vetoed: boolean("vetoed").notNull().default(false),
  vetoReason: text("veto_reason"),
  confidenceScore: real("confidence_score").notNull().default(0.5),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeliberationSchema = createInsertSchema(deliberationsTable).omit({ id: true, createdAt: true });
export type InsertDeliberation = z.infer<typeof insertDeliberationSchema>;
export type Deliberation = typeof deliberationsTable.$inferSelect;
