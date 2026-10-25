---
id: 245
title: "Spike: a bundled native engine in per-platform VSIXs"
type: spike
priority: P2
effort: M
model: opus
area: [embedded]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP29"
depends_on: [243, 1, PLT-22]
created: 2026-10-25
---

Measures a native Orca or CuraEngine bundled in platform-specific VSIXs: VSIX size, speed, cancel and the macOS signing and notarisation problem (no budget, D5).

**Code:** `vsslicer/modules/slicer-embedded/` (module: `slicer-embedded`, layer: n/a (spike))

## Acceptance criteria

- [ ] Numbers for size and time on the I5 fixtures for the candidate, notes on signing per platform
- [ ] A statement of which platforms are feasible without paid signing
- [ ] The per-target VSIX packaging task (PLT-22) is exercised with a dummy payload

## Tasks

- [ ] Build or fetch the engine
- [ ] Package a test VSIX
- [ ] Measure
- [ ] Write notes

## Progress

Not started.
