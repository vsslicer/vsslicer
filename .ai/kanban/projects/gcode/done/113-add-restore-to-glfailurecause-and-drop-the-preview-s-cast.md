---
id: 113
title: "Add 'restore' to GlFailureCause and drop the preview's cast"
type: bug
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP7"
owner: sp7-gcp-39
docs: [.ai/audits/SP6-audit.md]
created: 2026-10-26
---

Module: webview-kit, gcode-preview (presentation). Finding 8 of the SP6 audit, `.ai/audits/SP6-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] Fixed as the audit describes
- [x] A test that fails before the fix

## Tasks

- [x] Fix as the audit describes

## Progress

Kit part done earlier: `'restore'` added to `GlFailureCause` in webview-kit (v0.7.0).
Preview part done: `preview-renderer.ts` imports `GlContextError` as a value and calls `showGlFailure(canvas, new GlContextError('restore'))`; the restore error detail is logged with `console.error('Graphics restore failed', err)` because the kit's message no longer carries it. `test/renderer.test.ts` asserts the kit's message and silences the log.
Verified in gcode-preview: eslint, prettier, tests (91 pass) green; `tsc` and the full `pnpm build` fail only on the other agent's `test/snapshots.spec.ts` (Playwright not installed, GCP-110); esbuild webview/worker bundles ok.
Not done: nothing. Shared-file changes: none.

Review (sp7-rev-gcp3): PASS. preview-renderer.ts imports GlContextError as a value and calls `showGlFailure(canvas, new GlContextError('restore'))`, no cast; detail logged via console.error; renderer.test.ts asserts cause 'restore' and the kit message. Ran in the module: `pnpm lint` (eslint, prettier, tsc) green, `pnpm test` 91 pass, `pnpm build` green up to third-party-notices (saxes, PLT-194, not this card).
