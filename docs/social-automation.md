# Social automation

Owner target: ten daily units (3 reels, 2 carousels, 5 stories), IST. Use approved TAIYARI content only. Instagram Business account required for Stories; account identity and type not verified. Use Instagram API with Instagram Login, instagram_business_basic and instagram_business_content_publish, standard access for owned account if eligible. Verify API version, permissions, media specs, publishing limits and token expiry before activation. No automatic publication until owner approval and test.

Gemini API: reuse existing draft provider; configure GEMINI_API_KEY server-side only, verify model availability and free-tier quota before calls. Do not enable paid billing. Google AI Studio https://aistudio.google.com/apikey ; Meta https://developers.facebook.com/apps/ . Never commit tokens or secrets.

Schedule IST: 07:00 current affairs carousel, 08:00 MCQ story, 10:00 maths reel, 11:00 PYQ story, 13:00 GK carousel, 15:00 reasoning story, 17:00 concept reel, 18:00 GK quiz story, 20:00 exam topic reel, 21:00 revision story. Missing approved content must skip, not fabricate. PYQs require verified provenance.

Pipeline: approved content -> private social queue -> deterministic branded media and captions -> review -> scheduled publishing -> reconcile remote IDs and monitor. Use original graphics and licensed audio only. Prefer deterministic text animations rather than paid generative video. Keep publishing disabled by default; idempotency per account/date/slot, bounded retries, token renewal monitoring, no duplicate publishing after ambiguous response. Validate public media URLs and expiry; do not expose private drafts. No live integration or scheduler implemented yet.
