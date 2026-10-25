---
id: 32
title: Add colour modes with a palette texture
type: feature
priority: P0
effort: L
model: sonnet
area: [renderer]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [31]
created: 2026-10-25
---

Mode switch is a uniform change. Modes: feature, speed, width, flow, fan, temperature, layer time, tool.

## Acceptance criteria

- [ ] Each mode renders the corpus; switching modes does not re-upload geometry (upload counter test)
- [ ] Per-move scalars come from the buffers and Timing

## Tasks

- [ ] Per-move scalar attributes
- [ ] Palette texture
- [ ] Shader switch
- [ ] Legend data

## Progress

Not started.
