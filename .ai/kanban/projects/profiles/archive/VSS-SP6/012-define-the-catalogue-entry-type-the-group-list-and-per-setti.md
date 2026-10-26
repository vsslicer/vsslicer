---
id: 12
title: "Define the catalogue entry type, the group list and per-setting override scope"
type: feature
priority: P0
effort: M
model: opus
area: [schema]
story: US4
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [2]
created: 2026-10-25
---

Designs the shape of one catalogue entry (group, home entity, type, unit, enum, bounds, default, per-extruder flag, label, tooltip, native names per dialect, conversion, `hidden`) and records where each setting may be overridden (object, part, height range) for the VWR object-editing epic. Orca key names are canonical (D9).

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] The entry type covers every column of the epic's catalogue description plus `override_scope: [plate, object, part, height_range]`, `hidden`, `native_only`, `provenance` and a `prefix` for `prusa.`/`cura.`/`bambu.`/`superslicer.` keys
- [x] The group list is the 14 FFF groups of the epic table (`layers ... plate`), with `sla`/`milling` reserved and rejected for now
- [x] Conversion kinds are a closed set: identity, scale, sign flip, percent-of, enum map, split/join; each has a type and a test
- [x] A schema test rejects an entry with no group or home entity

## Tasks

- [x] Design the entry and conversion types
- [x] Write the group table
- [x] Write the validation tests

## Progress

Done, review fixes applied (prf12-fix). Original work: `src/domain/catalogue/entry.ts` (types, `GROUPS`, `RESERVED_GROUPS`, `KEY_PREFIXES`), `schema.ts` (`catalogueEntrySchema`, `catalogueSchema`), `index.ts`, `test/catalogue.test.ts`. Rationale for PRF-13..20 unchanged (map of unified key to entry, `native` per dialect with the conversion on the dialect, closed conversion set, prefix = first key segment, group -> home check, `overridable_in` vs `override_scope`); see .reference/notes/PRF-12-catalogue-entry.md.

Review fixes:
1. Key names. Read-only scan of every pinned key list (Orca@09aa0114, Bambu@79df7ae, Prusa@b028299, Prusa@30ef591 domain + Legacy/PrintConfig.cpp, SuperSlicer@1f3d287, Cura@5bea2f8 fdmprinter+fdmextruder; 4 946 names): the only names outside `[a-z0-9_]` are 3 uppercase Orca/Bambu keys (`required_nozzle_HRC`, `machine_max_force_Y`, `machine_bed_mass_Y`) and 10 hyphenated Prusa/SuperSlicer CLI keys (`delete-after-load` ...). Native names (`key`, split `keys`) now match `^[A-Za-z0-9_-]+$`; unified keys `^(prefix)?[A-Za-z0-9_]+$` (Orca names verbatim, D9; a prefixed key writes `-` as `_`, `prusa.delete_after_load`). Test: all 13 unusual names pass as native keys; the 3 Orca ones pass as unified keys.
2. PRF-16: `NativeKey` has `legacy?: boolean` and `pinned?: string` (`<Repo>@<hash>`, e.g. `PrusaSlicer@30ef591`). They sit on the dialect's name, not the entry, because legacy is a property of one dialect's name (Prusa 3.0 reads it only from old configs); a legacy-only `prusa.` entry sets it on its `prusa3` native.
3. PRF-14: a data file is `CatalogueFile { $schema?, notice, entries }`; `catalogueSchema` requires a non-empty `notice` and validates `entries` as before.
4. PRF-4 criterion 3: yes, per profiles.md §6 ("per-extruder values are keyed objects ..., never positional arrays"). `defs.ts` `settings` rejects a top-level array for a hand list of per-extruder keys (the PRF-4/5 fixture keys; shortcut comment says to derive it from the catalogue `per_extruder` entries once PRF-14 data exists). PRF-4's `test.fails` is a normal test and passes.

Verified: `pnpm lint && pnpm build && pnpm test` pass, 208 tests. evaluate.ts untouched.
Not done: `catalogueSchema` not in `allSchemas`; no Cura warning ranges or expression bounds; the per-extruder list in defs.ts is partial until PRF-14.
Reviewer probe /private/tmp/claude-501/sp6.6brXlt/rev/cat.mjs uses the old bare-map file shape and entry-level `legacy`; tests cover the new shapes.

Files: `src/domain/catalogue/{entry,schema,index}.ts`, `src/domain/schema/defs.ts`, `test/catalogue.test.ts`, `test/fixtures.test.ts` (drop `.fails`), `src/index.ts` (one line), PRF-4 Progress (one line). No dependency or lockfile change.

Changelog: PRF-12: settings catalogue contract: `CatalogueEntry`, `CatalogueFile` (`notice` + `entries`), `Catalogue`, the 14 FFF `GROUPS`, `RESERVED_GROUPS`, `KEY_PREFIXES`, the closed `Conversion` set, `legacy`/`pinned` native-name flags, override scopes, `catalogueEntrySchema`/`catalogueSchema`; entity `settings` reject positional arrays for per-extruder keys.

Review passed (prf12-rereview): fixes verified. Probe /private/tmp/claude-501/sp6.8nFelm/rr12/p.mjs (20 cases, all as expected): CatalogueFile needs non-empty notice, old bare map rejected; entry-level legacy rejected, legacy/pinned on NativeKey accepted, bad pinned rejected; unified keys allow Orca uppercase, reject hyphens and unknown prefixes; native names allow `delete-after-load`; prefix forces native_only of its dialect; sla/no-group/empty native rejected; Bambu two native names, Cura {expr} default, split surface map and 90-x scale accepted. Contract checked against PRF-13..20: each can build on it. Legacy/pinned on the native name is right (a key can be canonical in Orca and legacy in Prusa). The per-extruder hand list in defs.ts is an acceptable shortcut until PRF-14 (comment present); unlisted keys like nozzle_temperature still accept arrays. Advisory for PRF-16: a key shared by Prusa and SuperSlicer but not Orca has only one native_only dialect; record that choice there. Domain pure, no VS Code, no dependency change. vitest 213/213, eslint and prettier clean; tsc fails only in overrides.ts:32 (PRF-8 lane).
