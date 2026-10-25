---
id: 33
title: Emit `process.json` from a resolved profile
type: feature
priority: P0
effort: M
model: sonnet
area: [orca]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [31, 7, PRF-135]
created: 2026-10-25
---

Same for the process preset (layers, walls, infill, supports, speeds).

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] Snapshot test for the H2C fixture tuple
- [ ] Keys that belong to another preset type are never written here
- [ ] Orca key names are used as given (D9); prefixed `prusa.`, `cura.`, `bambu.` keys are not written (they go through the fallback card)

## Tasks

- [ ] Select process keys
- [ ] Write the header
- [ ] Snapshots

## Progress

Not started.
