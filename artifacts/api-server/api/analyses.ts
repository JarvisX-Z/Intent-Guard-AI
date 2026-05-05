import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { desc, sql } from "drizzle-orm";
import { z } from "zod";

const { Pool } = pg;

const analysesTable = pgTable("analyses", {
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

const QueryParams = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

function getDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL environment variable is required");
  const pool = new Pool({ connectionString: url });
  return drizzle(pool, { schema: { analysesTable } });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const parsed = QueryParams.safeParse(req.query);
  const limit = parsed.success ? parsed.data.limit : 10;

  try {
    const db = getDb();

    const rows = await db
      .select()
      .from(analysesTable)
      .orderBy(desc(analysesTable.analyzedAt))
      .limit(limit);

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(analysesTable);

    res.status(200).json({
      analyses: rows.map((r) => ({
        id: r.id,
        transactionSignature: r.transactionSignature,
        userIntent: r.userIntent,
        intentMatch: r.intentMatch,
        riskScore: r.riskScore,
        explanation: r.explanation,
        transactionType: r.transactionType,
        programs: r.programs,
        warnings: r.warnings,
        analyzedAt: r.analyzedAt.toISOString(),
      })),
      total: countRow?.count ?? 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    res.status(500).json({ error: message });
  }
}
