---
id: 253
title: Build the chosen engine reproducibly in CI from a pinned revision
type: chore
priority: P2
effort: L
model: opus
area: [embedded]
story: US74
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [248, PLT-9]
created: 2026-10-25
---

A CI job builds the engine (Emscripten or native, per the decision) from a pinned upstream revision within free runner limits (D5), and publishes the corresponding source with each release (D2 obligation 4).

**Code:** `vsslicer/modules/slicer/embedded/` (module: `slicer-embedded`, layer: n/a (ci))

## Acceptance criteria

- [ ] Two builds of the same revision produce the same hash, or the difference is explained in the job log
- [ ] The job fits the free runner time limit and the artifact is cached by revision
- [ ] Each release attaches the engine source archive at the pinned revision

## Tasks

- [ ] Build recipe
- [ ] Cache and hash check
- [ ] Source archive step

## Progress

Not started.
