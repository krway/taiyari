# Architecture

## Current stack
Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Node 22, Supabase PostgreSQL/Auth with @supabase/ssr, Render web service. GitHub main is source of truth. AI provider abstraction planned, Gemini first candidate; no AI API configured. No separate backend service currently.

## Runtime
Browser -> Render Next.js pages/server actions -> Supabase Auth and PostgreSQL (RLS).
Google OAuth: /login -> Supabase OAuth authorize -> Google -> Supabase /auth/v1/callback -> app /auth/callback -> exchangeCodeForSession -> /dashboard. Middleware refreshes session cookies; protected dashboard uses auth.getUser(). Keep secrets server-side.

## Repository map
- app/page.tsx: landing page
- app/exams/page.tsx and app/exams/[id]/page.tsx: exam catalog and track placeholders
- app/login/page.tsx and actions.ts: email/password, Google OAuth, logout
- app/auth/callback/route.ts: OAuth callback
- app/dashboard/page.tsx and actions.ts: protected dashboard, selected exam
- lib/exams.ts: static exam catalog (currently duplicated in SQL)
- lib/supabase/server.ts, middleware.ts: SSR client and session refresh
- supabase/migrations/0001_foundation.sql: initial schema
- render.yaml: deployment definition
- docs/index.html: legacy static preview, not production application

## Existing data model
exams(id text PK, name, category, available); seeded rrb-ntpc and rrb-group-d enabled, ssc-cgl and ibps-po disabled.
profiles(id UUID PK references auth.users ON DELETE CASCADE, selected_exam_id FK exams, created_at).
RLS: public catalog read; authenticated users read/insert/update own profile; selected exam must be available. Explicit grants. Current affairs table current_affairs_articles added by 0002 migration: UUID, unique HTTPS source URL, source name, publication date, category, bilingual title/summary/relevance, draft/published status and created_at. RLS published-only reads; no ordinary user writes. Feed route app/current-affairs/page.tsx displays latest 50 published articles. Deployment verification pending.

## Planned modular design
Exam engine: exam configurations, subjects, topics, subtopics and syllabus mappings.
Content engine: sources, articles, translations, publication state, exam relevance, provenance and deduplication.
Practice engine: questions, options, solutions, sources, attempts, mock tests and scoring rules.
Learning engine: concepts, examples, bookmarks, study plans and revision.
AI engine: server-side provider interface, structured outputs, validation, editorial review, rate limits and cost tracking.
Analytics engine: user progress and aggregated performance. Subscription model deferred.

Proposed ingestion flow: official/licensed sources -> normalized records -> deduplicate -> AI draft -> validation/editorial review -> published content -> feed/quiz/social assets. Separate drafts from published content. Store source URLs and publication timestamps; avoid full copyrighted text. Keep quiz answer keys inaccessible to clients until submission. Use ownership RLS for user records and restricted editor/backend writes. These modules are proposals, not implemented services.

## Background processing update (2026-11-28)
Migration 0003 applied: private news_sources and news_ingestion_queue, unique source URL deduplication; PIB, RBI, ISRO registered but disabled pending feed verification. Proposed execution: Supabase Cron -> Edge Functions -> Gemini API -> editorial review -> published articles. Render serves UI only; jobs must not depend on its uptime. Target free quotas, verify before enabling; no paid upgrades. Store run history, bounded retries and errors; keep secrets in server-side secret storage. Proposed collection at 05:00 IST (23:30 UTC previous day), approved publication target 07:00 IST (01:30 UTC). No scheduler or AI integration active yet. Next: verify feeds, implement and test ingestion, then schedule securely. Never auto-publish unreviewed content.

## Verified ingestion runtime

Supabase Cron invokes `public.dispatch_news_ingestion()` via SQL. The function reads the configured Edge endpoint from Vault, stores a hash of a two-minute, single-use dispatch token, and sends the token via pg_net. The Edge handler authenticates the dispatch by atomically consuming the token through a service-role-only RPC. Manual Edge calls may also authenticate with the service-role credential. This function uses application authentication with gateway JWT verification disabled.

A partial unique index permits one running collection at a time. Collection checkpoints per-source candidates, inserts, attempts and errors in a private run table. A later invocation can mark a stale run as interrupted. The private queue uses conflict-ignoring inserts on its unique source URL to make retries safe.

## Practice question bank

Published questions are readable by signed-in students. Solutions live in a separate private table. A security-definer scoring RPC checks that the exam and question are available, writes an ownership-scoped attempt and returns the answer and explanation only after accepting a submission. Attempt IDs make identical retries idempotent. Verified previous-year questions require both a year and a source reference. Test fixtures are isolated from production.
