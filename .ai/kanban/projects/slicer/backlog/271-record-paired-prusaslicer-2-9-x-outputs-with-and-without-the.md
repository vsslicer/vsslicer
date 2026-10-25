---
id: 271
title: Record paired PrusaSlicer 2.9.x outputs with and without the rules
type: chore
priority: P2
effort: M
model: sonnet
area: [postprocess]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [266]
created: 2026-10-25
---

Slices the fixtures twice with the pinned PrusaSlicer 2.9.x, rules off and on, and checks in both outputs as the oracle pairs; a script regenerates them.

**Code:** `vsslicer/modules/slicer-extension/test/fixtures/substitutions/` (module: `slicer-extension`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Each pair has `PROVENANCE.md` with the PrusaSlicer version, rules and argv; files stay under the size cap
- [ ] The regeneration script documents how to install the pinned version
- [ ] Pairs cover each flag at least once

## Tasks

- [ ] Choose rules per flag
- [ ] Slice twice
- [ ] Check in with provenance

## Progress

Not started.
