---
id: 393
title: Check the triangle cap while parsing OBJ and ASCII STL
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP7"
owner: sp7-mesh
docs: [.ai/audits/SP6-audit.md]
created: 2026-10-26
---

Module: mesh (application, adapters). Finding 4 of the SP6 audit, `.ai/audits/SP6-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] Fixed as the audit describes
- [x] A test that fails before the fix
- [x] Bounds (rule 25): parseObj and parseAsciiStl take hardTriangleCap and throw TooManyTrianglesError as soon as the triangle count passes it (one check per face or facet), before welding
- [x] Hostile test: one OBJ face line fanning past a small cap is refused before the parse finishes, with bounded memory

## Tasks

- [x] Fix as the audit describes

## Progress

Done: `parseObj` and `parseAsciiStl` take `hardTriangleCap` (default Infinity) and throw `TooManyTrianglesError` per triangle (OBJ, inside the fan loop, before pushing) or per facet (ASCII STL), before welding. `MeshParsers` and `parseModelWith` pass the cap through.
Files: src/adapters/obj/obj.ts, src/adapters/stl/ascii-stl.ts, src/application/parse-model.ts, test/triangle-cap.test.ts (new).
Verified: in vsslicer/modules/mesh, `pnpm lint`, `pnpm test` (55 pass), `pnpm build` all green. New tests fail without the fix (parse resolves instead of rejecting).
Not done: no RSS measurement on the 40M-triangle file.

### Coordinator: shared-file changes
CHANGELOG line: fixed: OBJ and ASCII STL parsers refuse files over the hard triangle cap while parsing.

Review (sp7-rev-a): PASS. Read the diff (obj.ts, ascii-stl.ts, application/parse-model.ts, test/triangle-cap.test.ts); no shared files touched; layers fine (adapters import domain only). `pnpm lint && pnpm test && pnpm build` green (55 tests). Probe (/private/tmp/claude-501/sp7w.3nRn/vwr393-probe.ts, src by absolute path): the audit's fan OBJ (one vertex, 100 lines of 400k corners, 76 MB) through `parseModel` with the default 10M cap fails with TooManyTrianglesError (10,000,001 > 10,000,000) in 1.6 s, RSS growth about 1.0 GB; the same at 300 lines (229 MB) grows by the same ~1.0 GB, so memory is bounded by the cap, not the file (audit: 2.49 GB peak, 6.4 s at 80 MB). Exactly at the cap passes and cap+1 throws for ASCII STL (7/8), OBJ (quad + tri at cap 3 passes, cap 2 throws), OBJ sniffed without extension; binary STL header check unchanged (cap 5 passes, 4 throws); soft cap still returns confirm-needed. The worker (adapters/worker-node/worker.ts) calls `parseModel`, so the cap reaches it. weld drops no triangles, so the early count equals the old late count. Note: no RSS assertion in the test suite (the small-cap test checks refusal only).
