---
id: 90
title: Add a Web Worker entry for the parser sharing the worker protocol
type: feature
priority: P2
effort: M
model: opus
area: [web]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [GCP-6, 89]
created: 2026-10-25
---

The parser's worker protocol (parse, cancel, progress, memory cap, typed errors) is bound to `worker_threads` in the Node runner. Separate the protocol from the port and add a Web Worker entry that uses `workerPort()` from the shim, so one protocol serves both runtimes.

**Code:** `vsslicer/modules/gcode-parser/src/adapters/...` (module: `gcode-parser`, layer: `adapters`)

## Acceptance criteria

- [ ] The Node worker tests pass unchanged; the same protocol tests pass against the Web Worker entry in headless Chromium
- [ ] Cancel stops a 200 MB synthetic parse within 500 ms on the web worker as on desktop (test)
- [ ] The web entry imports no Node built-in (the check passes)

## Tasks

- [ ] Split protocol from port
- [ ] Web entry
- [ ] Cross-runtime tests

## Progress

Not started.
