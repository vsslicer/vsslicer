---
id: 191
title: Stop the segment renderer holding the CPU move buffer until dispose
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: webview-kit (gl). Finding 9 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] The renderer keeps only the per-chunk values it needs; the move buffer can be collected after creation (test)

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

`create` in segment-renderer.ts now computes the per-chunk next-start values once (`nextStarts`); `draw` uses them, so no closure holds the buffer view. Test: renders after the buffer is detached (structuredClone transfer) and checks the nextStart uniforms are still the real values.
Verified in vsslicer/modules/webview-kit: pnpm lint, test (120 passed), build all pass.
CHANGELOG: - Fixed: the segment renderer no longer keeps the CPU move buffer alive after creation.
Files: src/gl/segment-renderer.ts, test/segment-renderer.test.ts.

Review (plt190-review): PASS, create() reads nextStarts once into an array; draw closes over no buffer or view (words is local to create, analyseMoves result does not retain moves); foreign wrapper holds only r. Detached-buffer test present. pnpm lint, test (121), build and Playwright specs (11) pass; draw behaviour unchanged.
