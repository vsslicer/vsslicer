---
id: 39
title: "Integration test: 200 MB host to webview transfer with hash check"
type: feature
priority: P0
effort: M
model: sonnet
area: [webview-kit]
story: US8
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-39-worker
depends_on: [36, 37, 15, 31]
created: 2026-10-25
---

End-to-end check inside VS Code that the transport moves 200 MB intact.

## Acceptance criteria

- [x] `@vscode/test-electron` test transfers 200 MB and the webview's hash equals the host's
- [x] Elapsed time and memory printed; test runs on the CI matrix (or documented as a nightly if too slow)

## Tasks

- [x] Write the sample webview handler
- [x] Generate payload at test time
- [x] Compare hashes

## Progress

Done. `pnpm test:integration` in webview-kit (esbuild bundles the webview script and the mocha suite from the tree, no publish needed) runs on VS Code 1.100.0 (min) and stable 1.143.1: 200 MiB random payload generated in the extension host, sent with `sendBuffer` (4 MiB chunks, window 4), the webview hashes with `crypto.subtle.digest` and the host compares SHA-256. Both pass; printed per run, e.g. "sent+acked 265 ms, hashed in webview by 476 ms (755 MiB/s); ext host rss 336 -> 344 MiB; webview js heap 401 MiB" (M1 Pro, macOS). Fixture extension has a `main` (per PLT-31 note) and uses the PLT-188 window channel.

Two real bugs found and fixed in the kit (with unit tests, written failing first):
- `sendBuffer` given a Node `Buffer` sent every chunk as the whole payload (`Buffer.slice` is a view, `.buffer` is everything): the webview received 16 MiB for 8, and 200 MiB OOM-crashed the renderer. Now copies via `new Uint8Array(subarray)`.
- `createWindowChannel` dropped every host message on VS Code 1.100: `window.parent` is not the window there, and `event.source` is not `window.parent` either. Now accepts `event.origin === location.origin` always (else `source === parent`).

Verified: `pnpm lint`, `pnpm test` (115 pass), `pnpm build`, `pnpm test:integration` (min and stable pass). Not verified: Linux and Windows. CI already runs `test:integration` for any module that has the script (ci.yml), so the matrix should pick it up; unrun here. Test takes under 1 s plus the VS Code start, so no nightly needed. Not done: the test-vscode README note about the `main` requirement (other module, out of scope); `TRANSFER_DEFAULTS` is still 1 MiB (the test passes 4 MiB explicitly).

Files (webview-kit, all under vsslicer/modules/webview-kit/): package.json (script, devDeps @vsslicer/test-vscode, @types/mocha, @types/vscode), pnpm-lock.yaml, eslint.config.mjs, vitest.config.ts (excludes test/integration), tsconfig.json (mocha types), .gitignore (new), .prettierignore, README.md, CHANGELOG.md (Unreleased), src/application/transfer.ts, src/adapters/webview-window.ts, test/transfer.test.ts, test/webview-window.test.ts, test/integration/transfer.test.ts, test/integration/webview.ts, test/integration/fixture/{package.json,extension.js,.gitignore}.
