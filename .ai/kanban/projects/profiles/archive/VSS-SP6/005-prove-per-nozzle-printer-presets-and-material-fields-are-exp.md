---
id: 5
title: Prove per-nozzle printer presets and material fields are expressible
type: feature
priority: P0
effort: S
model: sonnet
area: [schema]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [3]
created: 2026-10-25
---

Covers the two P0 matrix rows on nozzle-as-entity and filament presets with fixtures.

**Code:** `vsslicer/modules/profile-api/src/domain/entities/` tests and `vsslicer/modules/profile-api/test/fixtures/nozzle/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] A fixture set shows a Prusa per-nozzle printer preset (0.4 and 0.6) written as `printer_model` + `nozzle` + `overrides` and validated
- [x] A `surface` entity (Cura buildplate variant and Orca plate temperature keys) validates
- [x] A `material` fixture carries type, diameter, density, cost, temperatures, flow and all four `external_ids`; a Cura GUID and a Bambu filament id are both stored

## Tasks

- [x] Write the fixtures
- [x] Write the validation tests

## Progress

Done. Fixtures in `vsslicer/modules/profile-api/test/fixtures/nozzle/` (with PROVENANCE.md): XL `printer_model` + 0.4/0.6 `nozzle` entities + a `nozzle.diameter == 0.6` override (retract_length 0.8 vs 0.7, INI numbers cited), Cura glass buildplate and Orca textured/cool plate `surface` entities, and a Bambu PLA Basic `material` with density, cost, nozzle temp, flow ratio, plate temps and all four `external_ids`. `test/fixtures.test.ts` validates each with ajv and checks values.
Verified: `pnpm lint && pnpm build && pnpm test` pass (175 passed, 1 expected fail from PRF-4); `node vsslicer/scripts/check-fixtures.mjs` clean.
Not covered: override conditions are strings only here (evaluation is another card). Bed, kinematics, USD and 1.75 mm are illustrative.
Files: test/fixtures/nozzle/*, test/fixtures.test.ts.
Changelog: none (tests and fixtures only).

Review passed (prf54-reviewer): lint, build, test green (175 + 1 expected fail); check-fixtures clean; criteria 1-3 ticked and true: XL 0.4/0.6 as printer_model + nozzle + overrides, surfaces, material with 4 external_ids; Cura GUID/Bambu id/INI lines/Orca values re-checked against .reference clones (Orca 09aa0114). Provenance fixed: orca_filament_id source is Generic PLA @base.json:6 (was a nonexistent @System.json:8). Licences stated (AGPL/LGPL/CC, facts only). No layer issues.
