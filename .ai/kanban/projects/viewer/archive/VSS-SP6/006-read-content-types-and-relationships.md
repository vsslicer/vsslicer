---
id: 6
title: Read content types and relationships
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [5]
created: 2026-10-25
---

Parses `[Content_Types].xml`, `_rels/.rels` and per-part relationships into the Package, preserving anything unknown verbatim.

**Code:** `vsslicer/modules/3mf/src/adapters/opc/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Defaults, overrides and relationships (including targets with relative paths) resolve on fixtures from Bambu, Orca, Prusa and Cura
- [x] Unknown relationship types and content types are kept, not dropped
- [x] Malformed XML gives the typed error

## Tasks

- [x] Parse content types
- [x] Parse relationships
- [x] Resolve targets
- [x] Tests on all four dialect fixtures when present, synthetic otherwise

## Progress

Done (criteria 2 and 3 met; criterion 1 only partly, see below). `src/adapters/opc/opc.ts` (adapter, depends on the `ZipArchive` port and saxes via `xml.ts`): `readContentTypes` (defaults by lower-cased extension, overrides by lower-cased part name), `readRelationships(zip, source)` (per-part `_rels/<name>.rels`, `''` for the package root; Id/Type/Target/TargetMode kept as written), `resolveTarget(source, target)` (absolute and relative targets, `.` and `..`), and `readPackage(zip)` which builds the `Package`: start-part relationship resolved to `rootModel`, every non-rels part with content type (fallback `application/octet-stream`), relationships and inflated bytes. Unknown relationship and content types are kept as written. Exported from `src/index.ts`.
Errors: any XML error or a Relationship missing Id/Type/Target is `MalformedXmlError` naming the part; a missing `[Content_Types].xml`, missing `_rels/.rels`, no start-part relationship or absent model part is `MissingRootModelError`.
Verified: `test/opc.test.ts` (synthetic cases plus the missing-root-model fixture) and a smoke test that reads two real files from the ignored research clones when present (Orca `OrcaCube_v2.3mf`, spec `booleans_operations.3mf`; both pass). `pnpm lint`, `pnpm build`, `pnpm test` (35 tests) and `check-fixtures.mjs` pass. No dependency added.
Not done: no Bambu Studio, PrusaSlicer or Cura file was read (no fixtures of those exist; only the Orca-family file and a spec example); targets are not percent-decoded; package-level relationships (thumbnail etc.) are available through `readRelationships(zip, '')` but not in `Package`, which has no field for them (VWR-3 type); `readPackage` inflates every part eagerly (the `Package` type holds bytes).
Changelog: VWR-6: read `[Content_Types].xml` and relationships into the `Package` (OPC adapter).


Review failed (vwr456-reviewer): criterion 1 is not owner-blocked. Real Bambu Studio (.reference/repos/BambuStudio/resources/calib/pressure_advance/pa_pattern.3mf, flowrate-test-pass1.3mf), Cura (.reference/repos/Cura/resources/meshes/*.3mf incl. Prusa-named beds) and Anycubic/Orca files exist locally; I read them with readPackage and all parse (OPC code itself is fine), but the smoke test only covers Orca + a spec file and the three Tasks are unticked. Add a smoke test over Bambu and Cura clones (skip when absent), tick the tasks and criterion. A true PrusaSlicer-produced file is still missing (say so). Depends on VWR-5 fix for the same eager-inflate memory issue.

Fix (vwr56-fix): smoke tests in `test/opc.test.ts` now also read Bambu Studio `calib/pressure_advance/pa_pattern.3mf` and `calib/filament_flow/flowrate-test-pass1.3mf`, plus every 3MF in `.reference/repos/Cura/resources/meshes/` (about 100 files, several Prusa-named beds); all parse and resolve a 3dmodel root. Skipped when the clones are absent. Criterion 1 is ticked on Bambu, Orca, Cura and Anycubic evidence. Caveat: no genuine PrusaSlicer-written 3MF exists locally (the Prusa-named Cura beds were not written by PrusaSlicer), so the Prusa dialect is unverified. `pnpm lint`, `build`, `test` (48) pass. Depends on the VWR-5 fix for the eager-inflate memory issue (zip bomb now bounded).

Review passed (vwr56-rereview): smoke tests run and pass on Orca, spec booleans, Bambu pa_pattern and flowrate-test-pass1, plus every Cura mesh 3MF (skipIf clone absent); tasks and criterion ticked; Prusa dialect honestly flagged unverified. Eager-inflate memory now bounded by VWR-5 fix.
