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
