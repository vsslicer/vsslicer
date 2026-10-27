---
id: 39
title: Snapshot emitted presets for every fixture profile tuple of the profile fixture set
type: chore
priority: P0
effort: S
model: sonnet
area: [orca]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [38, PRF-140]
created: 2026-10-25
---

The full tuple set from PRF's fixtures (printer, material, process combinations) emitted and snapshotted.

**Code:** `vsslicer/modules/slicer/orca/` (module: `slicer-orca`, layer: n/a (snapshot tests))

## Acceptance criteria

- [ ] One snapshot per fixture tuple; adding a key to the schema without handling it changes a snapshot
- [ ] The tuple set is imported from the profile fixture package, not copied

## Tasks

- [ ] Load the PRF fixture tuples
- [ ] Snapshot test
- [ ] Document how to regenerate

## Progress

Not started.
