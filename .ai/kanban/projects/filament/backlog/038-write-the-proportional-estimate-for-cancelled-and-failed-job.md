---
id: 38
title: Write the proportional estimate for cancelled and failed jobs
type: feature
priority: P1
effort: S
model: sonnet
area: [consumption]
story: US17
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [37]
created: 2026-10-25
---

Share of the per-tool total by progress (layer or file offset reached), flagged as an estimate.

**Code:** `vsslicer/modules/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] Cancel at 40 percent of layers books 40 percent (+-1 layer), `estimate: true`
- [ ] No progress information yields no estimate, not zero

## Tasks

- [ ] Write the function
- [ ] Tests

## Progress

Not started.
