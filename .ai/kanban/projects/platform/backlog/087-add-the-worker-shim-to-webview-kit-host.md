---
id: 87
title: Add the worker shim to webview-kit/host
type: feature
priority: P2
effort: M
model: opus
area: [web]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [86, 30, 81]
created: 2026-10-25
---

`startWorker(entry, options)` returns one handle (post with transfer list, message and error events, terminate) backed by `worker_threads` on desktop and by a Web Worker in the web extension host, plus a worker-side `workerPort()` with the same interface; failure to start is a typed `WorkerStartError` with the reason.

**Code:** `vsslicer/modules/ui/webview-kit/src/adapters/...` (module: `webview-kit`, layer: `adapters`)

## Acceptance criteria

- [ ] The same test suite passes against the Node implementation under vitest and the Web Worker implementation in headless Chromium
- [ ] Transferred buffers are detached in the sender on both runtimes; an error thrown in the worker reaches the handle's error event
- [ ] A worker that cannot start rejects with `WorkerStartError` carrying the cause (the spike's CSP failure reproduced with a stub)

## Tasks

- [ ] Interface
- [ ] Node backend
- [ ] Web backend
- [ ] Cross-runtime tests

## Progress

Not started.
