---
id: 4
title: "Add multi-tool, IDEX and H2C dual-extruder fixtures that keep per-extruder values"
type: feature
priority: P2
effort: S
model: sonnet
area: [schema]
story: US10
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [3]
created: 2026-10-25
---

Proves the schema can hold keyed per-extruder values and `toolheads`/`feeder` for the printers named in the epic, without positional arrays.

**Code:** `vsslicer/modules/profile-api/test/fixtures/multitool/` (module: `profile-api`, layer: n/a (fixtures))

## Acceptance criteria

- [x] Hand-written fixtures for Prusa 3.0 `printer_config` XL 2T, an Orca IDEX machine and a Bambu H2D/H2C extruder-variant array validate against the schema
- [x] Each fixture's per-extruder values read back by slot (`{"0": .., "1": ..}`) with the same numbers as the native source cited in `PROVENANCE.md`
- [x] A negative fixture using a positional array for a per-extruder key fails with the expected path

## Tasks

- [x] Write the three fixtures with provenance
- [x] Add the read-back and negative tests

## Progress

Fixtures done, third criterion BLOCKED by a schema gap. `test/fixtures/multitool/` (PROVENANCE.md cites native lines): Prusa XL 2T model + instance + toolchanger feeder, Orca Xplorer IDEX, Bambu H2C (five variant rows keyed "0".."4"), all valid; `test/fixtures.test.ts` reads values back by slot with the native numbers.
Gap: `defs.ts` `settingValue` allows any array, so `negative-positional-array.json` (`nozzle_diameter: [0.4, 0.4]`) is NOT rejected. The test is `test.fails` (expects an error at `/settings/nozzle_diameter`); it flips to failing once the schema rejects it, then drop `.fails`. Needs a PRF-3 schema decision (for example reject arrays for known per-extruder keys), which this worker may not make.
Verified: lint, build, test pass; check-fixtures clean.
Changelog: none.

Review (prf54-reviewer): kept in review, not moved. Criteria 1-2 verified: H2C/Xplorer IDEX/XL 2T numbers match native sources (re-read from Orca 09aa0114 and PrusaSlicer-2.9 INI), keyed by slot, valid, lint/build/test/check-fixtures green. Only open item is criterion 3 (positional array rejected), pending the PRF-12 schema fix in defs.ts; then drop test.fails in test/fixtures.test.ts and move to done.

Schema gap closed by PRF-12 fix (prf12-fix): `defs.ts` `settings` rejects a top-level array for the per-extruder keys (profiles.md §6: per-extruder values are keyed objects, never positional arrays; hand list until PRF-14 data). The negative test in `test/fixtures.test.ts` is now a normal test and passes (error at `/settings/nozzle_diameter`). Criterion 3 left unticked for this card's reviewer.

Review passed (prf12-rereview): criterion 3 verified (negative-positional-array.json rejected at /settings/nozzle_diameter, now a normal test; keyed, scalar and other-key lists still valid). Re-read every per-extruder value of bambu-h2c, orca-xplorer-idex and prusa-xl-2t against OrcaSlicer@09aa0114 and PrusaSlicer-2.9@b028299 by script: all match, keyed by slot (H2C: nozzle_diameter keyed by extruder, variant keys 0..4 by native row, as PROVENANCE says). vitest 213/213, eslint and prettier clean; tsc fails only in src/domain/inheritance/overrides.ts:32 (PRF-8 lane, not this card).
