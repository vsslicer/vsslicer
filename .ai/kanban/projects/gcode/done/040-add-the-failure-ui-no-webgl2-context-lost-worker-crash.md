---
id: 40
title: "Add the failure UI: no WebGL2, context lost, worker crash"
type: feature
priority: P0
effort: M
model: sonnet
area: [editor]
story: US13
milestone: "VSS:M1"
sprint: "VSS:SP6"
depends_on: [30]
created: 2026-10-25
---

The preview breaks alone; the host and other extensions are unaffected.

## Acceptance criteria

- [x] Forced WebGL2 failure shows a message naming `disable-hardware-acceleration` and software rendering
- [x] `WEBGL_lose_context` restores the view from cached buffers
- [x] A killed worker shows the error panel with retry and other extensions keep working (test)

## Tasks

- [x] WebGL2 probe message
- [x] Context restore
- [x] Worker crash panel
- [x] Tests

## Progress

Done. Criteria 1 and 2 mostly existed (GCP-101 and webview-kit); proven and gap-filled, crash retry built.
- WebGL2 message: webview-kit's `no-webgl2` message lacked the argv.json hint and `creation-refused` said "software fallback". Both now name `disable-hardware-acceleration` (via the shared hint) and "software rendering"; gl-context.test.ts asserts it for all three causes.
- Context restore: already built (`trackContextLoss`, preview-renderer rebuilds from the CPU arrays; failed restore calls showGlFailure) and tested in gcode-preview/test/renderer.test.ts ("a context loss drops the renderer and a restore rebuilds and redraws"). No change.
- Worker crash: the loader already turned crash/exit into code `worker-crashed`, shown as the error panel. New: `Method.retry` (webview to host), a Retry button in the webview error panel, `PreviewSession.retry()` (reloads only after an error, joins a reload in flight, no-op once aborted), `state` is now a getter, the provider probe reads the current state. Worker start and data transport untouched (D18, D19).
- Tests (plain Node): load.test.ts real worker thread that exits with code 3 rejects `worker-crashed` (fixtures/crash-worker.mjs); session.test.ts crash then Retry serves loading, error, loading, ready; Retry no-op after success. "Other extensions keep working" is shown by the crash arriving as a state, never a throw in the host.
- Not run: integration tests (download VS Code); the Retry button DOM is not covered by a browser test.
- Verified: webview-kit and gcode-preview `pnpm lint && build && test` pass (webview-kit 121, gcode-preview 63). gcode-preview resolves webview-kit from the registry, so the message change reaches it after webview-kit is released.
- Files: webview-kit/src/gl/context.ts, webview-kit/test/gl-context.test.ts; gcode-preview/src/domain/summary.ts, src/application/preview-session.ts, src/presentation/provider.ts, src/presentation/webview/main.ts, test/session.test.ts, test/load.test.ts, test/fixtures/crash-worker.mjs.
- Changelog: webview-kit: WebGL2 failure messages name disable-hardware-acceleration and software rendering. gcode-preview: the error panel has a Retry button that reloads the file after a failed load or worker crash.

- Moved SP5 to SP6 at SP5 start: the gcode-preview lane is full (one card per module at a time); after GCP-31, 32, 35, 38 at about 69 minutes, a fifth serial card breaks rule 5's 72-minute critical path. First to pull back in if the lane runs ahead.
- Review passed (gcode40-reviewer, gcp40-reviewer): lint/build/test green in webview-kit (121) and gcode-preview; all 3 criteria checked; retry only after error, no-op after ready/abort; state getter callers (provider probe, tests) fine; session in application, vscode API only in presentation. Note: two retry messages in the same error state would both deliver (button is disabled after one click, so not reachable from the UI).
