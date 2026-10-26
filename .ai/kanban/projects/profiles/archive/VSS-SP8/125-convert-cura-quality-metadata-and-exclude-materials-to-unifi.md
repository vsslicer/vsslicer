---
id: 125
title: Convert Cura quality metadata and exclude_materials to unified conditions
type: feature
priority: P0
effort: S
model: sonnet
area: [evaluator]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [121, 135]
created: 2026-10-25
---

The Cura rows of the §6 conversion table: quality metadata `definition`/`variant`/`material`/`quality_type` and `exclude_materials`.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/conditions/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] Quality metadata converts to `printer.model == X and nozzle.id == '..' and material.base == '..'`; `exclude_materials` to `material.base not in [...]`
- [x] Every output parses and evaluates with the `profile-api` parser (release 0.1.0)

## Tasks

- [x] Write the converters
- [x] Write the tests

## Progress

Not started.

Review (sp8-reviewer-3, 2026-10-26 07:40): FAIL

Ran: `pnpm test` (12 passed), `pnpm lint`, `pnpm build` in `profiles-cura`; `node scripts/run.mjs checks` (exit 0). Layer and imports are fine. The hostile probe passes: names with quotes, backslashes, newlines, control characters and operators keep their meaning in both converters, and 2000 to 1 000 000 entries of 256-character names stay under 60 000 characters and parse. The local `quoteLiteral` and the 60 000 constant are acceptable for 0.1.0. The failure is semantic: real Cura data changes meaning while the output reports `lossy: false`.

1. `src/adapters/conditions/quality-conditions.ts:68-92` (`convertExcludeMaterials`): upstream `exclude_materials` is a substring match, not set membership. `MachineNode.isExcludedMaterialBaseFile` returns true when `exclude_material in material_base_file` (`Cura@5bea2f8:cura/Machines/MachineNode.py:222-227`), and it is called with the material's `id` (`cura/Machines/VariantNode.py:62-63`). Real definitions list prefixes such as `"dsm_"`, `"Essentium_"`, `"polymaker_"` and `"bestfilament_"` (`resources/definitions/ultimaker_sketch.def.json:12-15`). Measured against `fdm_materials@0c05969` (281 materials): in 39 of the 53 definitions that have `exclude_materials`, `material.base not in [...]` excludes a different set, 1 585 exclusions instead of 3 154, still with `lossy: false`. Fix: emit a substring test the parser supports, e.g. `material.base !~ /(dsm_|Essentium_)/` with every entry regex-escaped and length-bounded (profile-api has `!~`, `lexer.js:4`). Otherwise keep `not in` but set lossy and add a diagnostic for every entry that is a proper substring of a known id. Add a test with a prefix entry (`'polymaker_'` must exclude `'polymaker_pla'`).
2. `quality-conditions.ts:28,46` (`WILDCARD` including `fdmprinter`): `definition = fdmprinter` is not a wildcard upstream. A machine without `has_machine_quality` uses only `fdmprinter` qualities, and a machine with it uses only its `quality_definition` qualities (`MachineNode.py:45-46,258-260`, `MaterialNode.py:73-90`). Dropping the clause makes `fdmprinter` qualities match every printer, still with `lossy: false`. `printer.model` also has to be the machine's `quality_definition`, not its own id. Fix: mark `fdmprinter` lossy with a diagnostic (or return it as a separate field, as `qualityType` is) and document the `quality_definition` mapping for callers.
3. `quality-conditions.ts:28`: `global`, `empty`, `empty_variant` and `empty_material` as wildcards are unsourced. None appears as a `definition`, `variant` or `material` value in `Cura@5bea2f8:resources/quality/**/*.inst.cfg`; there, 781 files carry `global_quality = True` instead, which the converter ignores. Cite where each wildcard comes from or drop it, so a real id named `global` is not silently ignored. Also expose `global_quality` the way `qualityType` is exposed. The wildcard filter should not apply to `quality_type` either (`:56`).
4. `docs/research/profiles.md:242` calls the `exclude_materials` row "exact". It is not (finding 1); correct it together with the fix.

Not blocking: the per-entry repeated "condition too long" diagnostic (`:84-86`), the absolute `/Users/jkiraly/...` path in `test/quality-conditions.test.ts:84` (always skipped in CI), and the `package.json`/lockfile edit, which the coordinator should confirm. Same notes as PRF-124.

Review (sp8-reviewer-10, 2026-10-26 07:56): FAIL

Ran: `pnpm test` (15 passed, the real-resource tests included), `pnpm lint`, `pnpm build` in `profiles-cura`; `node scripts/run.mjs checks` (exit 0). Layer, imports and test hygiene (no wall-time asserts, relative `.reference` path) are fine. Round-1 findings 1, 3 and 4 are fixed; finding 2 is fixed for `definition` but the same machine-flag problem remains for `variant` (new finding 1 below).

Verified against Cura@5bea2f8, Uranium@e65ccc1 and fdm_materials@0c05969: `MachineNode.py:45-46` (`has_machine_quality` via `parseBool`, `quality_definition` default own id, else `fdmprinter`), `MachineNode.py:222-227` (substring), `VariantNode.py:63` (called with `material["id"]`), `MachineNode.py:258-260` (`global_quality = "True"`), `Uranium UM/Util.py:12` (`parseBool`), `Uranium UM/Settings/ContainerQuery.py:173-179` (exact, case-sensitive `str()` match, so `'True'` or boolean `true` is right for `global_quality`). Hostile probe (scratch, removed): each of `\ ^ $ . * + ? ( ) [ ] { } | / - ' " \n \r \t`, U+2028, NUL, an emoji, `\/`, `/ or true or /`, `\d`, `a{2}`, alone, embedded and tripled, parses and matches only literally (`a.b` does not exclude `aXb`, `[a-c]` not `b`, `a|b` not `a`); profile-api's lexer (`new RegExp`, no flag) and NFA (`u` syntax, `SAFE_ESCAPE` includes `/` and leaves `-` unescaped) both accept the escaping. Chunking: entry lengths 1..192 and 96-dot entries (escape doubles them) never exceed the 200-character pattern; 32 clauses parse and still take 32 more `and`s before the depth-64 cap, and wrap in parentheses with a quality condition. Size: 1 000 000 entries in 160 ms with 2 001 diagnostics; condition at most ~6.8 KB. Quality literals with `' or true or '`, `\`, newline stay literal.

Documented limit (material `id` vs `base_file`): acceptable. Printer-specific ids are `base_file + "_" + machine_id [+ "_" + hotend]` (`Cura@5bea2f8:plugins/XmlMaterialProfile/XmlMaterialProfile.py:716,757,954,1011`), so testing `material.base` can only under-exclude, never over-exclude; against fdm_materials@0c05969 no `exclude_materials` entry of the 53 definitions matches only through the `_<machine>` suffix.

1. `src/adapters/conditions/quality-conditions.ts:40-46,64` and `docs/research/profiles.md:241`: the `variant` clause is wrong on machines without `has_variants`. With `has_variants` false Cura looks qualities up by `definition` and `material` only (`Cura@5bea2f8:cura/Machines/MaterialNode.py:90`, and the fallback at `:99`), and with `has_materials` false by `definition` only (`:77-78`), so the quality's `variant` (and `material`) keys are ignored. Real data hits it: 408 non-global quality files carry a `variant` while their machine has `has_machine_quality` and no variants, across 15 definitions (`rigid3d_hobby`, `rigid3d_mucit`, `geeetech_A30M`, `geeetech_I3ProC`, ...; `rigid3d_hobby` shares `quality_definition` `rigid3d_base`). We emit `nozzle.id == '...'`, `lossy: false`, and the doc row says "exact". Fix, either: take the machine's flags (or a `{ hasVariants, hasMaterials }` argument) and omit the `nozzle.id` / `material.base` clauses Cura would ignore, with a test on a `rigid3d_hobby`-style case; or document beside `curaQualityDefinition` and in the doc row that the clauses hold only when `has_variants` / `has_materials` are true, and let a helper say which apply. Either way the doc row stops saying "exact" without that condition.

Not blocking: `curaQualityDefinition` needs the definition's metadata resolved through `inherits` (most machines get `has_machine_quality` from a parent); say so in its JSDoc. The doc's fallback citation `MaterialNode.py:92-100` covers only the start of the fallback (it runs to `:125`, GUID lookup included). The doc's "(unverified for printer-specific material ids)" can now cite the XmlMaterialProfile lines above. The `package.json`/lockfile edit (adding `@vsslicer/profile-api ^0.1.0`) is for the coordinator to confirm.

Fix (PRF-125-fix2, 2026-10-26 08:02): blocking finding 1 and the non-blocking notes.

- `convertQualityMetadata(meta, machine: CuraMachineFlags)` now takes the machine flags (required). Clauses follow `Cura@5bea2f8:cura/Machines/MaterialNode.py:73-90`: `variant` only with `hasVariants`, `material` only with `hasMaterials`, and only `definition` without `hasMachineQuality`. Ignored keys are not lossy (Cura ignores them too).
- New `curaMachineFlags(meta)` parses `has_machine_quality` (default false), `has_variants` (default false), `has_materials` (default true) like Uranium `parseBool` (`MachineNode.py:43-46`, `Uranium@e65ccc1:UM/Util.py:12`); `curaQualityDefinition` reuses it. Both JSDocs say `meta` must be resolved through `inherits`.
- Tests: all 8 flag combinations, flag parsing/defaults, and a real `rigid3d_hobby` case (metadata merged with parent `rigid3d_base`, quality `rigid3d_base/abs/rigid3d_base_abs_low.inst.cfg` with `variant = 0.4mm Nozzle` gives `printer.model == 'rigid3d_base' and material.base == 'generic_abs'`; skipIf `.reference` absent, relative path). `pnpm test` 25 passed, `pnpm lint`, `pnpm build`, `node scripts/run.mjs checks` exit 0.
- `docs/research/profiles.md:241` now states the flag condition (no longer unconditionally exact) and cites the fallback as `MaterialNode.py:92-125`; `:242` replaces "(unverified for printer-specific material ids)" with the `XmlMaterialProfile.py:716,757,954,1011` citation.
- Files: `vsslicer/modules/profiles-cura/src/adapters/conditions/quality-conditions.ts`, `vsslicer/modules/profiles-cura/test/quality-conditions.test.ts`, `docs/research/profiles.md`.

For the coordinator, `src/index.ts`:

    export {
      MAX_EXCLUDED_MATERIALS,
      MAX_REGEX_CLAUSES,
      MAX_VALUE_LENGTH,
      convertExcludeMaterials,
      convertQualityMetadata,
      curaMachineFlags,
      curaQualityDefinition,
      quoteLiteral,
    } from './adapters/conditions/quality-conditions.ts';
    export type {
      ConditionConversion,
      CuraMachineFlags,
      QualityConversion,
    } from './adapters/conditions/quality-conditions.ts';

CHANGELOG `## Unreleased`: "Cura quality metadata and `exclude_materials` convert to unified conditions (`convertQualityMetadata`, `curaMachineFlags`, `curaQualityDefinition`, `convertExcludeMaterials`); quality clauses follow the machine's `has_variants`/`has_materials`/`has_machine_quality`." Dependency: `@vsslicer/profile-api ^0.1.1` (already set by the coordinator).

Review (sp8-reviewer-11, 2026-10-26 08:06): PASS

Ran: `pnpm test` (25 passed; the four real-resource tests ran, not skipped), `pnpm lint`, `pnpm build` in `profiles-cura`; `node scripts/run.mjs checks` (exit 0). Only `src/adapters/` and the new test are touched in the module; `package.json`/lockfile/`src/index.ts`/CHANGELOG show no worker diff.

Round-2 finding 1 is fixed. Checked against Cura@5bea2f8: `MaterialNode.py:73-90` (no `has_machine_quality` -> `definition = fdmprinter` only; no `has_materials` -> `quality_definition` only; else `variant` only with `has_variants`, plus `material = base_file`) matches `quality-conditions.ts:90-93` for all 8 flag combinations, which the test enumerates. Defaults `has_materials` "true", `has_variants` "false", `has_machine_quality` "false" (`MachineNode.py:43-45`) match `:45-47` and `fdmprinter.def.json:12-14`; `parseBool` matches `Uranium@e65ccc1:UM/Util.py:5-12` (JSON `null` gives false in both). Uranium merges parent metadata on load (`UM/Settings/DefinitionContainer.py:273`), so the "resolved through `inherits`" JSDoc is right. `rigid3d_hobby` inherits `rigid3d_base` (`has_machine_quality`, `has_materials`, no `has_variants`), `quality_definition: rigid3d_base`; the test's expected `printer.model == 'rigid3d_base' and material.base == 'generic_abs'` is what Cura looks up. The cited `XmlMaterialProfile.py:716,757,954,1011` lines are the `_ + machine_id [+ _ + hotend]` id constructions. `docs/research/profiles.md:241-242` now condition "exact" on the flags and name the unmodelled `MaterialNode.py:92-125` fallback.

No regression: substring `!~ /.*(?:...).*/`, the `u`-safe escaping, the 2000-entry, 256-character and 32-clause bounds and their tests are unchanged from the version sp8-reviewer-10 probed.
