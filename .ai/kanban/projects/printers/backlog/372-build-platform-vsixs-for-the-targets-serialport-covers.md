---
id: 372
title: Build platform VSIXs for the targets serialport covers
type: chore
priority: P2
effort: M
model: sonnet
area: [serial]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [371, 345, PLT-22]
created: 2026-10-25
---

CI builds one VSIX per target the spike found covered, each with the right `serialport` prebuild and the adapter bundle, and publishes the matrix of covered and uncovered targets.

**Code:** `vsslicer/modules/apps/printers-serial/ (ci)` (module: `printers-serial-extension`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] One VSIX per covered target passes the VSIX content assertion and contains only that target's prebuild
- [ ] A smoke test loads `serialport` from each built VSIX's bundle on its own OS runner
- [ ] The uncovered targets list is generated from the matrix and shown in the README

## Tasks

- [ ] Target list from the spike
- [ ] Package per target
- [ ] Smoke test
- [ ] README matrix

## Progress

Not started.
