# Operations and handoff

## Resources (non-secret identifiers)
- Repository: https://github.com/krway/taiyari (public, main)
- Production: https://taiyari.onrender.com
- Render service: srv-dc3hvth7lnhs73fr8v70, workspace tea-dc3hv76q1p3s738tb9f0, Singapore, free tier
- Render dashboard: https://dashboard.render.com/web/srv-dc3hvth7lnhs73fr8v70
- Supabase project: crlclgtthdvvvrvmxqgc, Singapore, free tier
- Supabase URL: https://crlclgtthdvvvrvmxqgc.supabase.co
- Supabase dashboard: https://supabase.com/dashboard/project/crlclgtthdvvvrvmxqgc
- Google Cloud project: trade201; existing Web client 1. Never commit client secret or rotate existing credentials without approval.

## Environment
NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (public publishable key compatible with existing variable name), APP_URL=https://taiyari.onrender.com, NODE_VERSION=22.16.0. Render has these configured. Local APP_URL=http://localhost:3000; use .env.local, ignored by git. Future AI keys server-side only. Gemini consumer subscription is not API access; verify quota/billing before enabling.

## Auth settings
Google authorized origin: https://taiyari.onrender.com
Google authorized redirect: https://crlclgtthdvvvrvmxqgc.supabase.co/auth/v1/callback
Supabase Site URL: https://taiyari.onrender.com
Supabase allowed redirect: https://taiyari.onrender.com/auth/callback
Production Supabase URL settings saved; owner reports Google login working. Email provider and confirmation enabled at last inspection. For local development use separate project or add explicit localhost callback without overwriting production Site URL. Check Google audience/test-user restrictions before wider release.

## Development and deployment
Use Node 22, npm ci, npm run dev, npm run typecheck and npm run build. Render build npm install && npm run build; start npm start -- --hostname 0.0.0.0. Check auto-deploy and actual commit; trigger manually only if needed. Verify build/runtime logs and public routes. Free service may take time to wake. Do not upgrade without approval.

## Database changes
Use versioned SQL migrations, review additive changes, apply once to target project and verify schema/RLS with appropriate roles. Never re-run foundation migration against production blindly. Do not expose service role, answer keys or private drafts. Run security advisors and check cross-user isolation. Record applied migrations.

## Smoke tests
Home, exam list, Google sign-in, email signup/confirmation, dashboard, exam selection persistence, logout, unauthorized dashboard redirect. For new feed test published-only visibility, empty/error states and mobile layout. Record what actually passed.

## Recovery
Inspect logs and latest deployed commit first. Revert faulty code through git and redeploy known-good commit if needed; database rollback requires separate reviewed plan. Never delete user data or rotate credentials casually. Keep STATUS.md current. Browser dashboard sessions and connector permissions may expire; reconnect only through secure sign-in, never request passwords in chat.

## Current affairs collection

Apply migrations 0004 and 0005 before deploying `ingest-news`. Set the Vault entry `news_ingestion_endpoint` to the project's HTTPS `/functions/v1/ingest-news` URL. Deploy with gateway JWT verification disabled for this function. The handler authorizes service-role calls and single-use database dispatches.

As the database owner, execute `select public.dispatch_news_ingestion();` for a manual run. The returned pg_net request ID can be checked in `net._http_response`. Use `public.news_ingestion_runs` for durable per-source results. A successful Cron dispatch only confirms the HTTP request was queued. Check the Edge run for collection success. A run older than two minutes is reclaimed on the next invocation. Failed transient feed requests retry once.

After testing a genuine run and repeat, apply 0006. The daily `taiyari-news-ingestion` job is scheduled at 23:30 UTC, which is 05:00 IST the following day. Check `cron.job`, `cron.job_run_details` and the ingestion run table when investigating missed runs. The job is independent of Render.

## Editorial access

Apply migration 0007 before deploying the editorial page. The database owner grants editorial access by inserting the approved account's existing Auth user UUID into `public.news_editors`. The dashboard shows the review link only to editors. Verify the account owner before granting access. The editor can save bilingual drafts, publish, unpublish or reject an ingestion candidate. Audit entries record the action, actor and item. The review page currently shows the 50 most recently collected items.

Apply 0010 before deploying guest practice. Migration 0011 adds four original mathematics questions with checked solutions. The public catalog exposes published questions. Guest scoring writes no attempt records.
