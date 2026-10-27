---
id: 100
title: Start the parser worker through the shim and fall back with a logged reason
type: feature
priority: P2
effort: M
model: sonnet
area: [web]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [99, 89, 90]
created: 2026-10-25
---

Starts the parser with `startWorker` from the kit; when it throws `WorkerStartError` the preview parses in chunks in the extension host with yields, applies the lower fallback limit from the spike, and logs the reason.

**Code:** `vsslicer/modules/apps/gcode-preview/src/presentation/...` (module: `gcode-preview`, layer: `presentation`)

## Acceptance criteria

- [ ] With a stubbed `WorkerStartError` the preview still opens a small file, logs the reason once, and refuses a file above the lower limit with the message
- [ ] With a working worker the parse runs in the worker on both desktop and web (tests on each)

## Tasks

- [ ] Use the shim
- [ ] Fallback
- [ ] Tests

## Progress

Not started.
