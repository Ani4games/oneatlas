# OneAtlas — AI Model Discovery & Intelligence Platform

Discover, search, compare and benchmark AI models across labs and inference providers.
Built as a **Full Stack** submission: Next.js (App Router) + TypeScript + Tailwind on the front, Next.js API Routes + Prisma + PostgreSQL on the back.

> Data is an **illustrative sample dataset** (31 models, 12 labs, 12 providers, 6 benchmarks). Specs, prices and scores are approximate demo values, not live data. All of it lives in PostgreSQL and is served through the API — nothing is hardcoded in the UI.

## Features (mapped to the brief)

| Requirement | Where |
|---|---|
| Model discovery & search, filter by lab / provider / capability / type, sort by price / context / release date | `/models` (URL-synced filters, debounced search, pagination) → `GET /api/models` |
| Model detail pages (specs, pricing, modalities, providers, benchmarks) | `/models/[slug]` → `GET /api/models/:slug` |
| Side-by-side comparison (up to 4), best value highlighted | `/compare?models=a,b` → `GET /api/compare` |
| Rankings & leaderboards by benchmark / category / model type | `/rankings` → `GET /api/rankings` |
| AI labs & provider directory with their models | `/labs`, `/labs/[slug]`, `/providers`, `/providers/[slug]` |
| Global search (⌘/Ctrl-K), responsive layout, consistent UI | header `GlobalSearch` → `GET /api/search` |

## Architecture

```
Browser ── React client components (explorer, compare, rankings, search)
   │              │ fetch (AbortController, URL as state)
   ▼              ▼
Next.js App Router ── Server components (home, detail, labs, providers) ─┐
   │                                                                      │
   └─ /api/* route handlers ── zod validation ── services ◄───────────────┘
                                                   │
                                          Prisma 7 + pg adapter
                                                   │
                                              PostgreSQL
```

- **Service layer** (`src/lib/services/*`) holds all queries. API routes and server components both call it, so there is one source of truth and no duplicated query logic.
- **Interactive pages** (explorer, compare, rankings, search) are client components that call the REST API, with the URL as the state container (shareable/back-button-friendly links).
- **Static-ish pages** (detail, labs, providers, home) are server-rendered straight from the service layer — no extra network hop.
- **Uniform API contract**: success `{ data, meta? }`; failure `{ error: { code, message, details? } }` with 400 (validation), 404, 500. See `src/lib/errors.ts`.

### Data model (`prisma/schema.prisma`)

`Lab 1─* Model`, `Model *─* Provider` via **`ProviderModel`** (per-provider price, latency, throughput, uptime), `Model *─* Benchmark` via **`BenchmarkScore`**.
Indexes on filter/sort columns (`type`, `releaseDate`, `inputPrice`, `contextWindow`, `labId`, `(benchmarkId, score)`). Unique constraints on `(modelId, providerId)` and `(modelId, benchmarkId)` keep data consistent. Prices are `Decimal`, nullable for usage-priced (image/audio) models so "price: low → high" never ranks non-token models as free.

### Key technical decisions

- **Prisma 7 + `@prisma/adapter-pg`**: Rust-free client, smaller deploys, works on serverless.
- **zod** at every API boundary; query params are coerced and bounded (`pageSize ≤ 50`, 2–4 models for compare).
- **Rankings**: single benchmark → that score; category/overall → mean of available scores, requiring a model to have ≥ half the selected benchmarks (prevents a model with one lucky score topping "Overall").
- **Search**: case-insensitive `contains` across name/slug/description/lab + capability match. Fine for this scale; the upgrade path is Postgres `pg_trgm`/FTS (see below).
- **Stale-request safety**: every client fetch is aborted on param change; loading/empty/error states are explicit.
- **Accessibility**: labelled controls, `aria-pressed` toggles, combobox/listbox semantics and arrow-key navigation in global search, visible focus rings.

### Known trade-offs / next steps

- Sample data only; ingestion from real sources (OpenRouter/LiteLLM model lists) would be a cron job writing through the same Prisma models, normalising into `ProviderModel`.
- Search → add `pg_trgm` GIN index or Postgres full-text for ranking and typo tolerance.
- Add rate limiting + response caching headers are already set (`s-maxage`), a CDN/ISR layer would follow.
- Tests: services are pure functions over Prisma and would be the first target (Vitest + a test DB).

## Run locally

```bash
npm install
cp .env.example .env                  # set DATABASE_URL (Postgres)
npx prisma migrate deploy             # applies prisma/migrations/0_init  (or: npx prisma db push)
npm run db:seed
npm run dev                           # http://localhost:3000
```

Quick Postgres: `docker run -d -p 5432:5432 -e POSTGRES_USER=oneatlas -e POSTGRES_PASSWORD=oneatlas -e POSTGRES_DB=oneatlas postgres:16`

## Deploy (Neon + Vercel)

1. **Neon**: create a project → copy the pooled connection string.
2. **Apply schema + data once** from your machine:
   `DATABASE_URL="<neon url>" npx prisma migrate deploy && DATABASE_URL="<neon url>" npm run db:seed`
3. **Vercel**: import the GitHub repo → add env var `DATABASE_URL` → Deploy. (`npm run build` runs `prisma generate` first.)
4. Open `/api/health` on the live URL — should return `{"status":"ok","db":"up"}`.

## API reference

| Endpoint | Params |
|---|---|
| `GET /api/models` | `q, lab, provider, type, capability` (comma lists) `open, minContext, maxPrice, sort, page, pageSize` |
| `GET /api/models/:slug` | — |
| `GET /api/compare` | `models=slug1,slug2[,..4]` |
| `GET /api/rankings` | `benchmark \| category, type, limit` |
| `GET /api/labs`, `/api/labs/:slug` | — |
| `GET /api/providers`, `/api/providers/:slug` | — |
| `GET /api/search` | `q` |
| `GET /api/filters` | facets for the explorer |
| `GET /api/health` | DB connectivity check |

`sort` ∈ `release_desc | release_asc | price_asc | price_desc | context_desc | context_asc | name`.
