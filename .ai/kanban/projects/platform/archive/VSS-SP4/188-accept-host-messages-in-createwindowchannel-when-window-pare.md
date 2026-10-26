---
id: 188
title: Accept host messages in createWindowChannel when window.parent is the window
type: bug
priority: P0
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-188-worker
created: 2026-10-26
---

Module: webview-kit (adapters, `createWindowChannel`). Found in SP4 by PLT-31 and GCP-30: the webview channel keeps only messages where `event.source === window.parent`, but VS Code sets `window.parent = window` inside the webview (`vscode@4ef6bab7:src/vs/workbench/contrib/webview/browser/pre/index.html:252-254`), so every host message is dropped: `handshake` and `receiveBuffers` never hear the host and `sendBuffer` times out. `event.origin === location.origin` holds for host messages on VS Code 1.100.0 and 1.143.1 (GCP-30 integration test, PLT-31 probe). Notes: `.reference/notes/PLT-31-transport-spike.md`, `.reference/notes/GCP-30-custom-editor.md`.

## Acceptance criteria

- [x] `createWindowChannel` accepts host messages when `window.parent === window` and checks `event.origin === location.origin` instead (test where parent is the window itself; a foreign-origin message is still dropped)
- [x] `docs/research/vscode-platform.md` §2 and the kit README say which check the channel uses

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] CHANGELOG under Unreleased

## Progress

Done. `createWindowChannel` now accepts host messages by `event.origin === location.origin` when `window.parent === window`, and keeps `event.source === window.parent` for a distinct parent. `WindowLike` gained `location.origin`; `WindowMessage` exported. Test: parent is the window itself, host origin accepted, foreign origin dropped. README states the check; docs/research/vscode-platform.md §2 (line 50) was already corrected by PLT-31, no edit needed. Verified: prettier, eslint, tsc, `pnpm test` (102 pass), `pnpm build`. `pnpm lint` as a whole fails only on another agent's untracked `test-results/.last-run.json` (prettier).

Files: vsslicer/modules/webview-kit/src/adapters/webview-window.ts, src/webview/index.ts, test/webview-window.test.ts, README.md, CHANGELOG.md.
