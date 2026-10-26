---
id: 312
title: "Slice the painted fixtures with the Orca CLI and check supports, seams and tool changes in the G-code"
type: feature
priority: P2
effort: M
model: opus
area: [editor, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [311, 273, SLC-30, SLC-42, GCP-4, GCP-5]
created: 2026-10-25
---

Slices the scripted projects and the upstream-painted fixtures through `slicer-orca` and uses the G-code parser per layer to confirm the paint took effect.

**Code:** `vsslicer/modules/project-extension/test/integration/paint-oracle/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] Enforcer region: support moves appear there and not on the unpainted overhang; blocker region: no support in it
- [ ] Seam mark: perimeter start points on the marked layers lie within a tolerance of the mark (tolerance set from the unpainted run)
- [ ] Colour regions: tool change commands occur in the layers of the painted region and the expected filament is used
- [ ] Engine and parser versions printed; runs in CI on Linux; verified on fixtures only (D5)

## Tasks

- [ ] Harness
- [ ] Support and blocker checks
- [ ] Seam check
- [ ] Tool change check
- [ ] CI job

## Progress

Not started.
