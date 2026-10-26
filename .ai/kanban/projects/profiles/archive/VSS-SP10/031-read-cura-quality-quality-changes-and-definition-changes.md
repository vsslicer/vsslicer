---
id: 31
title: "Read Cura quality, quality_changes and definition_changes"
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US13
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [30, 125, 135]
created: 2026-10-25
---

Quality files become `process` entities with a `when` condition from their metadata; user `quality_changes` and `definition_changes` import as user entities.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/quality/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] Golden count at Cura@5bea2f8: 6 011 quality files import; each carries its definition/variant/material/quality_type as a `when`
- [x] A fixture `quality_changes` and `definition_changes` pair imports as a user process and a printer_instance diff

## Tasks

- [x] Read quality metadata
- [x] Convert to `when`
- [x] Read the user change files

## Progress

**sp10-prf-31 (2026-10-26):** done. New `src/adapters/quality/read.ts` (`curaCfgOf`, `readCuraQualities`, `readCuraUserChanges`),
`readCuraResourceFolder` got an optional folder list (default unchanged), exports appended to `src/index.ts`, CHANGELOG line,
tests in `test/quality.test.ts` (21). Settings keep Cura keys, `=x` as `{expr}`, as PRF-30.
- Golden at Cura@5bea2f8: 6 011 quality files (not 6 010): `dagoma_sigma_0.8_pla_h0.6inst.cfg` is a container because
  Uranium's suffix is `inst.cfg` without a dot, matched from the first `.` (`UM/MimeTypeDatabase.py:180-190`, `InstanceContainer.py:45`)
  and its id loses the last character (`stripExtension`, `MimeTypeDatabase.py:100-111`): id `dagoma_sigma_0.8_pla_h0.6inst.cf`.
  All 6 011 have a `when` (618 definition only, 104 +nozzle, 360 +material, 4 895 all three); no error diagnostics.
- `when` uses PRF-125's `convertQualityMetadata`. Flags come from the quality's definition; a quality outside `fdmprinter`
  is treated as having machine quality whatever the definition says (probe killed). `quality_type`, `global_quality`, `weight`
  go to `native[id]` (docs/research/profiles.md keeps them apart from conditions), so the AC's "quality_type as a when" is
  met as metadata, not as a clause.
- `Process.layer_height` is required and > 0, but only 1 067 quality files set a number. Fallback: own, global quality of
  the same definition and quality_type, `fdmprinter`'s global, the definition's `value`/default when a plain number, else a
  0.1 mm stand-in (14 files whose only `layer_height` is a formula) with a warning and `native[id].layer_height_estimated`.
  Decision for the coordinator: stand-in vs dropping those 14 entities.
- User files: `quality_changes` becomes a Process (`when` = definition only; layer_height from the change, else the
  qualities result passed as 2nd argument, else stand-in); `definition_changes` a PrinterInstance diff (`model` = definition,
  `toolheads: []`, settings = changed values; the nozzle link lives in the stack file, not read here). Extruder `position`
  stays in `native`; per-extruder pairing with a global change is not done.
- Bounds (rule 25): same caps as PRF-30 per call (files, file bytes, total bytes), diagnostic cap, case/NFC/percent aliases
  of an id read once, user files flat only, dot names skipped, `__proto__` stays an own key; value regex anchored (linear).
- Mutation probes (each removed in place, restored, `cmp` clean; all FAIL as expected): machine-quality force, user base
  global lookup, fdmprinter global fallback, definition fallback, maxFiles, maxFileBytes, maxTotalBytes, NFC, lowercase,
  type mismatch, id last-char quirk, diagnostic cap, nested user files, version check, hidden names, and the
  estimated-global exclusion (survived first; added a test, now fails).
- Verify: `pnpm install`, `pnpm lint` clean, `pnpm build` clean, `pnpm test` 7 files / 101 passed (includes PRF-32's);
  `node scripts/run.mjs checks` exit 0.
- Left out: `intent/` files (641), stack-file linking of changes, evaluating formulas.

**Review passed (sp10-coordinator; review dispatch was refused by the permission classifier, so the coordinator, who wrote none of this code, reviewed)**: profiles-cura `pnpm lint` clean, `pnpm build` ok, `pnpm test` 7 files / 101 passed. Mutation probes on `src/adapters/quality/read.ts`, each restored (`cmp` clean): file cap off (`:71`) fails 1, diagnostics cap off (`:140`) fails 1, `layer_height_estimated` flag off (`:215`) fails 2, own numeric `layer_height` ignored (`:185`) fails 2 of 21 quality tests. Stand-in checked: Cura@5bea2f8 `resources/definitions/fdmprinter.def.json:822` `"default_value": 0.1`. **Decision:** the 0.1 mm stand-in with a warning and `native[id].layer_height_estimated` is kept for the 14 formula-only qualities (keeping them beats dropping them; the formula stays in settings). Not done, as recorded: `quality_type` in native, empty toolheads for `definition_changes` instances, per-extruder pairing of user changes.
