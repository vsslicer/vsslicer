---
id: 31
title: "Spike: the Orca preset JSON the CLI accepts"
type: spike
priority: P0
effort: S
model: opus
area: [orca]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP12"
depends_on: [24, 16]
created: 2026-10-25
---

Finds the exact shape of machine, process and filament presets for `--load-settings` and `--load-filaments`: required header keys, `inherits`, `from`, per-slot filaments, and which of the 43 keys the CLI refuses on the command line, with the classes of refusal.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (spike))

## Acceptance criteria

- [ ] A table in `docs/` of required header keys and a minimal preset per type that the pinned Orca accepts
- [ ] The refused-key list with classes, derived from the pinned source and confirmed by running the CLI
- [ ] Decision on where each unified key goes (machine, process, filament) with the rule

## Tasks

- [ ] Read the Orca preset loading code
- [ ] Try minimal presets
- [ ] Record refused keys

## Progress

Not started.
