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
