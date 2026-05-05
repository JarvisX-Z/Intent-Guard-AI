import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Connection, type ParsedTransactionWithMeta } from "@solana/web3.js";
import OpenAI from "openai";
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

const AnalyzeBody = z.object({
  transaction: z.string().min(10, "Transaction signature is too short"),
  userIntent: z.string().min(10, "Intent must be at least 10 characters"),
  rpcUrl: z.string().url().optional(),
});

const KNOWN_PROGRAMS: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "SPL Token Program",
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bxm: "Associated Token Account",
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin": "Serum DEX v3",
  whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc: "Orca Whirlpool",
  JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB: "Jupiter v4",
  JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: "Jupiter v6",
  MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2pgJqC: "Mercurial Finance",
  srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX: "Serum DEX v4",
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8": "Raydium AMM",
  "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP": "Orca v1",
};

function identifyPrograms(programIds: string[]): string[] {
  return programIds.map((id) => KNOWN_PROGRAMS[id] ?? id);
}

function sanitizeInput(input: string): string {
  return input.trim().slice(0, 2000);
}

async function fetchTransaction(
  signature: string,
  rpcUrl: string
): Promise<ParsedTransactionWithMeta | null> {
  const connection = new Connection(rpcUrl, "confirmed");
  return connection.getParsedTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
}

function extractTransactionDetails(tx: ParsedTransactionWithMeta) {
  const message = tx.transaction.message;
  const accountKeys = message.accountKeys.map((k) =>
    typeof k === "string" ? k : k.pubkey.toString()
  );

  const programIds = new Set<string>();
  if ("instructions" in message) {
    for (const ix of message.instructions) {
      if ("programId" in ix) {
        programIds.add(ix.programId.toString());
      }
    }
  }

  return {
    programIds: Array.from(programIds),
    accountKeys,
    instructionCount: message.instructions.length,
    preBalances: tx.meta?.preBalances ?? [],
    postBalances: tx.meta?.postBalances ?? [],
    fee: tx.meta?.fee ?? 0,
    error: tx.meta?.err !== null && tx.meta?.err !== undefined,
  };
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 10;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function getDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL environment variable is required");
  const pool = new Pool({ connectionString: url });
  return drizzle(pool, { schema: { analysesTable } });
}

function getOpenAI(): OpenAI {
  const apiKey =
    process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ??
    process.env["OPENAI_API_KEY"];
  const baseURL =
    process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] ?? undefined;
  if (!apiKey) {
    throw new Error(
      "An OpenAI API key is required. Set OPENAI_API_KEY (or AI_INTEGRATIONS_OPENAI_API_KEY) in your environment variables."
    );
  }
  return new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const ip = (
    (req.headers["x-forwarded-for"] as string | undefined) ??
    (req.socket?.remoteAddress ?? "unknown")
  )
    .split(",")[0]
    .trim()
    .slice(0, 64);

  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Rate limit exceeded. Try again in a minute." });
    return;
  }

  const parsed = AnalyzeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid input",
      details: parsed.error.issues.map((issue) => issue.message).join("; "),
    });
    return;
  }

  const { transaction, userIntent, rpcUrl } = parsed.data;
  const safeSignature = sanitizeInput(transaction);
  const safeIntent = sanitizeInput(userIntent);
  const rpc =
    rpcUrl != null
      ? sanitizeInput(rpcUrl)
      : (process.env["SOLANA_RPC_URL"] ?? "https://api.mainnet-beta.solana.com");

  let txDetails: ReturnType<typeof extractTransactionDetails> | null = null;
  let transactionType = "Unknown";
  let programs: string[] = [];

  try {
    const txData = await fetchTransaction(safeSignature, rpc);
    if (!txData) {
      res.status(400).json({
        error: "Transaction not found",
        details:
          "Could not find this transaction on the Solana network. Make sure the signature is correct.",
      });
      return;
    }
    txDetails = extractTransactionDetails(txData);
    programs = identifyPrograms(txDetails.programIds);

    if (
      programs.some((p) =>
        ["Jupiter", "Raydium", "Orca", "Serum"].some((d) => p.includes(d))
      )
    ) {
      transactionType = "Token Swap / DEX";
    } else if (programs.some((p) => p.includes("SPL Token"))) {
      transactionType = "Token Transfer";
    } else if (programs.includes("System Program")) {
      transactionType = "SOL Transfer";
    } else if (programs.some((p) => p.includes("Associated Token"))) {
      transactionType = "Token Account Operation";
    } else {
      transactionType = "Smart Contract Interaction";
    }
  } catch {
    // Transaction fetch failed — AI will analyse based on intent alone
  }

  const structuredData =
    txDetails != null
      ? {
          signature: safeSignature,
          transactionType,
          programs,
          instructionCount: txDetails.instructionCount,
          fee: txDetails.fee,
          error: txDetails.error,
          accountCount: txDetails.accountKeys.length,
          balanceChanges: txDetails.preBalances.map((pre, i) => ({
            account: (txDetails!.accountKeys[i] ?? "").slice(0, 16) + "...",
            changeLamports: (txDetails!.postBalances[i] ?? 0) - pre,
          })),
        }
      : {
          signature: safeSignature,
          note: "Transaction data unavailable — analysis based on intent only",
        };

  const systemPrompt = `You are a Solana blockchain security expert. Analyze the provided transaction data against the user's stated intent.

Your job:
1. Determine if the transaction matches what the user says they want to do
2. Calculate a risk score from 0 (completely safe) to 100 (highly dangerous)
3. Provide a clear, jargon-free explanation for a non-technical user

Risk scoring guidelines:
- 0-20: Transaction clearly matches intent, no warnings
- 21-40: Minor differences, likely safe but note discrepancies
- 41-60: Significant mismatch or unknown programs involved
- 61-80: Transaction behaves differently than stated, caution advised
- 81-100: Clear mismatch or red flags indicating potential fraud/malicious activity

Known safe programs: System Program, SPL Token Program, Associated Token Account, Jupiter, Raydium, Orca, Serum, Mercurial.

Respond ONLY with valid JSON in this exact format:
{
  "intentMatch": true or false,
  "riskScore": number 0-100,
  "explanation": "Plain English explanation for a non-technical user (2-3 sentences)",
  "warnings": ["specific warning 1", "specific warning 2"]
}`;

  const userMessage = `User's stated intent: "${safeIntent}"\n\nTransaction data:\n${JSON.stringify(structuredData, null, 2)}`;

  let intentMatch = false;
  let riskScore = 50;
  let explanation = "Analysis could not be completed.";
  let warnings: string[] = [];

  try {
    const openai = getOpenAI();
    const aiResponse = await openai.chat.completions.create({
      model: process.env["OPENAI_MODEL"] ?? "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const content = aiResponse.choices[0]?.message?.content ?? "{}";
    const aiResult = JSON.parse(content) as {
      intentMatch?: boolean;
      riskScore?: number;
      explanation?: string;
      warnings?: string[];
    };

    intentMatch =
      typeof aiResult.intentMatch === "boolean" ? aiResult.intentMatch : false;
    riskScore =
      typeof aiResult.riskScore === "number"
        ? Math.max(0, Math.min(100, Math.round(aiResult.riskScore)))
        : 50;
    explanation =
      typeof aiResult.explanation === "string"
        ? aiResult.explanation
        : "Analysis unavailable.";
    warnings = Array.isArray(aiResult.warnings)
      ? aiResult.warnings.filter((w): w is string => typeof w === "string")
      : [];
  } catch {
    riskScore = 50;
    explanation = "AI analysis is temporarily unavailable. Please try again.";
  }

  if (txDetails?.error === true) {
    warnings.push("This transaction failed on-chain.");
    riskScore = Math.min(100, riskScore + 20);
  }

  try {
    const db = getDb();
    const [saved] = await db
      .insert(analysesTable)
      .values({
        transactionSignature: safeSignature,
        userIntent: safeIntent,
        intentMatch,
        riskScore,
        explanation,
        transactionType,
        programs,
        warnings,
        rawTransaction: structuredData as Record<string, unknown>,
      })
      .returning();

    if (!saved) {
      res.status(500).json({ error: "Failed to save analysis" });
      return;
    }

    res.status(200).json({
      id: saved.id,
      transactionSignature: saved.transactionSignature,
      userIntent: saved.userIntent,
      intentMatch: saved.intentMatch,
      riskScore: saved.riskScore,
      explanation: saved.explanation,
      transactionType: saved.transactionType,
      programs: saved.programs,
      warnings: saved.warnings,
      analyzedAt: saved.analyzedAt.toISOString(),
    });
  } catch {
    res.status(200).json({
      id: 0,
      transactionSignature: safeSignature,
      userIntent: safeIntent,
      intentMatch,
      riskScore,
      explanation,
      transactionType,
      programs,
      warnings,
      analyzedAt: new Date().toISOString(),
    });
  }
}
