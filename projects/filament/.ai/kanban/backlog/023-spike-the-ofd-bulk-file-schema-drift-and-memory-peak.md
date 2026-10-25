---
id: 23
title: "Spike: the OFD bulk file, schema drift and memory peak"
type: spike
priority: P1
effort: M
model: opus
area: [import]
story: US7
milestone: "VSS:M4"
sprint: "VSS:SP17"
depends_on: [22]
created: 2026-10-25
---

OFD is young. Diff two OFD revisions a month apart, measure the memory peak of `all.json.gz` in a worker (fallback `all.ndjson`), and check whether OFD's Orca ids (`OGFxx`) match what PRF imports from Orca profiles.

**Code:** `vsslicer/modules/filament-ofd/docs/` (module: `filament-ofd`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A note with the schema diff, the memory peak, the chosen pinned schema revision and the Orca id comparison against the PRF fixtures
- [ ] The note states the fail-closed rule for an unknown major version

## Tasks

- [ ] Fetch two revisions
- [ ] Measure in a worker
- [ ] Compare Orca ids
- [ ] Write the note

## Progress

Not started.
