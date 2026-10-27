---
id: 91
title: Add a browser inflate codec for .bgcode
type: feature
priority: P2
effort: S
model: sonnet
area: [web]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP37"
depends_on: [GCP-11, 81]
created: 2026-10-25
---

The container reader uses `node:zlib` behind a codec interface; add a codec for the browser using `DecompressionStream` (or the bundled `fflate` where it is missing) and select it from the browser entry.

**Code:** `vsslicer/modules/core/gcode-bgcode/src/adapters/...` (module: `gcode-bgcode`, layer: `adapters`)

## Acceptance criteria

- [ ] The `.bgcode` fixtures decode identically with the Node codec and the browser codec (test in Chromium)
- [ ] The browser entry passes the Node-built-in check

## Tasks

- [ ] Browser codec
- [ ] Entry selection
- [ ] Tests

## Progress

Not started.
