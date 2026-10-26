---
id: 40
title: "Integration test: webview hide, restore, dispose and CSP console capture"
type: feature
priority: P1
effort: M
model: sonnet
area: [webview-kit]
story: US8
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-40-worker
depends_on: [36, 37, 15]
created: 2026-10-25
---

Lifecycle and CSP checks in the sample webview editor.

## Acceptance criteria

- [x] Hide and re-show restores state set with `setState`
- [x] Dispose mid-transfer logs one warning and leaks no listener
- [x] Console log capture shows no CSP violation

## Tasks

- [x] Write the lifecycle test
- [x] Capture the webview console
- [x] Assert no CSP messages

## Progress

Done. `test/integration/lifecycle.test.ts` (webview-kit, run by `pnpm test:integration` on VS Code 1.100.0 and 1.143.1, all pass), on a shared `harness.ts` (PLT-39's transfer test now uses it too):
- Hide/show: a second panel in the same column hides the first (no retainContextWhenHidden, so its page is destroyed); revealing reloads it, it handshakes again and `getState()` returns the `{ n: 42 }` set before.
- Dispose mid-transfer (64 MiB, 1 MiB chunks, window 4): panel disposed, then a post on the channel; asserts exactly one warning, zero live `onDidReceiveMessage` subscriptions (counted through a wrapper), `channel.disposed`, and the sender fails with `TimeoutError` instead of hanging. Note the single warning is deterministic because the test posts once after dispose; an in-flight chunk dropping would be deduplicated into the same one.
- CSP: the extension host cannot see the webview console, so the fixture webview forwards `securitypolicyviolation` events and `console.error/warn` as messages. A session with handshake and an 8 MiB transfer yields none; a probe `fetch` to a foreign host then produces a `connect-src` violation, proving the capture works.

Verified: `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:integration`. Not verified: Linux and Windows. The "console log capture" is done in-page, not from test-vscode's console.log (that file is written by the CLI after the run).

Files (vsslicer/modules/webview-kit/): test/integration/lifecycle.test.ts, test/integration/harness.ts (new), test/integration/webview.ts, test/integration/transfer.test.ts (refactored onto the harness), CHANGELOG.md.
