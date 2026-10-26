---
id: 36
title: "Generate 1, 5 and 20 million triangle STLs in CI"
type: chore
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [PLT-13, 34]
created: 2026-10-25
---

Synthetic large STLs through `tools/generate-large-fixture`, cached by CI, not committed.

**Code:** `vsslicer/tools/generate-large-fixture` mesh generator (module: `mesh`, layer: n/a (ci))

## Acceptance criteria

- [x] Deterministic generators for 1, 5 and 20 M triangles (sphere or noise mesh) with a seed
- [ ] CI caches the output
- [ ] `tools/check-fixtures` passes

## Tasks

- [x] Add the generator
- [ ] Cache in CI

## Progress

Done: `vsslicer/modules/mesh/scripts/generate-large-fixture.mjs <triangles> <out.stl> [seed]`, run with `pnpm fixture:large <triangles> <out.stl> [seed]`. Closed bumpy sphere (seeded LCG), binary STL, streamed in 20000-triangle chunks, so memory stays flat. The count is the nearest the sphere grid allows (1M gives 999996; the header holds the exact number). Placed in the mesh module rather than `vsslicer/tools/` because the architecture keeps code in modules and `tools/` does not exist.
Verified: 1M run took about 1 s; two runs with the same seed are byte-identical (cmp); file size equals 84 + 50 x header count. Generated file was in scratch and not committed. 5M and 20M not generated (same code path); lint, build, test pass.
Not met: "CI caches the output" and "Cache in CI": blocked on PLT-9 (Q7, no GitHub remote). `tools/check-fixtures` does not exist, so that criterion is unticked too.
Files: vsslicer/modules/mesh/scripts/generate-large-fixture.mjs, vsslicer/modules/mesh/package.json (script `fixture:large`).
Changelog: VWR-36: `pnpm fixture:large` writes a deterministic seeded binary STL of about 1, 5 or 20 million triangles.
Review failed (vwr4436-reviewer): the output is NOT a closed mesh. Probe: `generate-large-fixture.mjs 1000000 a.stl 1`, then weld + computeStats gives openEdges 4008 (nonManifold 0, degenerate 0); volume -4196 (negative = inward winding). Cause: scripts/generate-large-fixture.mjs:20-23 radius r depends on phi (sin(7*ph+ph0)) even at the poles (th=0 and th=pi, where sin(5*th+ph1) is nonzero), so each pole vertex differs per segment and the pole fans do not weld (about 4 open edges per segment, both poles). Fix: make the radius perturbation vanish at the poles (e.g. multiply by sin(th) or use the pole point once), and consider swapping triangle order so the volume is positive. Re-verify with computeStats: openEdges must be 0. Passed: determinism (same seed byte-identical, different seed differs), header 999996 equals file size 84+50n, memory flat (RSS 103 MB at 1M, 165 MB at 5M, 195 MB at 20M), placement in modules/mesh/scripts is within the architecture rules, fixture:large script in package.json, lint/build/test pass. CI criterion and check-fixtures stay waiting on Q7/PLT-9. CHANGELOG.md has no VWR-36 line yet.

Fix (vwr36-fix): poles are now a single exact vertex (0,0,±10) so the fans weld, and triangles are wound outward. New test `vsslicer/modules/mesh/test/large-fixture.test.ts` generates ~10k triangles in an os.tmpdir dir (removed after), welds, and asserts openEdges 0, nonManifoldEdges 0, volume > 0. lint, build, test pass (27 tests). Files: scripts/generate-large-fixture.mjs, test/large-fixture.test.ts. Changelog: unchanged from above.

Review passed (vwr364041-reviewer): 1M fixture (999996 tris) welds to openEdges 0, nonManifold 0, degenerate 0, volume +4196; lint/build/test/prettier pass; fix test present.
