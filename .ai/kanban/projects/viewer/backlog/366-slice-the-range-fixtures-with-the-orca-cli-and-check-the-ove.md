---
id: 366
title: Slice the range fixtures with the Orca CLI and check the override only inside the range
type: feature
priority: P2
effort: M
model: opus
area: [editor]
story: US94
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [363, 274, SLC-30, SLC-42, GCP-4, GCP-5]
created: 2026-10-25
---

Creates ranges with the drag tool's command (with an infill and a layer-height override), saves, slices and checks the G-code per layer.

**Code:** `vsslicer/modules/apps/project/test/integration/range-oracle/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] The override appears only in the layers of the range (infill density differs inside and not outside; layer height changes only inside)
- [ ] A saved and reopened project round-trips the range
- [ ] Engine and parser versions printed; runs in CI on Linux

## Tasks

- [ ] Fixtures
- [ ] Per-layer checks
- [ ] CI job

## Progress

Not started.
