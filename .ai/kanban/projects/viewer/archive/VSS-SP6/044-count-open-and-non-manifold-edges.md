---
id: 44
title: Count open and non-manifold edges
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [43]
created: 2026-10-25
---

Edge-use counting on the indexed mesh to report open edges and non-manifold edges; no repair.

**Code:** `vsslicer/modules/mesh/src/domain/stats/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] Open and non-manifold edge counts equal admesh's report on every fixture
- [x] A closed cube reports zero of each

## Tasks

- [x] Edge map
- [ ] Tests against recorded admesh numbers

## Progress

Already done by VWR-43 (e553e7d): `computeStats` counts edge uses on the welded mesh (open = 1 use, non-manifold = 3 or more), skipping degenerate triangles. The cube and open-cube cases were already tested.
Added here: a test of three triangles on one edge (1 non-manifold edge, 6 open edges). No code change.
Not met: "equal admesh's report on every fixture". admesh is not installed and no admesh numbers are recorded, so the comparison is not done; the first criterion and the "tests against recorded admesh numbers" task stay unticked. Needs recorded admesh output per fixture (VWR-34 fixtures).
Verified: `pnpm lint && pnpm build && pnpm test` in modules/mesh, 20 tests pass.
Files: vsslicer/modules/mesh/test/build-mesh.test.ts.
Changelog: VWR-44: tests for non-manifold edge counting (the counting itself landed with VWR-43).
Review passed (vwr4436-reviewer): lint, build, 20 tests pass; the new test (3 fins on one edge: 1 non-manifold, 6 open) is correct by hand count; compute-stats.ts counts uses per welded edge as claimed. Independent probe: computeStats on a generated 1M sphere reported 4008 open edges, so open-edge counting detects real defects. Decision: passes with the admesh criterion and the 'tests against recorded admesh numbers' task left UNTICKED and carried as an owner/CI item (record admesh output per VWR-34 fixture on a machine where the owner installed admesh, then add the comparison test). Reason: the card's deliverable (counting, no repair) is met and tested, admesh is GPL and may not be run from an uninstalled upstream binary, so the gap is an external verification, not missing code. Note: CHANGELOG.md has no VWR-44 line yet.
