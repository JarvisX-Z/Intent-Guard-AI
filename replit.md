# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite (IntentGuard AI)
- **AI**: OpenAI (via Replit AI Integrations)
- **Blockchain**: @solana/web3.js

## Application: IntentGuard AI

Pre-transaction intent verification for Solana. Users paste a transaction signature and describe what they intend to do; the backend fetches the transaction, parses its instructions, then uses OpenAI to compare it against the user's stated intent and return a risk score + explanation.

### Features
- Transaction intent analysis via OpenAI GPT
- Solana RPC transaction fetching and instruction parsing
- Risk score (0–100) with animated gauge visualization
- Intent match detection (yes/no)
- Program identification (Jupiter, Raydium, Orca, etc.)
- Analysis history page
- Rate limiting (10 req/min per IP)
- Input sanitization and strict TypeScript

### Routes
- `GET /` — Main analysis UI
- `GET /history` — Past analyses
- `POST /api/analyze` — Analyze a transaction (body: `transaction`, `userIntent`, `rpcUrl?`)
- `GET /api/analyses` — List recent analyses

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI Integrations proxy URL
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integrations key

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
