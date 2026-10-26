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

- [x] CI runs admesh and fails on a mismatch
- [x] A mutated edge counter fails the comparison (meta-test)

## Tasks

- [x] Install admesh
- [x] Compare
- [x] Meta-test

## Progress

Done by sp11-vwr-45.

- New `vsslicer/modules/mesh/test/oracle/admesh.test.ts`: runs `admesh -e` (exact edge check, no repairs) as a subprocess on 5 corpus STLs (box binary/ascii/crlf/solid-header, cura-BIQU_BX_PLATE) and on boxes with 1, 2 and 5 triangles dropped (written to a temp dir); compares triangles, bounds, open edges (facets with k disconnected edges, weighted by k) and, for closed meshes, volume against `computeStats`. Meta-test: `openEdges + 1` and `openEdges: 0` each fail the comparison.
- Missing admesh: tests skip locally; with `VSS_REQUIRE_ADMESH=1` they fail. Gate runs on Linux (ubuntu-latest) only.
- Findings (admesh 0.98.5): default run repairs the mesh, so `-e` is needed. Degenerate triangles are NOT compared: admesh counts only coincident-vertex facets (collinear = 0) and counts a collinear facet's 3 edges as open, MeshStats skips them. Non-manifold edges are not in admesh's report (unverified oracle). Open-mesh volume differs by reference point, so volume is compared on closed meshes only.
- Changes outside the module's test dir: `.github/workflows/ci.yml` (Linux step before `run.mjs ci`: apt-get install admesh, set VSS_REQUIRE_ADMESH=1, only when `mesh` is among the changed modules). `package.json` unchanged.
- Mutation probes: `hits===1` -> `hits===2` in compute-stats: 6 of 7 oracle tests fail; `volume += 2*(`: 5 fail; VSS_REQUIRE_ADMESH=1 with admesh off PATH: 7 fail; without it: 7 skipped. Sources restored.
- Verify: mesh `pnpm lint` ok, `pnpm build` ok, `pnpm test` 90 passed, 1 skipped (existing); `node scripts/run.mjs checks` ok; ci.yml parses as YAML.

Release lines: none (test and CI only; CHANGELOG optional: "Test: admesh oracle for MeshStats (VWR-45)").

**Review passed (sp11-rev-vwr-45)**

- Ran in `vsslicer/modules/mesh` (admesh 0.98.5, /opt/homebrew/bin): `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok. `pnpm test`: 90 passed, 1 skipped (13 files). The first run had 2 `bvh.test.ts` failures under machine load; `bvh.test.ts` alone passes 4/4 and a full rerun is green. That file is not touched by this card. `test/oracle` alone: 7/7. `node scripts/run.mjs checks` ok.
- AC1: `.github/workflows/ci.yml` installs admesh with apt on Linux when `mesh` is selected, then exports `VSS_REQUIRE_ADMESH=1` before `run.mjs ci`. The test fails on any compare mismatch, and on a missing admesh when the env var is set.
- AC2: the meta-test asserts that `openEdges + 1` and `openEdges: 0` both fail `compare`.
- Mutation probes, run in a `mktemp -d` copy of the module:
  - `hits === 1` changed to `=== 2` in compute-stats: 6/7 fail.
  - volume `/6` changed to `/3`: 5/7 fail.
  - `openEdges++` only when more than 3: 1/7 fail (the missing-triangles test).
  - bounds `max[0] + 0.01`: 6/7 fail.
  - parser weight `2 *` changed to `1 *`: 1/7 fail.
  - admesh off PATH with `VSS_REQUIRE_ADMESH=1`: 7/7 fail ("admesh is not installed").
  - admesh off PATH without the env var: 7 skipped.
- Non-blocking notes, nothing to fix for this card:
  - `parseReport`'s `3 *` weight is never exercised. With it mutated to `1 *`, all 7 tests still pass, because no fixture has a facet with 3 disconnected edges. An isolated triangle would cover it, but it hits the degenerate and isolated case the card deliberately leaves out.
  - `join(dir.pathname, f)` gives `/C:/...` on Windows. It is harmless today because the gate runs on Linux only and the tests skip without admesh. Switch to `fileURLToPath(dir)` if admesh is ever installed on Windows.
- Layering: a test file only, using intra-module imports. It has an SPDX header, and admesh (GPL) is run as a separate process with no code reused.
