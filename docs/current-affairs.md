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

## Verified official feeds

- PIB regional feed with `Regid=3`: `https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3`. Production followed the redirect to an approved PIB host and collected 20 articles. The `Regid=1` feed returned valid, empty XML during discovery.
- RBI press releases: `https://www.rbi.org.in/pressreleases_rss.xml`. Production collected 10 articles.
- ISRO remains disabled. Candidate URLs returned HTTP 403 from the test environment.

RSS and Atom are supported. The Edge worker bounds redirects, HTTP time, response size and entries per source. It keeps publisher URLs, strips fragments and known tracking parameters, sorts query parameters and uses the queue's unique URL constraint for repeat and concurrent ingestion. Empty feeds succeed. The worker stores headlines and provenance in the private queue. AI drafting and editorial publication remain separate milestones.
