---
id: 40
title: Round trip emitted presets through Orca `--export-settings`
type: chore
priority: P0
effort: M
model: sonnet
area: [orca]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP12"
depends_on: [38, 26]
created: 2026-10-25
---

Proves the engine reads what we wrote: emit, load into the pinned Orca, export settings, compare values for every emitted key.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] For every fixture tuple every emitted key has the same value after `--export-settings` (comparison normalises number formatting only)
- [ ] A key silently ignored by Orca fails the test and is named
- [ ] Runs on the Linux CI job with the pinned Orca

## Tasks

- [ ] Export and compare helper
- [ ] Test over tuples
- [ ] Allow-list with reasons for known normalisations

## Progress

Not started.
