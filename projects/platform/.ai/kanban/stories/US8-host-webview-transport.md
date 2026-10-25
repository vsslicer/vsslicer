---
id: US8
title: An extension author opens a webview and exchanges large typed arrays with it safely
status: reviewed
epic: VSS:E2
---

An extension author uses `@vsslicer/webview-kit/host` and `/webview` to create the webview HTML with a strict CSP and to send commands and ArrayBuffers both ways with versioning, chunking, backpressure and defined failure behaviour, plus a Playwright stub so any project can snapshot its webview in plain Chromium.

## Acceptance criteria

- [ ] Transport unit tests over a fake channel cover ordering, chunk reassembly, backpressure, timeout (named error) and version mismatch after a webview reload
- [ ] An `@vscode/test-electron` test transfers 200 MB host-to-webview and asserts it arrives intact (hash)
- [ ] An `@vscode/test-electron` test hides and re-shows a sample webview editor and the `setState` state is restored; disposing it mid-transfer logs one warning and leaks no listener
- [ ] A unit test asserts the generated CSP contains no `unsafe-inline` or `unsafe-eval`; the sample webview logs no CSP violation in the integration test's console capture
- [ ] The kit ships a webview stub (fake `acquireVsCodeApi`, fake host end) usable from the E1 Playwright harness

## Out of scope

- Parsing or interpreting payloads (the transport sees only the envelope); `SharedArrayBuffer`.
