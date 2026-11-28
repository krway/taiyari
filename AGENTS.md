# TAIYARI — agent handoff

Read this file first, then docs/PRODUCT.md, docs/ARCHITECTURE.md, docs/STATUS.md, docs/ROADMAP.md, docs/OPERATIONS.md and docs/current-affairs.md. These files replace reliance on chat memory. Inspect actual code and live service state before assuming documentation is current.

## Working agreement
Continue the existing repository krway/taiyari (main), not a new app. Deliver small, tested vertical slices. Use STATUS.md and ROADMAP.md to choose the next incomplete vertical slice. Preserve working Google and email auth. Prefer free resources; ask before paid services, destructive changes, credential rotation or public publishing. Never put secrets or personal user data in commits or chat. Use official/licensed content and distinguish verified PYQs from generated practice. Apply RLS and least-privilege grants to exposed tables. Keep answer keys server-side until submission.

Before coding, inspect relevant files and migrations. Before deployment run typecheck/build and test affected flows. Verify actual deployment and database state, not just commit success. Update STATUS.md and ROADMAP.md after every meaningful change, including test evidence, commit/deploy identifiers, blockers and next action. Document architecture decisions. Do not mark untested features complete. No need to ask the owner to repeat decisions recorded here unless they conflict with current evidence.
