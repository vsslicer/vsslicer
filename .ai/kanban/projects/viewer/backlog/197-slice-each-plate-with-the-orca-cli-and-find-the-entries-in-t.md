---
id: 197
title: Slice each plate with the Orca CLI and find the entries in the right G-code
type: feature
priority: P1
effort: M
model: opus
area: [plates]
story: US57
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [196, 178, 176, SLC-30, SLC-42, GCP-4, GCP-5]
created: 2026-10-25
---

Slices each plate of the fixture through `slicer-orca` and uses the G-code parser to check bed type, print sequence, spiral mode, plate custom G-code and layer entries.

**Code:** `vsslicer/modules/apps/project/test/integration/plates-oracle/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The pause is found on the expected layer of the right plate and not on the others
- [ ] A plate setting appears in that plate's G-code only
- [ ] Engine and parser versions printed; runs in CI on Linux

## Tasks

- [ ] Plate selection
- [ ] Checks
- [ ] CI job

## Progress

Not started.
