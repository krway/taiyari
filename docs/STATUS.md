# Status — 2026-11-28

## Implemented
- Public GitHub repository krway/taiyari, main branch.
- Next.js shell, landing page, exam catalog and track placeholders.
- Render free web service deployed; latest previously verified application build live, lint/typecheck passed.
- Supabase project created, foundation migration applied, four exam seed rows verified. Earlier security advisor returned no lints (not a full audit).
- Email/password and Google OAuth code, session middleware, protected dashboard, exam selection and logout implemented.
- Supabase production Site URL and callback allowlist saved successfully.
- Google login reported working by owner after manual provider setup; no independent end-to-end test by agent.
- Phase 2 architecture document committed (29f50c848b82ae95c3229adbf006fcb31c898562).

## Not yet verified
Email signup/confirmation, logout, profile persistence, multi-user isolation and exact Google provider/consent settings after owner's manual changes. Verify without exposing credentials. Previous OAuth browser automation had loading/sign-in issues; do not assume it completed configuration.

## Pending
Phase 2.2: schema applied and RLS enabled; feed route and dashboard navigation committed. Build/deployment and role-based tests pending. No news ingestion, AI summaries, quizzes, bookmarks, analytics or scheduling implemented. Later phases in ROADMAP.md.

## Known issues / technical debt
Render free tier cold starts; previous auto-deploy did not reliably trigger, verify deployed commit. Earlier build warned of missing SWC lockfile dependencies and npm reported two vulnerabilities (one moderate, one high); re-audit current dependencies and commit a lockfile. Static exam catalog duplicated in DB and TypeScript. Practice and revision cards remain placeholders. Instagram bio updated previously, name/handle/link not confirmed; no posts published. Legacy GitHub Pages preview was not working; Render is production.

## Next action
Verify current affairs migration 0002 and feed commits 9842797 / df7616f. Test RLS, typecheck/build and deployed page. Do not publish fabricated news. Update this document with evidence.

## Background processing update (2026-11-28)
Migration 0003 applied: private news_sources and news_ingestion_queue, unique source URL deduplication; PIB, RBI, ISRO registered but disabled pending feed verification. Proposed execution: Supabase Cron -> Edge Functions -> Gemini API -> editorial review -> published articles. Render serves UI only; jobs must not depend on its uptime. Target free quotas, verify before enabling; no paid upgrades. Store run history, bounded retries and errors; keep secrets in server-side secret storage. Proposed collection at 05:00 IST (23:30 UTC previous day), approved publication target 07:00 IST (01:30 UTC). No scheduler or AI integration active yet. Next: verify feeds, implement and test ingestion, then schedule securely. Never auto-publish unreviewed content.

### Verified deployment and ingestion update
- Render current affairs release f44b9a0 live.
- Edge function ingest-news v1 deployed, JWT verification on; runtime test pending.
- Queue permissions verified: anon/authenticated cannot select or insert; service_role can.
- Next.js tsconfig excludes Deno functions (5b06404); redeploy pending.
- PIB official RSS URL confirmed from publisher listing, actual feed fetch not yet validated. All sources disabled. Cron not scheduled.
- Security advisor: leaked password protection disabled; private tables intentionally have no public policies.

## Current verification — 28 November 2026

- Render deployment `dep-dc57bs0u01pc73fn1p2g` for `4894bbc` was confirmed live. Home, exams, login and current affairs returned HTTP 200. Unauthenticated dashboard access redirected to login with HTTP 307.
- Supabase migrations 0004–0006 applied. Edge function `ingest-news` v2 verified via pg_net. The first run inserted 20 PIB and 10 RBI rows. The second run processed the same 30 candidates, inserted zero duplicates and left 30 private queue rows. Zero articles have been published from the queue.
- Anonymous POST returned 401. Database grants deny anon and authenticated roles queue and run history reads and dispatch/consume RPC execution. HTTPS endpoints for ISRO remain unverified, and the source remains disabled.
- The daily collection job was registered for 05:00 IST after the two real runs. Its first daily execution remains pending.
- Deno typecheck and six feed tests passed. Leaked-password protection remains disabled on the existing plan. Google and email sign-in flows still require isolated end-to-end verification.
- Next vertical slice is Gemini or mock draft generation with structured validation, quota tracking and editorial review. Daily quizzes and later learning phases remain pending.

A temporary Cron job dispatched the Edge worker successfully and removed itself. The worker again inserted zero duplicates. A separate daily job remains active.

The server-side draft provider and mock integration passed three tests. No live Gemini requests were made. Excerpt collection, private draft persistence, quota enforcement and editorial review remain open.

The manual editorial queue supports bilingual draft, publish, unpublish and reject operations. Isolated PostgreSQL tests passed for role restrictions, draft visibility, publication, unpublication and audit logging. Production editor assignment and a signed-in review test require the approved editor account. No production test fixture was published.
