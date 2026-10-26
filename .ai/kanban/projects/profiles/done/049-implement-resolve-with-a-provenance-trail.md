---
id: 49
title: Implement resolve with a provenance trail
type: feature
priority: P0
effort: L
model: opus
area: [store]
story: US22
milestone: "VSS:M2"
sprint: "VSS:SP13"
depends_on: [44, 135]
created: 2026-10-25
---

`resolve(printerInstance, material[], process) -> {unified, provenance}`: inheritance chains, `overrides` by `when`, per-extruder keys, and for every key which entity set it.

**Code:** `vsslicer/modules/profiles/src/application/resolve/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [x] For hand-built tuple fixtures shaped like the Prusa, Orca and Cura ones (small copies with PROVENANCE.md) `resolve` equals the expected values, including an H2C 0.4 nozzle + PLA Basic + 0.20 mm Standard shaped tuple, with provenance; the real-importer run is the extension's tuple test
- [x] Provenance lists, for each resolved key, the entity id (and override block) that last set it; a test changes one parent and the trail follows
- [x] Multi-material resolution handles two materials on a dual-nozzle instance fixture
- [x] Unresolved parent gives a diagnostic and the best-effort resolution
- [x] Bounds (added by PRF-49-worker, rule 25): at most 64 materials per call (caller input, more is refused), at most 64 toolheads per instance (the rest dropped with a diagnostic), at most 256 parent visits per entity chain so a diamond fan (`inherits: [a, b]` at every level) or a cycle cannot blow up (cycles and the overflow give a diagnostic, best effort); `__proto__` and `constructor` setting keys stay data in values and provenance

## Tasks

- [x] Build the chain per entity
- [x] Apply overrides with context
- [x] Record provenance
- [x] Tests on the tuple fixtures

## Progress

Not started.

PRF-49-worker (2026-10-26): done, ready for review.

Files (all new): `vsslicer/modules/profiles/src/application/resolve/{resolve.ts,index.ts}`,
`test/resolve/resolve.test.ts`, `test/resolve/fixtures/{bambu-h2c,prusa-mk4s,cura-s5}.json` + `PROVENANCE.md`.
Notes: `.reference/notes/PRF-49-resolve-provenance.md`.

`resolveTuple(reader, printerInstance, materials[], process) -> {unified, provenance, diagnostics}` over an
`EntityReader` (`get(kind, id)`, which `IndexedStore` satisfies). `unified` is the port's `ProfileParts<Settings>`;
`provenance` is `ProfileParts<Record<key, {kind, id, override?}>>`. Chains are linearised like profile-api's
`resolve` (parents depth first, entity last) but with diagnostics instead of throws; `overrides` (the last list in
the chain) go through profile-api `applyOverrides` in the context of the toolhead in question; printer part per
toolhead = model, nozzle, surface, instance, and keys that differ by value or source across toolheads become
`{"<slot>": v}` with provenance `<key>.<slot>`. Material i runs on toolhead i (toolhead 0 past the last: shortcut
comment in code). Not in scope: `when` compatibility (compatibleMaterials/Processes), the port's `native` part,
Cura `printer.model` = quality_definition.

Probes (each mutation applied to resolve.ts, `vitest run test/resolve`, then restored; all failed):
- C1 values: override blocks not applied -> the Bambu, Prusa, Cura, multi-material, context tests fail.
- C2 provenance: first setter wins -> tuple tests + "the trail follows a changed parent" fail; override index
  dropped -> tuple tests fail; overrides owner = entity itself, not the last list in the chain -> Prusa test fails.
- C3 multi-material: material context on toolhead 0 -> "each material resolves against its own toolhead" fails;
  no per-slot split -> that test, Cura, toolhead-bound and `__proto__` tests fail; split ignoring source -> mixed +
  Cura fail; toolheads not sorted by slot -> Cura test fails.
- C4 unknown parent: throw instead of diagnostic -> "an unknown parent gives a diagnostic" fails; unknown model
  throwing -> "an unknown model or nozzle" + cycle tests fail; cycle guard removed -> cycle test fails.
- Bounds: MAX_MATERIALS 65 and 63 -> "64 materials are accepted, 65 refused" fails (both); MAX_TOOLHEADS 65 and
  63 -> "64 toolheads are used, a 65th is dropped with a diagnostic" fails (both); MAX_CHAIN 257 and 255 -> "a chain
  of 256 parents resolves whole; at 257 the rest is skipped with a diagnostic" and "a diamond fan 30 levels deep
  stops after 256 parent reads" fail (both); cap removed -> both fail (diamond counted by reader.get calls, no time).
- Proto keys: hasOwn guard removed, fold provenance `{}`, combine provenance `{}` -> "`__proto__` and constructor
  setting keys stay data" fails each time.
- Other branches: `material.base` default removed -> Cura fails; surface layer, feeder context, `printer.instance`,
  settings flattened into the namespace each removed -> "condition context" test fails; diagnostic de-dup removed ->
  "an unreadable printer `when` on two toolheads is reported once" fails.

Verify: in `profiles`: `pnpm install`, `pnpm lint` clean, `pnpm build` clean, `pnpm test` 12 files / 123 tests passed
(16 new). `node scripts/run.mjs checks`: exit 0 (runner tests 84 pass, 0 fail; check-licence, check-fixtures clean).
CI gate platform: ubuntu-latest (nothing path- or OS-dependent; fixtures read via `import.meta.url`).

Release lines:
- CHANGELOG (profiles, Added): `resolveTuple(reader, printerInstance, materials, process)`: resolves a tuple to
  unified settings with a provenance trail (the entity and override block that set each key), per-toolhead keys as
  `{"<slot>": value}`, and diagnostics for unknown parents, cycles and missing entities (PRF-49).
- `src/application/index.ts`: `export * from './resolve/index.ts';`

**Review passed (PRF-49-reviewer)** (2026-10-26)

Ran in `profiles`: `pnpm install`, `pnpm lint` (eslint, prettier, tsc) clean, `pnpm build` clean, `pnpm test` 12 files /
123 tests passed (16 in `test/resolve`). `cd vsslicer && node scripts/run.mjs checks`: exit 0 (check-licence,
check-fixtures clean).

Criteria against the code:
- C1 tuple fixtures: Bambu H2C, Prusa MK4S, Cura S5 tests assert full `unified` and `provenance` by hand-worked
  values. Upstream citations checked read-only: `PrusaSlicer-2.9@b028299` PrusaResearch.ini :5276, :36345, :41225 are the
  named sections, `[filament:Prusament PLA @PG 0.6]` has `filament_max_volumetric_speed = 15.5`; `BambuStudio@79df7ae`
  H2C machine/process/filament files exist with the cited `inherits`; `Cura@5bea2f8` ultimaker_s5.def.json exists.
- C2 provenance + changed parent: "the trail follows a changed parent" test.
- C3 dual nozzle, two materials: multi-material test (per-slot maps, material 1 on the high-flow toolhead).
- C4 unknown parent: diagnostic + best effort test; unknown model/nozzle and cycle tests too.
- Bounds: tests assert exact caps (64/65 materials, 64/65 toolheads, 256/257 chain, diamond counted by reader reads,
  no wall time, no heap delta); the bound tests use literals, not constants from `src/`.
- Layering: `src/application/resolve/` imports only `@vsslicer/profile-api` and `../import/registry.ts` (same layer);
  no VS Code, no cross-module relative import. Lint passes.

Mutation probes (each applied to `resolve.ts`, `vitest run test/resolve`, file restored from a copy, diff clean after):
MAX_MATERIALS 65 / 63, MAX_TOOLHEADS 65 / 63 -> 1 fail each; MAX_CHAIN 257 / 255 and cap removed -> 2 fail each;
`hasOwn` guard removed, fold provenance `{}` -> 1 fail each; first setter wins -> 5 fail; override index dropped -> 4
fail; overrides never applied -> 6 fail; material context forced to toolhead 0 -> 1 fail; combine ignoring source -> 2
fail; throw on unknown parent -> 1 fail; diagnostic de-dup removed -> 1 fail; toolhead sort removed -> 1 fail;
`material.base` default removed -> 1 fail. Merge null semantics checked against profile-api `merge.ts:5-13` (null falls
through), which `fold`'s null skip matches.

Note for the coordinator (not blocking): recording provenance for a `null` value (`fold`, `v !== null` dropped) survives
every test: a child setting a key to `null` would claim a key whose value its parent set. The code is right; a
follow-up test card (profiles, application) would pin it. The release lines above (CHANGELOG, `src/application/index.ts`
export) are not applied yet: shared files, for the coordinator.

