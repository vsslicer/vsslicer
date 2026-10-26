---
id: 2
title: Define the profile entity types and shared fields
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [1]
created: 2026-10-25
---

TypeScript types for vendor, printer_model, nozzle, surface, feeder, material, process and printer_instance per `profiles.md` §6, with the fields every entity shares.

**Code:** `vsslicer/modules/profile-api/src/domain/entities/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] Every entity in `profiles.md` §6 has a type with its required and optional fields; shared fields `id`, `inherits[]`, `abstract`, `when`, `overrides[]` (`match: first|all`), `settings`, `renamed_from[]`, `meta` exist on all but `vendor`
- [x] `material` carries type, diameter, density, cost and `external_ids` (cura_guid, bambu_filament_id, orca_filament_id, prusa_name)
- [x] `printer_instance` has `toolheads[{slot, nozzle}]`, `feeder {type: mmu|ams|toolchanger, slots}` and `connection {host_type: string, url, secret_ref}`; `host_type` is a plain string here (validated in E16)
- [x] Type-level tests (`expectTypeOf`) fail if a required field is dropped

## Tasks

- [x] Write the entity types
- [x] Write the settings value type (scalar, keyed per-extruder map, `null`, `{expr}` for Cura formulas)
- [x] Add the type tests

## Progress

Done. Types in `vsslicer/modules/profile-api/src/domain/entities/` (`settings.ts`: `SettingValue` = scalar | null | `{expr}` | array | keyed map; `shared.ts`: `EntityBase`, `Override`, `Meta`, `Condition`; `entities.ts`: the eight entities per profiles.md §6; `index.ts`), re-exported as types from `src/index.ts`. `EntityBase` requires only `id`; every other shared field is optional. `PrinterInstance.feeder` is the inline `{type, slots}` the card names (not a feeder id).

Judgement calls for the reviewer: `Override.match` sits on each override block (the research text says "a `match` mode of first or all" without saying where); `Condition` is a plain string alias (parsing is a later card); enumerations the research lists with "..." (nozzle material, surface type, kinematics) are `string`.

Verified: `pnpm lint && pnpm build && pnpm test` pass (6 tests, `test/entities.test.ts` with `expectTypeOf`); making `Nozzle.diameter` optional fails with TS2344 in `pnpm test`. Not done: runtime validation/JSON Schema (other cards). No dependency added.

Changelog: PRF-2: entity types, shared `EntityBase` fields and `SettingValue` (types only) (already in `## Unreleased`).

Review passed (prf12-reviewer): all eight entities and fields match profiles.md section 6 (required/optional, shared fields on all but vendor, material external_ids, printer_instance toolheads/feeder/connection with host_type string); probe making Nozzle.diameter optional fails tsc with TS2344; types only, no VS Code API in domain.
