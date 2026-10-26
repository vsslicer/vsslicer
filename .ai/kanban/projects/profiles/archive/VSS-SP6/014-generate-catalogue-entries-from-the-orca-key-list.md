---
id: 14
title: Generate catalogue entries from the Orca key list
type: feature
priority: P0
effort: L
model: opus
area: [schema]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [12, PLT-13]
created: 2026-10-25
---

A script that reads `OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp` and emits one canonical entry for each of Orca's 804 FFF keys (D9), with type, default, bounds, enum and our own label; Orca/Bambu labels and tooltips may be ported with a provenance line per entry (D2).

**Code:** `vsslicer/modules/profile-api/tools/catalogue/` writing `vsslicer/modules/profile-api/src/domain/catalogue/data/orca.json` (module: `profile-api`, layer: n/a (tooling and generated data))

## Acceptance criteria

- [x] The script is deterministic: running it twice gives identical output; it reads the upstream file from `.reference/` or a pinned download and never runs upstream build scripts
- [ ] Output has 804 entries with a type and default each; every ported text has a `Ported from OrcaSlicer@09aa0114:path` line and the AGPL notice header is in the file
- [x] Entries validate against the E11 catalogue entry type
- [x] Verified on pinned sources only (D5)

## Tasks

- [x] Write the PrintConfig.cpp extractor
- [x] Map option types to catalogue types and units
- [x] Write labels and tooltips (ported with provenance or new)
- [x] Add the determinism test
- [x] Derive `src/domain/schema/defs.ts`'s per-extruder key list from the catalogue's `per_extruder` entries (reviewer note)

## Progress

Done. `tools/catalogue/generate.ts` (run `node tools/catalogue/generate.ts [<Orca checkout>]` from the module) reads
OrcaSlicer@09aa0114 `src/libslic3r/PrintConfig.cpp`, `Preset.cpp` and `PrintConfigConstants.hpp` as text from
`.reference/repos/OrcaSlicer` and writes `src/domain/catalogue/data/orca.json` (`{ notice, entries }`, AGPL notice,
804 entries, one `provenance: "Ported from OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:<line>"` each; 49 labels
generated from the key where Orca has none, marked in the provenance). Exported as `orcaCatalogue`
(`src/domain/catalogue/orca.ts`).

Count 804 = 770 literal `add()` keys (commented-out defs dropped) + 12 machine_max axis-loop keys + 3
`*_plugin_config_overrides` + 3 `gcode_remap_*` (lambda) + 19 `filament_extruder_override_keys` copies, less 3 keys
defined twice (later block wins per field). Matches features-bambustudio-orcaslicer.md's 804.

Verified: `pnpm lint && pnpm build && pnpm test` pass (254 tests). `test/catalogue-orca.test.ts` validates the
file against `catalogueSchema`, checks 804 entries, the notice and provenance, sample values, and (when the pinned
source is in `.reference`) that two runs are identical, match the committed file, and cover every `add()` key in the
FFF init functions. Ran the generator twice and `cmp`ed the output.

Not met: 4 keys have no default (`default_filament_profile`, `filament_ids`: empty vectors; `extruder`: none in Orca;
`filament_volume_map`: a cast enum), so criterion 2 stays unticked. Groups and homes come from key-name regexes plus
Orca's Preset.cpp lists (a `shortcut:` comment), not Tab.cpp pages; native names for Bambu/Prusa/Cura are not filled.

defs.ts: `PER_EXTRUDER_KEYS` is now the catalogue's 144 `per_extruder` keys. Behaviour change for the reviewer:
`retract_length` (Prusa's name, used by the PRF-4/5 fixtures) and `extruder_variant_list` (a list in the catalogue)
are no longer forced to keyed maps; the fixtures still pass.

Files: `tools/catalogue/generate.ts`, `src/domain/catalogue/data/orca.json`, `src/domain/catalogue/orca.ts`,
`src/domain/schema/defs.ts`, `src/index.ts` (one export line), `test/catalogue-orca.test.ts`, `tsconfig.json`
(`resolveJsonModule`), `tsconfig.test.json` (includes `tools`), `.prettierignore` (generated data). No dependencies
added; lockfile untouched. Notes: `.reference/notes/PRF-14-orca-catalogue.md`.

Changelog: Add the Orca catalogue (804 FFF keys generated from OrcaSlicer@09aa0114) as `orcaCatalogue`, and derive the per-extruder keys from it.

Review failed (prf14-reviewer): install, lint, build and test pass (254); count 804 confirmed by an independent grep at 09aa0114 (767 unique uncommented literal keys + 12 + 3 + 3 + 19); 20 random entries match the source on type, default, min/max and enum; the generator only reads files and runs regexes (no upstream code executed); `shortcut:` comment present (generate.ts:228). Findings:
1. Every literal-key provenance line number is wrong (0 of 767 correct, off by up to 118 lines; e.g. `post_process` cites :5882, its `add()` is at :5972). Cause: `tools/catalogue/generate.ts:140` strips `//` lines with `/^\s*\/\/.*$/gm`, and `\s*` eats the preceding blank lines, so 254 newlines vanish before `lineAt`. Fix: `/^[ \t]*\/\/.*$/gm`, regenerate, and add a test that each provenance line of a literal key contains `add("<key>"` / `add_nullable("<key>"`.
2. The notice in orca.json says the file "is distributed under the GNU Affero General Public License v3.0 or later". OrcaSlicer grants version 3 only (README.md:260, no "or later"), so the ported material cannot be relicensed "or later". Reword: our additions are AGPL-3.0-or-later; the ported OrcaSlicer material stays under AGPL-3.0, so the file as a whole is distributed under AGPL-3.0. (Porting itself is fine under D2.)
Accepted as is: the 4 keys without a default (criterion 2 stays honestly unticked; Orca gives none, or an empty vector on a material scalar); the defs.ts change (canonical keys are Orca's per D9, so Prusa's `retract_length` no longer being keyed is right; Orca's `retraction_length` is keyed); 576 KB orca.json in dist (tsc re-emits it pretty-printed; the source is 482 KB), acceptable for now.

Fix round (prf14-fix): generate.ts:140 now strips comments with `/^[ \t]*\/\/.*$/gm`, so provenance lines are the real `add()` lines; orca.json regenerated (twice, identical md5). New test `cites the line that defines each key` checks each entry's cited line (literal `add("<key>"`, or the axis/loop/lambda source). Notice reworded: ported Orca material stays AGPL-3.0 only, our additions AGPL-3.0-or-later, port allowed by D2. Lint, build pass; tests pass (a PRF-177 timing test in conditions-evaluate flaked once under load).
Changelog: Fix the line numbers in the Orca catalogue provenance and state that the ported Orca material stays AGPL-3.0.

Review passed (prf14-rereview): install/lint/build pass, 264 tests pass incl. the new line-citation test. 30 random cited lines checked against the pinned OrcaSlicer@09aa0114: all contain the key (the one loop key, machine_max_acceleration_x, cites its axis-loop source as designed). Regenerated twice in scratch: identical md5 to each other and to the committed orca.json. Notice: Orca material AGPL-3.0 only, our additions AGPL-3.0-or-later, port allowed by D2. generate.ts has no Bambu edits yet (PRF-15 card is still Not started), so the diff is PRF-14 only.
