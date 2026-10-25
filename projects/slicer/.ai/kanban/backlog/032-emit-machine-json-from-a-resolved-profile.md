---
id: 32
title: Emit `machine.json` from a resolved profile
type: feature
priority: P0
effort: M
model: sonnet
area: [orca]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP12"
depends_on: [31, 7, PRF-135]
created: 2026-10-25
---

Pure function from the machine part of `ProfileStore.resolve(...).native("orca")` to the Orca machine preset JSON. The resolved-profile type comes from `profile-api`.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] Snapshot test for the H2C fixture tuple; a dropped or renamed key changes the snapshot
- [ ] Header keys follow the spike's table
- [ ] Values keep their type (numbers stay numbers, vectors stay vectors)

## Tasks

- [ ] Split keys by preset type
- [ ] Write the header
- [ ] Snapshots

## Progress

Not started.
