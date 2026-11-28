# Status — 28 November 2026

## Production

- Render deployment `dep-dc57lgk9v7es739gkg1g` is live for `7d3816b`. The production practice route redirects signed-out users to login. Web, Edge and database CI jobs passed for this commit.

- Supabase migrations 0001–0008 are applied. Edge function `ingest-news` v2 collects PIB and RBI releases every day at 05:00 IST. The daily job is active and a temporary Cron smoke job reached the worker successfully. The first daily execution is pending.
- The first genuine ingestion inserted 20 PIB and 10 RBI articles. The second run processed the same 30 candidates and inserted zero duplicates. Anonymous POST returned 401. Database grants deny ordinary roles direct queue and history reads and dispatch or consume RPC execution. ISRO remains disabled because a working official feed has yet to be verified.
- The public bilingual feed reads published briefings. The private queue contains 30 genuine articles and no briefings have been published from it.
- Editors can save bilingual drafts, publish, unpublish and reject with an audit trail. Production has no assigned editor. An approved account is required for a signed-in production review test.
- The practice bank has four subjects and no approved questions. The practice page supports exam, subject, topic, difficulty, year and provenance filters. Answer keys are private and attempts are scored at submission.
- Google sign-in was previously confirmed by the project owner. Live email confirmation, Google OAuth, logout and profile persistence still need dedicated production test accounts.

## Verification

- Edge formatting, lint and type checks passed. Six feed tests cover redirects, empty RSS, Atom, normalized duplicates, size limits and XML validation. Three draft-provider tests cover mock generation, request shape and rejected outputs.
- Isolated PostgreSQL tests passed for editorial access, draft and publication visibility, unpublishing, rejection and audit history. Practice tests passed for provenance requirements, private solutions, scoring, idempotent submission and attempt isolation.
- Local Chromium smoke tests at 375px and 1280px passed for the bilingual feed and signed-out access gates. With a mocked Supabase service, email sign-in, question submission and denial of editor access for a regular user also passed.
- Production route checks passed for home, exams, login and the bilingual feed. The dashboard and editorial pages redirect signed-out users to login. Render required manual deploy triggers despite the auto-deploy setting.
- The npm lockfile and scoped PostCSS override produced a passing web build and an npm audit with zero reported vulnerabilities. Supabase's leaked-password protection remains disabled on the free plan. Its advisor also flags authenticated security-definer RPCs, whose internal editor checks or attempt ownership are covered by isolated role tests.

## Remaining work

- Live Gemini generation needs an API key and approved source excerpts. The verified provider adapter returns provenance, prompt version and token usage. Automated staging, persistent AI usage and quotas, editorial regeneration, question validation and daily quizzes remain pending.
- The initial practice slice needs approved questions. Bulk import, moderation, timed sessions, bookmarks, error history, reporting and statistics remain pending.
- See ROADMAP.md for the remaining concept learning, mocks, personalization, revision and social export work. Public social publishing remains disabled.

Migration 0009 exposes a limited public list of dated official headlines. In production, the anonymous RPC returned 10 eligible RBI headlines and anonymous direct queue access remained denied. The 20 ingested PIB headlines lack a source publication timestamp and are excluded. Automated bilingual summaries and quizzes remain pending.
