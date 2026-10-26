---
id: 129
title: Check resolved values for 20 Cura tuples against the oracle
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US19
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [21, 31, 135]
created: 2026-10-25
---

Compares resolved values with the Cura stack order using `profile-api` merge and overrides.

**Code:** `vsslicer/modules/profiles-cura/test/tuples/` (module: `profiles-cura`, layer: n/a (fixtures and tests))

## Acceptance criteria

- [x] At least 20 tuples equal the oracle chosen by the oracle spike; stack order definition, extruder, variant, quality, user proven
- [x] A seeded merge-order bug makes the suite fail
- [x] Fixtures only (D5)

## Tasks

- [x] Pick the tuples
- [x] Produce the oracle values
- [x] Write the comparison tests

## Progress

Not started.

Done (sp11-prf-129, 2026-10-26).

- **Oracle:** `fixtures/profile-research/oracle.md` (PRF-21) covers no Cura CLI, so Cura uses a hand merge like Bambu
  and Prusa: `test/tuples/cura_oracle.py`, an independent Python reading of the Cura@5bea2f8 data files written from
  Uranium@e65ccc1 `DefinitionContainer.py:271-303,513-534`, `ContainerStack.py:294-305`, Cura@5bea2f8
  `CuraContainerStack.py:412-431`, `ExtruderStack.py:135-160`, `CuraApplication.py:415`. It imports no Cura code. Every
  expected value in `test/tuples/golden/cura.json` carries its upstream `file:line` (a sample of 7 checked by hand against
  the clone). The oracle refuses keys with `resolve` or `limit_to_extruder` (GlobalStack.py:227-242) and keys a material
  container sets (XmlMaterialProfile.py:1148-1173, :1202), because the material, intent, quality_changes and
  definition_changes slots stay empty here.
- **Tuples:** 22 (UM S5 x3, S3, UM3, UM2+, Factor 4, Ender-3 x2, CR-10S, Sidewinder X1, Voron 2 250, V-Core 3, SV06,
  Neptune 4, Adventurer 3, KP3S, Mingda D2, Bluer, VzBot 235, Ghost 5, X5SA), 18 keys each (9 global, 9 per extruder). User
  containers are synthetic and stored in the golden file. Fixtures: 123 upstream files, unmodified (1.1 MB), LGPL-3.0, in
  `test/tuples/fixtures/` with `PROVENANCE.md`.
- **Tests** (`test/tuples/tuples.test.ts`, 34): each tuple is read through `readCuraResourceFolder`, `readCuraResources`
  and `readCuraQualities`. For each key it checks `curaStackValue`, a profile-api `merge` of the slot chain and the list
  of slots that set the key against the oracle. Six order steps are each proven by a key set in both slots with
  different values (global def < extruder def < variant < quality < user, global def < global quality < global user).
  A global-only key ignores a different extruder-stack value. Seeded order bugs (user/quality, quality/variant and
  variant/definition swapped, the two stacks swapped) each change some value. profile-api `applyOverrides` is not used:
  Cura has no conditional blocks, and its definition `overrides` are applied inside `readCuraResources`.
- **Mutation probes** (each restored, cmp-checked):
  - `CURA_STACK_SLOTS` quality and variant swapped: 4 failed.
  - user moved below quality: 15 failed.
  - `curaStackValue` walking the stacks in reverse: 26 failed.
  - user containers dropped: 24 failed.
  - every key read through both stacks (scope removed): 1 failed.
  - one golden value changed (330 to 331): 1 failed.
  - golden cut to 19 tuples: the count test failed.
- **Verified** (macOS arm64 locally; CI gate ubuntu-latest): `pnpm install` ok. `eslint .` and `tsc -p tsconfig.test.json`
  clean. `pnpm build` ok. `pnpm test`: 10 files, 159 tests pass. `node scripts/run.mjs checks`: exit 0, 84 pass, 0 fail.
  `prettier --check .` flags only `src/index.ts`, which is unchanged from HEAD (PRF-127's commit), so `pnpm lint` fails on
  it until the coordinator formats it. One run of `curaprofile-archive.test.ts` (the 16 MiB bound) failed under load; it
  passed alone and on the rerun, and the file is not this card's.
- **Files:** `test/tuples/{tuples.test.ts,cura_oracle.py,golden/cura.json,fixtures/**}` (new), `.prettierignore`
  (+`test/tuples/fixtures`, `test/tuples/golden`). Notes: `.reference/notes/PRF-129-cura-tuples.md`.

Release lines:
- CHANGELOG (Unreleased, Tests): "Check 22 Cura tuples (definition, extruder, variant, quality, user) against a hand merge of
  Cura@5bea2f8 resources (PRF-129)."
- No export changes.

**Review passed (sp11-rev-prf-129)**

- **Ran** (macOS arm64): `pnpm install` ok; `pnpm build` ok; `pnpm test` 10 files, 159 tests, all pass on the
  rerun (in the first run, under load next to `run.mjs checks`, `curaprofile-archive.test.ts` 16 MiB bound failed
  once; it passed alone, 25/25, and in the full rerun; not this card's file); `test/tuples` 34/34;
  `node scripts/run.mjs checks` exit 0. `pnpm lint`: eslint and tsc clean, prettier flags only `src/index.ts`, which
  has no diff against HEAD (from PRF-127's commit), so it is not this card's problem. The coordinator should format it.
- **Oracle:** read `cura_oracle.py` in full; it imports no Cura code. Ran it (`python3 -I`, the module's own script)
  on the module's `test/tuples/fixtures` into scratch: the golden file it wrote is byte-identical to
  `golden/cura.json`. The 123 fixtures are `cmp`-identical to `.reference/repos/Cura@5bea2f8:resources/`. All 356
  non-synthetic `source` lines in the golden file name their key at that line of the upstream file. Cited upstream lines
  checked: Uranium@e65ccc1 `ContainerStack.py:294-305`, `DefinitionContainer.py:203-205, :271-303`, Cura@5bea2f8
  `CuraContainerStack.py:412-431`, `ExtruderStack.py:135-160`, `XmlMaterialProfile.py:1148-1173`. They say what the
  card claims.
- **Mutation probes on src** (each restored, `cmp`-checked, `git diff -- src` empty after):
  - `read.ts:342` parent override beats child: 4 failed.
  - `read.ts:351` tree beats override: 23 failed.
  - `CURA_STACK_SLOTS` quality and variant swapped: 4 failed.
  - `curaStackValue` walking the stacks in reverse: 26 failed.
  - `quality/read.ts:130` `=x` no longer read as a formula: 3 failed.
- **Criteria:** 22 tuples x 18 keys; the six order-step tests and the global-only test have real cases in the golden
  file (slots that win: global.definition 248, extruder.definition 61, extruder.variant 25, extruder.user 21,
  global.user 19, global.quality 14, extruder.quality 8). The seeded order bugs fail. Only fixtures and tests are added
  (D5); there are no src changes, so layering is unaffected. There are no wall-time asserts, and the card adds no
  parser, so no hostile probes are needed.
- **Notes, not blocking:** the oracle's `MATERIAL_KEYS` is a subset of `XmlMaterialProfile`'s setting map (it lacks
  the anti-ooze and break keys). None of the 18 keys is in that map, so the guard holds for these tuples. The material
  slot stays empty, which the card already states.
