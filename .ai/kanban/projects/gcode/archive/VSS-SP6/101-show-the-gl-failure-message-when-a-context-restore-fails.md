---
id: 101
title: Show the GL failure message when a context restore fails
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-preview (presentation, webview). Finding 4 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] When onRestored receives an error the preview shows the failure UI instead of a blank view
- [x] A test that fails before the fix

## Tasks

- [x] Fix as the audit describes

## Progress

Done. `onRestored(err)` in `preview-renderer.ts` now calls `showGlFailure` with `cause: 'restore'` and a message including the error. The kit's `GlFailureCause` union has no `'restore'`, so the object is cast to `GlContextError` (showGlFailure reads only cause and message); a kit follow-up could add the cause.
Verified: new case in `renderer.test.ts` (a throwing `createProgram` during rebuild; asserts the alert has `data-cause=restore` and the message). Before the fix the hook ignored the error, so the assertion fails. `pnpm lint && build && test` pass (53 tests).
Files: `vsslicer/modules/gcode-preview/src/presentation/webview/preview-renderer.ts` (import and `onRestored`, about L10-L20 and L130-L140), `vsslicer/modules/gcode-preview/test/renderer.test.ts` (fakeGl returns `fixed`; new test before the concatMoves test).
Changelog: Fixed: a failed GPU context restore now shows the failure message instead of a blank preview.
Review passed (gcp101-102-reviewer): lint/build/test green (60 tests). Probe in scratch: with the old onRestored hook the new restore test fails, with the fix it passes. Kit 0.5.1 showGlFailure reads only error.cause and error.message (sets data-cause, textContent), so the cast is safe; kit follow-up: add 'restore' to GlFailureCause so the cast can go.
