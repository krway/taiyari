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
Node 22; npm install (use npm ci once lockfile exists), npm run dev, npm run typecheck, npm run build. Render build npm install && npm run build; start npm start -- --hostname 0.0.0.0. Check auto-deploy and actual commit; trigger manually only if needed. Verify build/runtime logs and public routes. Free service may take time to wake. Do not upgrade without approval.

## Database changes
Use versioned SQL migrations, review additive changes, apply once to target project and verify schema/RLS with appropriate roles. Never re-run foundation migration against production blindly. Do not expose service role, answer keys or private drafts. Run security advisors and check cross-user isolation. Record applied migrations.

## Smoke tests
Home, exam list, Google sign-in, email signup/confirmation, dashboard, exam selection persistence, logout, unauthorized dashboard redirect. For new feed test published-only visibility, empty/error states and mobile layout. Record what actually passed.

## Recovery
Inspect logs and latest deployed commit first. Revert faulty code through git and redeploy known-good commit if needed; database rollback requires separate reviewed plan. Never delete user data or rotate credentials casually. Keep STATUS.md current. Browser dashboard sessions and connector permissions may expire; reconnect only through secure sign-in, never request passwords in chat.
