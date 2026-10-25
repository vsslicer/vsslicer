---
id: 174
title: Add Apply update and Roll back commands
type: feature
priority: P2
effort: S
model: sonnet
area: [importers]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [173]
created: 2026-10-25
---

Commands that apply the chosen update with a snapshot and roll back from the snapshot list, with progress and a result summary.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/...` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] End to end on the update fixture: check, apply, see the result, roll back, files equal the originals
- [ ] A failure mid-apply shows the error and leaves the old state (fault-injected host)

## Tasks

- [ ] Apply command
- [ ] Rollback command
- [ ] End-to-end test

## Progress

Not started.
