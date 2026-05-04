import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  transactionSignature: text("transaction_signature").notNull(),
  userIntent: text("user_intent").notNull(),
  intentMatch: boolean("intent_match").notNull(),
  riskScore: integer("risk_score").notNull(),
  explanation: text("explanation").notNull(),
  transactionType: text("transaction_type").notNull(),
  programs: jsonb("programs").$type<string[]>().notNull().default([]),
  warnings: jsonb("warnings").$type<string[]>().notNull().default([]),
  rawTransaction: jsonb("raw_transaction").$type<Record<string, unknown>>(),
  analyzedAt: timestamp("analyzed_at").notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({
  id: true,
  analyzedAt: true,
});

export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
