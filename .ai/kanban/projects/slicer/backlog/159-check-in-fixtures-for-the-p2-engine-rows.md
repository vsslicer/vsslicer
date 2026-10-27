---
id: 159
title: Check in fixtures for the P2 engine rows
type: chore
priority: P2
effort: M
model: sonnet
area: [engine]
story: US59
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [1, PLT-13]
created: 2026-10-25
---

Small models and presets the E64 effect tests slice: a colliding and a non-colliding object pair, a mold model, a conical-support overhang, a gradual-infill block, a make-overhang-printable overhang, a Klipper machine preset with `bed_mesh_*`, and presets with role-change hooks and timelapse G-code.

**Code:** `vsslicer/fixtures/slicer/p2/` (layer: n/a (fixtures))

## Acceptance criteria

- [ ] Each folder has `PROVENANCE.md` and no file exceeds the 5 MB cap (PLT-13 check passes)
- [ ] `expected.json` per plate lists layer count and the roles or objects the effect test asserts; the engine version used is recorded
- [ ] Hand-written presets load in the pinned Orca and CuraEngine without error

## Tasks

- [ ] Create models
- [ ] Write presets
- [ ] Write `expected.json` and `PROVENANCE.md`

## Progress

Not started.
