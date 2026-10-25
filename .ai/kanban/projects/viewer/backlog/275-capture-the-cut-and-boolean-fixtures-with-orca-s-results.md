---
id: 275
title: "Capture the cut and boolean fixtures with Orca's results"
type: chore
priority: P2
effort: S
model: sonnet
area: [mesh]
story: US86
milestone: "VSS:M5"
sprint: "VSS:SP43"
created: 2026-10-25
---

The oracle for cut and boolean: closed fixtures, Orca's boolean (mcut) volumes, and an Orca project cut with plug, dowel and snap connectors and a dovetail.

**Code:** `vsslicer/fixtures/cut/` (layer: n/a (fixtures))

## Acceptance criteria

- [ ] Operand pairs (cube and sphere, two overlapping cylinders, a mesh with a hole) with Orca's union, difference and intersection volumes recorded
- [ ] A closed mesh with a recorded Orca planar cut (volumes of both halves), and a saved Orca project with each connector kind and a dovetail, including its `cut_information.xml`
- [ ] A mesh with one open edge for the refusal tests
- [ ] App versions and steps in a README

## Tasks

- [ ] Operands and Orca runs
- [ ] Cut projects
- [ ] README

## Progress

Not started.
