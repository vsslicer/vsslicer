---
id: 390
title: Cap the parts and triangles resolveProject builds from nested components
type: bug
priority: P0
effort: S
model: sonnet
sprint: "VSS:SP7"
owner: sp7-3mf
docs: [.ai/audits/SP6-audit.md]
created: 2026-10-26
---

Module: 3mf (adapters). Finding 1 of the SP6 audit, `.ai/audits/SP6-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] Fixed as the audit describes
- [x] A test that fails before the fix
- [x] Bounds (rule 25): one counter across all flatten calls; refuse above 100,000 leaf parts or 10,000,000 leaf triangles with MalformedXmlError naming the part
- [x] Hostile test: the audit's 8-level 2.4 KB fan-out file is refused in under 1 s without growing the heap past 100 MB

## Tasks

- [x] Fix as the audit describes

## Progress

Done. resolveProject keeps one budget (visits, leaf parts, leaf triangles) across all flatten calls; above 100,000 parts/visits or 10,000,000 triangles it throws MalformedXmlError(part, "components expand to more than 100000 parts or 10000000 triangles"). Files: vsslicer/modules/3mf/src/adapters/model/resolveProject.ts, test/resolveProject.test.ts (8-level fan-out refused <1 s, heap growth <100 MB; under-cap resolves; triangle cap test, verified failing on the old code). Verified: pnpm lint clean, pnpm test 156 passed. Shared-file changes: none.

Review (sp7-rev-3mf): PASS. Probed resolveProject from src (node 24, scratch): 8-level x10 fan-out refused in 231 ms, +54 MB heap (load avg ~80); 9-level refused 63 ms; wide shallow (200,000 components of an empty object) refused via the visit counter; deep narrow 60 levels x2 refused; 65 x1 hits the depth check; 100 copies of a 200k-triangle mesh refused before any copy; per-triangle colour copies (1000 distinct colours x 1000 copies) refused at 66 ms, 99,900 parts under the cap resolve (+66 MB). Production fixtures and existing nested tests still resolve. lint clean. Risk, not a failure: the fan-out test's 1 s wall-clock bound covers two resolveProject calls plus parse and failed once at 1168 ms with machine load avg 76 (passed on rerun); consider timing one call. Also failing under that load, outside this card: zip.test.ts "deflate stream far bigger than its declared size" (5 s timeout).
