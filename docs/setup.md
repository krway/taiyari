# Local setup

1. Install Node.js 22 and run npm install.
2. Create a Supabase project and run supabase/migrations/0001_foundation.sql in its SQL editor once.
3. Copy .env.example to .env.local and fill in the project URL and public anon key. Never expose a service-role key.
4. Set Supabase Auth Site URL to http://localhost:3000 for local development; configure the production URL before deployment. Email/password authentication must be enabled.
5. Run npm run dev, visit /login, create an account, confirm email if required, sign in, and select an exam at /dashboard.
6. Run npm run typecheck and npm run build before deployment.

The exam catalog is currently mirrored in TypeScript and SQL; keep both in sync until database-backed catalog loading is implemented.

Install dependencies with `npm ci` for a reproducible build. Run `npm run lint`, `npm run typecheck` and `npm run build` for the web app. For Edge code, run `deno check --node-modules-dir=none --frozen supabase/functions/ingest-news/index.ts` and `deno test --node-modules-dir=none --frozen supabase/functions`. Migration 0006 requires the Vault endpoint configured in OPERATIONS.md.
