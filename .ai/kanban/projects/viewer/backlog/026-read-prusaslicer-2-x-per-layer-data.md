---
id: 26
title: Read PrusaSlicer 2.x per-layer data
type: feature
priority: P1
effort: S
model: sonnet
area: [3mf]
story: US6
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [25]
created: 2026-10-25
---

Reads the per-layer XML parts (layer config ranges, custom G-code per print Z, layer height profile).

**Code:** `vsslicer/modules/3mf/src/adapters/prusa/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Layer ranges and custom G-code per Z on the 2.9 fixture match the golden
- [ ] A missing part is not an error

## Tasks

- [ ] Parse the parts
- [ ] Golden

## Progress

Not started.
