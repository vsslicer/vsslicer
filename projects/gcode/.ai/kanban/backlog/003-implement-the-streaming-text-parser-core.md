---
id: 3
title: Implement the streaming text parser core
type: feature
priority: P0
effort: L
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [1, 2]
created: 2026-10-25
---

Module: `gcode-parser`, layers `domain` (tokeniser, state machine) and `application` (`parse`). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Turns text G-code into moves with modal state.

## Acceptance criteria

- [ ] Unit tests per command: G0/G1, G90/G91, M82/M83, G92, G10/G11, G17-19 plane state, tool changes, M104/M109/M140/M190, M106/M107, M204/M205/M201/M203/M566, M900/M572, SET_VELOCITY_LIMIT, SET_PRESSURE_ADVANCE
- [ ] Unknown commands are kept as named markers (test)
- [ ] The corpus move counts match golden JSON
- [ ] Streams from disk by chunk; a 100 MB synthetic file never loads whole (test on heap)

## Tasks

- [ ] Line tokeniser with file offsets
- [ ] Modal state machine
- [ ] Command handlers for the scope list
- [ ] Marker for unknown commands
- [ ] Wire to the corpus goldens

## Progress

Not started.
