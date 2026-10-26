---
id: 113
title: "Add 'restore' to GlFailureCause and drop the preview's cast"
type: bug
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP7"
owner: sp7-gcp-a
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

Kit part done: `'restore'` added to `GlFailureCause` with its message in `MESSAGES` (vsslicer/modules/webview-kit/src/gl/context.ts); test in test/gl-context.test.ts. Verified: webview-kit pnpm lint, test (124/124), build ok.
Not done: the gcode-preview part (needs webview-kit released first; another agent works in gcode-preview).

### Coordinator: shared-file changes

- webview-kit: CHANGELOG line "Added `'restore'` to `GlFailureCause` (message: view could not be restored after a graphics reset)"; version bump 0.6.0 -> 0.7.0 (new union member), then release.
- gcode-preview/package.json: `"@vsslicer/webview-kit": "^0.7.0"`.
- gcode-preview/src/presentation/webview/preview-renderer.ts (~L133-140): replace the `showGlFailure(canvas, {cause:'restore', message:...} as unknown as GlContextError)` expression with `showGlFailure(canvas, new GlContextError('restore'))` (GlContextError is already imported there). The message no longer carries `String(err)`; log it separately if wanted.
Review (sp7-rev-a): PASS (webview-kit part). Read the diff (src/gl/context.ts, test/gl-context.test.ts); no shared files touched; `'restore'` is in the union and in `MESSAGES` (a `Record<GlFailureCause, string>`, so tsc forces the message); nothing in the kit switches on `cause` (`showGlFailure` only copies it to `data-cause`). `pnpm lint && pnpm test && pnpm build` green (124 tests). The new test fails without the fix (`'restore'` is not a GlFailureCause, and the message would be empty). Deferred gcode-preview edit checked against preview-renderer.ts:L11-L18,L144-L153: right except one detail, corrected here: `GlContextError` is imported there as `type GlContextError` (L16), so the edit must also change that to a value import (`GlContextError,`), or `new GlContextError('restore')` fails tsc. The `^0.7.0` range is needed (pre-1.0, `^0.6.0` does not admit 0.7.0). The user message loses `String(err)`, as the note says.
