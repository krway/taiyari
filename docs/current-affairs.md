# Current affairs — Phase 2

## Delivery order
1. Published article feed with date, category, source URL, English and Hindi summaries and exam relevance.
2. Source ingestion and deduplication; use official sources and licensed feeds, never republish full articles.
3. Server-side AI drafting with structured validation and editorial approval before publication.
4. Daily quizzes with server-side scoring, explanations and user-owned attempts and bookmarks.
5. Scheduled ingestion, monitoring and monthly revision.

## Data model
Articles have a stable source URL, publication date, category, bilingual summaries, relevance, draft/published status and timestamps. Published articles are readable; writes are restricted to trusted backend/editor workflows. Quiz answer keys must not be exposed before submission. User records use ownership-based RLS.

## Acceptance criteria
Feed handles empty and error states, displays source links and dates, supports mobile screens and never labels generated practice as verified PYQs. No API keys in client bundles. AI provider credentials and scheduling are separate deployment steps.
