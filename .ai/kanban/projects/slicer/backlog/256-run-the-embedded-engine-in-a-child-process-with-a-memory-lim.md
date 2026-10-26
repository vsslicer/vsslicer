---
id: 256
title: Run the embedded engine in a child process with a memory limit
type: feature
priority: P2
effort: M
model: sonnet
area: [embedded]
story: US73
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [248, 253, 14]
created: 2026-10-25
---

Starts the engine module with the extension host's Node (Electron as Node) as a child process through the runtime module, with the memory limit from the decision.

**Code:** `vsslicer/modules/slicer-embedded/src/adapters/...` (module: `slicer-embedded`, layer: `adapters`)

## Acceptance criteria

- [ ] An oversized fixture ends in a typed out-of-memory error and the test host stays alive
- [ ] The child runs with `ELECTRON_RUN_AS_NODE` set and no shell
- [ ] Stdout and stderr are streamed line by line to the caller

## Tasks

- [ ] Spawn
- [ ] Memory limit
- [ ] Error mapping
- [ ] Tests

## Progress

Not started.
