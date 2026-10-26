---
id: 25
title: Read PrusaSlicer 2.x config and objects
type: feature
priority: P0
effort: M
model: opus
area: [3mf]
story: US6
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [20]
created: 2026-10-25
---

Reads `Slic3r_PE.config` as a raw INI blob and `Slic3r_PE_model.config` objects, volumes and per-object config.

Ported from `PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/3mf_legacy.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/prusa/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Objects, volumes (parts, modifiers) and per-object config match a golden hand-checked against PrusaSlicer 2.9
- [x] The raw INI blob equals the part's bytes
- [x] Notice and `Ported from` line present

## Tasks

- [x] Port object and volume parsing
- [x] Raw INI blob
- [x] Golden

## Progress

Not started.

**Dependency on VWR-11 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with VWR-11.

**sp11-vwr-25, 2026-10-26: done, to review.**

- `vsslicer/modules/3mf/src/adapters/prusa/readPrusa2.ts` (new, adapters): `readPrusa2: DialectReader` and
  `readModelConfig`. Ported from PrusaSlicer@30ef591:...Legacy/3mf_legacy.cpp with the Prusa Research notice; line
  references are to the released loader PrusaSlicer-2.9@b028299:src/libslic3r/Format/3mf.cpp (model config
  :2467-2575, `_generate_volumes` :2576-2726, object loop :937-1000, instances :2399-2444, unplaced objects dropped
  :1970-1979). Mesh objects become objects; build items and component-only objects (2.x instances 2..n) become
  instances, transform = component then item; volume triangle ranges split the mesh with vertices rebased,
  inside-out parts flipped, unnamed parts named `<object>`, `<object>_2`, ...; volume metadata except `name`
  (`volume_type`, `modifier`, `matrix`, `source_*`, settings) is the part config as written, part transform identity
  (2.x writes vertices in the object frame, :3298). `Slic3r_PE.config` goes to `rawConfig` with the part's own bytes;
  every other non-model part, `Slic3r_PE_model.config` included, is preserved.
- Bounds (rule 25): instances capped at 100000 per read (component fan-out); component nesting at 10 (upstream);
  config XML depth 64; per object the volume triangle and vertex ranges must not overlap (2.x writes disjoint blocks,
  :3283-3296), so copies never exceed the mesh. Anything refused throws `MalformedXmlError` and the dispatcher falls
  back to core with a notice.
- Not ported (shortcut comment in code): production paths (throw), unit factor, version-0 single-instance baking,
  2.4.0-alpha2 vertex compaction. No `material.extruder` mapping (the `extruder` key stays in config).
- Golden: `test/fixtures/real/fdm_roundtrip1.3mf` (written by PrusaSlicer-2.9.6, copied from
  PrusaSlicer@30ef591 `src/slic3r-shared/test/data/`, AGPL-3.0, PROVENANCE.md updated). Values derived by hand from
  its XML with an independent regex script by the 2.9 importer rules (2 objects; 2 and 4 volumes: ModelPart,
  NegativeVolume, ParameterModifier; 8 vertices / 12 triangles each; object config; instance offsets). PrusaSlicer
  2.9 itself was not run (never run upstream binaries); the owner-gated check stays with VWR-11. Raw INI blob: same
  `Uint8Array` as the part, 32562 bytes, sha256 56117a21...479057.
- Tests: `test/readPrusa2.test.ts`, 25 tests. Mutation probes (applied temporarily, source restored, each killed):
  flip removed, rebase removed, name suffix removed, triangle-overlap check, vertex-overlap check, instance cap,
  recursion cap 10->11, production-path check, model-type check, no-mesh-no-components check, triangle range check,
  compose order swapped, duplicate config id, invalid metadata type, volume outside object, metadata outside object,
  config depth cap, firstid integer loosened, volume metadata to first volume, object `name` kept in config, volume
  `name` kept in config, raw blob copied, print config also preserved, unplaced objects kept, no-config single
  volume broken, last-name-wins changed to first (survived at first, test added, then killed): 26/26 killed.
- Verification (macOS; the CI gate runs on ubuntu-latest): module `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok,
  `pnpm test` 17 files / 268 tests passed (one earlier run had 2 failures in opc.test.ts and readModel.test.ts on big
  real files that passed alone and on rerun: load from parallel agents, not this change); `node scripts/run.mjs
  checks` exit 0 (runner 84/84, check-licence, check-fixtures).
- Running notes: `.reference/notes/VWR-25-read-prusaslicer-2-x-config-and-objects.md`.

Release lines:
- `src/readProject.ts`: `import { readPrusa2 } from './adapters/prusa/readPrusa2.ts';` and add
  `readers: new Map([['prusa2', readPrusa2]])` (merge with the other cards' entries).
- `src/index.ts`: `export { MODEL_CONFIG, PRINT_CONFIG, readModelConfig, readPrusa2 } from './adapters/prusa/readPrusa2.ts';`
  and `export type { ObjectConfig, VolumeConfig } from './adapters/prusa/readPrusa2.ts';`
- CHANGELOG: `- Read PrusaSlicer 2.x projects: objects, volumes (parts, modifiers, negative volumes, blockers) and per-object and per-volume config from Slic3r_PE_model.config, and Slic3r_PE.config as a raw blob (VWR-25).`
- After wiring, `test/readProject.test.ts` "has a dialect and keeps its non-model parts" fails on
  fdm_roundtrip1.3mf because `Slic3r_PE.config` moves to `rawConfig`: change its check to
  `expect(kept.has(part.name) || p.rawConfig.has(part.name)).toBe(true)` (the Cura card's `Cura/*.cfg` hits the same).

**Review passed (sp11-rev-vwr-25), 2026-10-26.**

- Ran in `vsslicer/modules/3mf`: `pnpm install` ok, `pnpm lint` ok (eslint, prettier, tsc), `pnpm build` ok, `pnpm test`
  17 files / 271 tests, 270 passed, 1 failed: `test/worker.test.ts` (VWR-31, in doing, timeouts at 5 s and 60 s; it
  does not touch the prusa reader). `test/readPrusa2.test.ts` + `test/readProject.test.ts` alone: all pass.
  `node scripts/run.mjs checks` exit 0.
- Upstream check against `.reference/repos/PrusaSlicer-2.9/src/libslic3r/Format/3mf.cpp`: `_generate_volumes`
  (:2576-2726: range check, rebase, flip on negative volume, `name` last wins, `<object>`, `<object>_2` naming),
  object loop (:937-1000: object `name` from metadata, whole mesh as one volume without config), `_create_object_instance`
  (:2399-2444: start depth 1, fail above 10, `transform * component.transform` = component then item in 3MF row order,
  matching `composeTransforms(c.transform, at)`), `_handle_end_model` (:1970-1979: unplaced objects dropped). All match.
- Golden: checked by hand against the fixture's `Slic3r_PE_model.config` and `3dmodel.model` items (unzipped to a
  temp dir): 2 objects, names, volume ranges 0-11/12-23 and 0-11/.../36-47, types, extruders, object config and
  item offsets agree.
- Mutation probes (applied to the source, tests run, source restored and diffed): flip off, rebase off, `_n` suffix
  off, instance cap raised, triangle-overlap check off, vertex-overlap check off, compose order swapped, raw blob
  copied, recursion cap 10->11, object last-name-wins changed to first: all killed. Survived: (a) dropping `item.path`
  from the build-item `place` call (only the component `p:path` refusal is tested), (b) removing `['prusa2',
  readPrusa2]` from `src/readProject.ts` (no test reads a prusa2 file through the public `readProject`; Bambu has one
  in `test/readProject.test.ts`). Both are untested branches, not tests that cannot fail; follow-ups, not blockers.
- Hostile probes: triangle indices beyond the vertex list are refused by `readModel` (readModel.ts:217); copies per
  volume are bounded by the disjointness checks; fan-out bounded by the 100000 leaf cap with depth 10; config XML
  depth 64. Layering: adapters only, no VS Code, no cross-module imports. Notice and `Ported from` present.
- Release lines: wiring in `src/readProject.ts`, exports in `src/index.ts` and the loosened `readProject.test.ts`
  check are as the card says. The CHANGELOG line for VWR-25 is not in `CHANGELOG.md` yet.
- Minor, not ported and harmless for 2.x files: an object with an empty `name` attribute falls back to
  `object <id>` instead of upstream `<file>_<n>` (:2025-2026); an object whose config lists no volumes gets no parts.

