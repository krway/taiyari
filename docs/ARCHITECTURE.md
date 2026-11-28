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
RLS: public catalog read; authenticated users read/insert/update own profile; selected exam must be available. Explicit grants. No current affairs tables yet.

## Planned modular design
Exam engine: exam configurations, subjects, topics, subtopics and syllabus mappings.
Content engine: sources, articles, translations, publication state, exam relevance, provenance and deduplication.
Practice engine: questions, options, solutions, sources, attempts, mock tests and scoring rules.
Learning engine: concepts, examples, bookmarks, study plans and revision.
AI engine: server-side provider interface, structured outputs, validation, editorial review, rate limits and cost tracking.
Analytics engine: user progress and aggregated performance. Subscription model deferred.

Proposed ingestion flow: official/licensed sources -> normalized records -> deduplicate -> AI draft -> validation/editorial review -> published content -> feed/quiz/social assets. Separate drafts from published content. Store source URLs and publication timestamps; avoid full copyrighted text. Keep quiz answer keys inaccessible to clients until submission. Use ownership RLS for user records and restricted editor/backend writes. These modules are proposals, not implemented services.
