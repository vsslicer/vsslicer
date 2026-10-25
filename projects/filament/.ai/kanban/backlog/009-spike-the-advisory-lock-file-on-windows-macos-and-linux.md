---
id: 9
title: "Spike: the advisory lock file on Windows, macOS and Linux"
type: spike
priority: P1
effort: S
model: opus
area: [model]
story: US3
milestone: "VSS:M4"
depends_on: [7, PLT-9]
created: 2026-10-25
---

Windows has no atomic O_APPEND guarantee. Measure lock-file behaviour (stale lock, crash while holding it, reload on change) on all three CI platforms and decide between the lock file and the single-writer fallback through the printer agent.

**Code:** `vsslicer/modules/filament/test/spikes/` and `vsslicer/modules/filament/docs/` (module: `filament`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A written note with results from the three CI platforms and the decision; the fallback, if chosen, is stated as an UNRESOLVED dependency on `printer-agent`
- [ ] A reproducible script under `test/spikes/` that exercises stale and crashed locks

## Tasks

- [ ] Write the experiment
- [ ] Run it on the CI matrix
- [ ] Record the decision

## Progress

Not started.
