---
id: 17
title: Resolve Production sub-models and required extensions
type: feature
priority: P0
effort: M
model: opus
area: [3mf]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [16]
created: 2026-10-25
---

Follows `p:path` into sub-model parts, and treats unsupported required extensions as read-only with a notice. Needed because Bambu and Orca keep geometry in sub-models.

**Code:** `vsslicer/modules/3mf/src/adapters/model/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Objects referenced through `p:path` resolve across sub-models on the Bambu/Orca fixtures
- [x] A Production path to a missing part gives the typed error and message
- [x] A package requiring Slice, Beam Lattice, Volumetric, Boolean, Displacement or Secure Content opens read-only and the notice names the extension

## Tasks

- [x] Resolve p:path across parts
- [x] Handle required extensions
- [x] Tests

## Progress

Done (vwr1617-worker).
- `readProject(pkg)` (src/adapters/model/resolveProject.ts): reads the root model and each production part it reaches once (via `readModel`) and resolves through `resolveProject`; `p:path` works in components and build items, ids are per part (VWR-16 fix).
- `openPackage` (src/application/openPackage.ts) now walks every model reachable through `p:path` (not only the root): a missing part throws `MissingProductionPartError` naming the path, and each sub-model's own `requiredextensions` is checked. Known detect-only extensions (`DETECTED_EXTENSIONS`: Slice, Beam Lattice (+balls), Volumetric (+implicit), Boolean Operations, Displacement (both the 3mf.io and the microsoft.com namespace the consortium's own examples use), Secure Content) open with `readOnly` set to a notice naming them; replace/add/removePart then throw `InvalidPartEditError` "read-only". Unknown required namespaces still throw `UnsupportedRequiredExtensionError` (VWR-7 fixture unchanged).
- UUIDs: not read and not required, so files without `p:UUID` and Bambu's lowercase `p:uuid` both open (consumers must not error on conforming files; generated tests have no UUIDs).
Verified: `pnpm lint && pnpm build && pnpm test` green, 153 tests. test/production.test.ts: generated packages (component and item p:path, missing part from root and from a sub-model, sub-model unknown and Slice extension, each detected extension read-only with edits refused) and real files, skipped when absent: BambuStudio@79df7ae pa_pattern.3mf (1 object), OrcaSlicer@09aa0114 OrcaBadge.3mf (3 objects, sub-model with spaces in its name), PrusaSlicer@30ef591 production_ext.3mf (item p:path), 3mf-spec-booleans@7b70e6e and 3mf-spec-displacement@0e2d3fc examples open read-only naming the extension.
Not done: p:path is not percent-decoded (raw names, as Bambu/Orca write them); Production `alternatives` namespace not handled; non-root models using p:path are allowed rather than rejected.
Files: src/adapters/model/resolveProject.ts, src/application/openPackage.ts, src/application/editPackage.ts (read-only guard), src/index.ts (exports `readProject`, `DETECTED_EXTENSIONS`), test/production.test.ts (new), test/resolveProject.test.ts, CHANGELOG.md. Notes: .reference/notes/VWR-17-production-submodels.md.
Changelog: added under Unreleased (VWR-16 and VWR-17 lines).

Review passed (vwr1617-reviewer): readProject and openPackage ran on all 215 .3mf in .reference/repos with no throw and no zero-object result (3 read-only: spec booleans/displacement; Bambu pa_pattern 1 obj, Orca badge 3 obj with spaces in sub-model names, Prusa production_ext 1 obj). Read-only for the six known extensions plus unknown still refused matches the spec MUST NOT (3mf.md:55). Edit guard covers replacePart, addPart and removePart. Raw names with spaces work; percent-encoded p:path gives a typed MissingProductionPartError (documented as not done, no real file needs it). Lint, build, 153 tests green.
