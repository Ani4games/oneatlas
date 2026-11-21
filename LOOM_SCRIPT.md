# Loom script (target 7–8 min)

**0:00 – Intro (30s)** Who you are; "I chose the Full Stack role. OneAtlas helps developers discover, compare and evaluate AI models."

**0:30 – Product tour (3 min)** — keep the browser on the live URL
1. Home: global search (type "deep", arrow keys, Enter). Mention ⌘K.
2. `/models`: filter by Lab + capability, sort by price, show URL changing, pagination, clear filters. Mention filters are URL state → shareable.
3. Click a model → specs, benchmarks, provider table (lowest price badge, latency/throughput).
4. Add 3 models via the Compare button → tray → `/compare`: highlighted best values, benchmarks block.
5. `/rankings`: switch Overall → Coding → single benchmark; model-type filter.
6. `/labs` → a lab → its models + where to access them; `/providers/groq`.
7. Resize to mobile: nav menu, filter drawer.

**3:30 – Architecture (2 min)** — show README diagram + `schema.prisma`
- Next.js App Router, TS, Tailwind; API Routes; Prisma 7 + Postgres on Neon; deployed on Vercel.
- Schema: Lab → Model; Model↔Provider via ProviderModel (per-provider price/latency); Model↔Benchmark via BenchmarkScore. Indexes on sort/filter columns.
- Service layer shared by route handlers and server components; zod validation; uniform error shape. Open `/api/models?...` and a 400 example live.

**5:30 – Decisions & trade-offs (1.5 min)**
- Rankings = mean over ≥ half the benchmarks (why).
- Nullable prices for image/audio so sorting is honest.
- Client components for interactive pages, server components for read-only pages.
- Prisma 7 adapter-pg for serverless-friendly, Rust-free client.

**7:00 – Challenges (45s)** Be honest and specific, e.g.: designing the compare/ranking semantics; keeping URL state and fetches in sync without stale responses (AbortController); the Prisma engine download being blocked in my build environment → moved to Prisma 7's engine-free client.

**7:45 – Next steps (15s)** Real data ingestion, pg_trgm search, tests, rate limiting.

> Be ready to explain: any file the interviewer opens. Read `src/lib/services/models.ts` and `rankings.ts` twice.
