---
id: US52
title: "Start a worker the same way on desktop and in the web extension host"
status: reviewed
epic: VSS:E48
---

As an extension author, I want one function that starts a parser or mesh worker as a Node worker on desktop and as a Web Worker in the web extension host, with the same message interface, and a defined fallback when a worker cannot start, so that the same extension code runs in both.

## Acceptance criteria

- [ ] A spike measures on vscode.dev whether nested workers start from the web extension host under its CSP, and the largest file a browser tab holds; the decision records the fallback and the web size limit
- [ ] `startWorker` in `@vsslicer/webview-kit/host` returns the same handle (post, receive, error, terminate, transfer list) on both runtimes; tests run on Node and in Chromium
- [ ] A worker that fails to start gives a typed error with the reason, and the caller falls back to chunked in-host work with a lower limit and a logged reason

## Out of scope

- Shared memory (`SharedArrayBuffer`); worker pools.
