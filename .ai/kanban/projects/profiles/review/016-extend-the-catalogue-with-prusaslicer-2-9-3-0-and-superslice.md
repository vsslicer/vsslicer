---
id: 16
title: "Extend the catalogue with PrusaSlicer 2.9, 3.0 and SuperSlicer keys"
type: feature
priority: P0
effort: L
model: opus
area: [schema]
story: US6
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-16
depends_on: [14]
created: 2026-10-25
---

Maps PrusaSlicer `@b028299` (471 keys plus 178 legacy-only) and the 3.0 `@30ef591` definitions, plus SuperSlicer `@1f3d287` (893 keys, `.ui` groups), onto the canonical Orca names; keys with no Orca equivalent keep `prusa.` or `superslicer.` prefixes (D9).

**Code:** `vsslicer/modules/profile-api/tools/catalogue/` and `vsslicer/modules/profile-api/src/domain/catalogue/data/prusa.json` (module: `profile-api`, layer: n/a (tooling and generated data))

## Acceptance criteria

- [x] Every key of each pinned list is mapped to a canonical entry (with native name) or marked `native_only` with its dialect
- [x] Prusa-only keys carry `prusa.`; SuperSlicer-only keys carry `superslicer.`; Prusa 3.0 hardware namespace keys are tagged as pinned-to-`@30ef591` so a schema change fails a pinned test
- [x] Legacy-only Prusa keys are present and flagged `legacy`
- [x] Bounds (rule 25, upstream sources are untrusted data): the generator reads only pinned files under .reference, refuses a source file over 16 MiB, and scans with linear-time code (no backtracking regex over source text); it runs no upstream code

## Tasks

- [x] Extract Prusa 2.9 and 3.0 key lists
- [x] Extract SuperSlicer keys and `.ui` groups
- [x] Assign canonical names and prefixes
- [x] Pin the 3.0 keys with tags

## Progress

**Done.** Notes: `.reference/notes/PRF-16-prusa-superslicer-catalogue.md`.

- Pinned lists (FFF only; SLA, milling and CLI defs are out, as for Orca): Prusa 2.9 `PrintConfigDef::init_common_params`..`init_extruder_option_keys` at `b028299` (396 keys); Prusa 3.0 `defs.add` in ConfigCommon.cpp + ConfigDefsFDM.cpp (358), the 57 FFF keys only its legacy 2.x loader reads, and the hardware features of vendor.yaml and ValueMapBuilder.cpp at `30ef591` (445 names); SuperSlicer's same range at `1f3d287` (652 keys) with its `.ui` pages.
- Prusa 2.9: 308 names on Orca entries (168 same name, 140 in `PRUSA_RENAMES`, 22 lossy), 88 `prusa.` entries. Prusa 3.0: 311 on Orca entries, 46 `prusa.` entries native-only in `prusa3` (16 3.0-only keys, 30 `prusa.hw_<ns>_<feature>`); every 3.0 name has `pinned: PrusaSlicer@30ef591`, 55 have `legacy: true`. `PRUSA3_RENAMES` handles 3.0's reuse of `pressure_advance`. SuperSlicer: 310 on Orca entries, 49 on `prusa.` entries, 293 `superslicer.` entries, each citing its `.ui` page and group (264) or hidden (29); `SUPERSLICER_RENAMES` comes from SuperSlicer's own `to_prusa` export.
- Rule 25: new `tools/catalogue/cpp.ts` (linear tokenizer, bracket partners from one stack pass, forward-only scans, nesting/axes/calls/loop-key caps); `readSource` caps files at 16 MiB and refuses paths or links leaving the checkout; `outputs()`/`readPinned` refuse a checkout at another commit and read only the pinned files (the PRF-14/15 argv/env overrides are gone). The Orca and Bambu path uses the same tokenizer now (the regex `extract` is deleted). That fixed 104 missing units, 19 truncated tooltips and 5 enum orders/labels in orca.json, and adds 7 Bambu filament overrides (bambu.json 96 -> 103, 615 Bambu keys = E11's count).
- `generate.ts` `outputs()` is the only writer of orca.json (Bambu + Prusa 2.9 + 3.0 + SuperSlicer names); prusa.json and superslicer.json hold their own entries.

**Files:** `tools/catalogue/cpp.ts` (new), `tools/catalogue/prusa.ts` (new), `tools/catalogue/generate.ts`, `src/domain/catalogue/prusa.ts` (new), `src/domain/catalogue/superslicer.ts` (new), `src/domain/catalogue/data/{orca,bambu,prusa,superslicer}.json` (generated), `test/catalogue-prusa.test.ts` (new), `test/catalogue-orca.test.ts` and `test/catalogue-bambu.test.ts` (adjusted: orca.json now carries Prusa names; Bambu count 103).

**Verified:** in `vsslicer/modules/profile-api`: `pnpm lint` clean, `pnpm test` 318/318 (catalogue-prusa: schema, counts, prefixes, renames, pins, legacy flags, notices; hostile input: 16 MiB+1 file refused and 16 MiB read, `..` and symlink escapes refused, wrong commit refused, unterminated comments/strings, MBs of whitespace, 200k unclosed calls and statements, 100k-deep nesting refused, a 4 MB number, 100k axis keys without a table, Orca constants/loops/lambdas, hostile `.ui` and vendor.yaml, each under 3 s; on the pinned sources: two `outputs()` runs identical and equal to the committed files, every key of each pinned list assigned, every assigned name present upstream, 3.0 names at their cited lines, SuperSlicer renames at `to_prusa`, `.ui` citations), `pnpm build` ok.

**Not done / follow-ups:** `sheet.*`/`feeder.*` features sit on `printer_model` (E11 GROUPS has no group with `surface`/`feeder` homes; shortcut comment in prusa.ts). SuperSlicer graphs are stored as polygons. `support_material_style` maps to Orca `support_style`, not `support_type` as profiles.md §6 says (for PRF-20). `native_only` on a `prusa.` key shared with SuperSlicer names the prefix's dialect; entry.ts's comment ("exists in this dialect only") should say so.

### Coordinator: shared-file changes

- `src/domain/catalogue/index.ts`: add
  `export { prusaCatalogue } from './prusa.ts';` and `export { superslicerCatalogue } from './superslicer.ts';`
  (and in `src/index.ts`, if it lists catalogue exports by name, the same two names).
- `PROVENANCE.md`, table rows:
  - | `prusa.json` (134 entries); `native.prusa`, `native.prusa3` keys in `orca.json` | [PrusaSlicer](https://github.com/prusa3d/PrusaSlicer) 2.9.6 | `b028299c770b8380ee81c921a2867d522f288123` | `src/libslic3r/PrintConfig.cpp`, `src/libslic3r/Preset.cpp` | AGPL-3.0 (version 3, README.md:69) |
  - | (same) PrusaSlicer 3.0 alpha | [PrusaSlicer](https://github.com/prusa3d/PrusaSlicer) | `30ef59195e0f3ee6f270b185bb5f9fb5f349f81f` | `src/slic3r-domain/src/Slic3r/Domain/ConfigCommon.cpp`, `src/slic3r-domain/src/Slic3r/Domain/ConfigDefsFDM.cpp`, `src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/PrintConfig.cpp`, `src/slic3r-shared/src/Slic3r/Biz/Preset/ValueMapBuilder.cpp`, `resources/presets/prusa-research-fff/PrusaResearch/vendor.yaml` | AGPL-3.0 (LICENSE) |
  - | `superslicer.json` (293 entries); `native.superslicer` keys in `orca.json` and `prusa.json` | [SuperSlicer](https://github.com/supermerill/SuperSlicer) | `1f3d287e9be46caa83bc19c16c51c8abd0c211d6` | `src/libslic3r/PrintConfig.cpp`, `resources/ui_layout/default/{print,filament,filament_override,printer_fff,extruder}.ui` | AGPL-3.0 (version 3, README.md:101) |
  - Change the Bambu row's "(96 entries)" to "(103 entries)". Add to the prose: short hashes `PrusaSlicer@b028299`, `PrusaSlicer@30ef591`, `SuperSlicer@1f3d287` (`PRUSA_COMMIT`, `PRUSA3_COMMIT`, `SUPERSLICER_COMMIT` in `tools/catalogue/prusa.ts`), checked out in `.reference/repos/PrusaSlicer-2.9`, `PrusaSlicer`, `SuperSlicer`; copied: labels, tooltips, defaults, bounds, enum values, Copyright (C) Prusa Research and the PrusaSlicer, SuperSlicer and Slic3r authors.
- `CHANGELOG.md`: - PRF-16: PrusaSlicer 2.9 (b028299), 3.0 (30ef591, pinned, legacy-flagged) and SuperSlicer (1f3d287) native names on Orca entries, 134 `prusa.` entries in `prusaCatalogue` and 293 `superslicer.` entries in `superslicerCatalogue`, with AGPL-3.0 notices; the generator reads only pinned checkouts through a linear-time tokenizer with a 16 MiB file cap, which also fixes 104 units, 19 tooltips and 5 enums in orca.json and adds 7 Bambu filament overrides (bambu.json: 103 entries).
