---
id: 45
title: Run admesh as the oracle in CI
type: chore
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [44]
created: 2026-10-25
---

Installs the admesh CLI in CI and diffs its report with `MeshStats` on every fixture.

**Code:** `vsslicer/modules/mesh/test/oracle/` (module: `mesh`, layer: n/a (ci))

## Acceptance criteria

- [ ] CI runs admesh and fails on a mismatch
- [ ] A mutated edge counter fails the comparison (meta-test)

## Tasks

- [ ] Install admesh
- [ ] Compare
- [ ] Meta-test

## Progress

Not started.
