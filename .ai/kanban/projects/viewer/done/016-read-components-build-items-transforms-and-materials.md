---
id: 16
title: "Read components, build items, transforms and materials"
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [15]
created: 2026-10-25
---

Resolves component trees, build items with transforms and base materials and colour groups into the Project model.

**Code:** `vsslicer/modules/3mf/src/adapters/model/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Component trees and 3x4 transforms resolve to the right world matrices on fixtures
- [x] Base materials and colour groups are attached to triangles or objects as specified
- [ ] Consortium positive cases for these features pass (no consortium sample .3mf is cloned in .reference; covered by generated models and 2 real Cura .3mf files)

## Tasks

- [x] Components and transforms
- [x] Build items
- [x] Materials and colours
- [x] Tests

## Progress

Done. `resolveProject(root, part?, load?)` in `src/adapters/model/resolveProject.ts` turns a `CoreModel` into a `Project` (dialect core): build items to `Instance`s (item transform kept on the instance), their objects to `ModelObject`s, components flattened to leaf `ModelPart`s with transforms composed (child first, then parent; row-vector order) via exported `composeTransforms`. Production `p:path` references resolve through the `load` callback; an external object whose id clashes gets the next free id. Base materials and colour groups give `Material.color`; per-triangle pid/p1 split a mesh into one part per colour (p2/p3 gradients ignored, documented shortcut). Cycles, missing objects/parts/groups and out-of-range indices throw `MalformedXmlError`.
Minimal change to VWR-15 files: `readModel` also reads object pid/pindex, triangle pid/p1..p3 (`triangleProps`), basematerials and materials-ns colorgroup (`propertyGroups`); `CoreObject` gained optional pid/pindex/triangleProps, `CoreModel` a required `propertyGroups`.
Verified: test/resolveProject.test.ts (generated models + 2 real Cura .3mf, skipped when absent), readModel tests, lint on my files, build. Full `pnpm test` had 2 failures in test/editPackage.test.ts (another worker's in-progress file) and prettier flags that file.
Not done: consortium sample files are not in .reference, so those positive cases are unchecked; p2/p3 gradients; textures/composites/multiproperties; ModelPart.extruder unset.
Files: src/adapters/model/resolveProject.ts (new), src/adapters/model/readModel.ts, src/domain/coreModel.ts, src/index.ts (one export line), test/resolveProject.test.ts (new).
Changelog: Added `resolveProject`: components, build items, transforms, base materials and colour groups resolved into a Project.

Review failed (vwr1516-reviewer): src/adapters/model/resolveProject.ts:52 cycle trail keys on bare object id, so valid production files where an ancestor and a p:path target share an id are rejected. Probe: root object 1 with component objectid=1 p:path=/3D/Objects/o.model (external file holds mesh object 1) -> MalformedXmlError 'component cycle or nesting too deep at object 1'. Ids are per-file in the Production extension; key must include the path (and the model, e.g. `${c.path ?? ''}|${id}`, tracking the file the object lives in). Add a test for it. Verified OK: transform order (child 10 then parent scale 2 -> 20, row-vector, item transform kept on instance), real cycles/self-cycles/missing refs/bad pid/bad index throw, diamond reuse OK, p:path via load callback and missing-load error, per-triangle pid split, build/lint/prettier/132 tests green. Unticked consortium criterion: acceptable as a documented partial once the bug is fixed (no samples cloned). propertyGroups required field: all constructors compile; fine.

Fix round (vwr1617-worker): the cycle trail in `flatten` now keys on (part, id), with the part each object lives in passed down (`c.path ?? file`), so root object 1 naming object 1 of `/3D/Objects/o.model` resolves. A production part the loader lacks now throws `MissingProductionPartError` (was `MalformedXmlError`). Tests added: the reviewer's same-id case, a cycle inside a production part still throws, missing part gives `missing-production-part` with its path. Verified: `pnpm lint && pnpm build && pnpm test` green (134 tests); reviewer probe `path same id` now gives `[[1,1]]`.

Review passed (vwr1617-reviewer): re-review of the cycle-key fix. The vwr1516 probe (root object 1 -> p:path object 1) resolves; a cross-file cycle (a.model <-> b.model, same ids) still throws MalformedXmlError (caught by the depth bound); lint, build and 153 tests green.
