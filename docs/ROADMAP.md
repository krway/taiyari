# Roadmap

Phase 0 — architecture and product definition: initial decisions documented.
Phase 1 — foundation: implemented; remaining end-to-end verification listed in STATUS.md.
Phase 2 — current affairs (active):
- 2.1 Architecture: done.
- 2.2 Database schema applied and feed code committed; deployment and role tests pending.
- 2.3 Official/licensed source ingestion and deduplication.
- 2.4 Server-side AI bilingual drafts, structured validation and editorial approval.
- 2.5 Daily MCQs, secure scoring and explanations.
- 2.6 Bookmarks, attempts and progress.
- 2.7 Scheduled publishing, monitoring, archives and monthly revision.
Phase 3 — verified PYQ catalog and practice filters, import validation and explanations.
Phase 4 — concept learning and AI tutor grounded in approved content.
Phase 5 — exam-configured mock tests and analytics.
Phase 6 — personalized study plans and spaced revision.
Phase 7 — production hardening, expansion, monetization evaluation and mobile app evaluation.

## Delivery gates
Each slice must have schema/code review, RLS checks where applicable, typecheck/build, smoke tests, deployment verification and updated docs. AI-generated practice is labeled, source links retained, no unreviewed AI drafts published. No paid upgrades or automatic social publishing without owner approval. Prioritize a working vertical slice over broad scaffolding.

## Background processing update (2026-11-28)
Migration 0003 applied: private news_sources and news_ingestion_queue, unique source URL deduplication; PIB, RBI, ISRO registered but disabled pending feed verification. Proposed execution: Supabase Cron -> Edge Functions -> Gemini API -> editorial review -> published articles. Render serves UI only; jobs must not depend on its uptime. Target free quotas, verify before enabling; no paid upgrades. Store run history, bounded retries and errors; keep secrets in server-side secret storage. Proposed collection at 05:00 IST (23:30 UTC previous day), approved publication target 07:00 IST (01:30 UTC). No scheduler or AI integration active yet. Next: verify feeds, implement and test ingestion, then schedule securely. Never auto-publish unreviewed content.

## Delivery update — 28 November 2026

Phase 2.3 official feed collection is live for PIB and RBI. Real initial and duplicate ingestion tests passed. Collection is scheduled for 05:00 IST. ISRO verification remains open. Phase 2.4 structured AI drafts and editorial review are next.
