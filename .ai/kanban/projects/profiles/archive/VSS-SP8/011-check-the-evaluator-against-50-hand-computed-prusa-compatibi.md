---
id: 11
title: Check the evaluator against 50 hand-computed Prusa compatibility conditions
type: chore
priority: P0
effort: M
model: opus
area: [evaluator]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [135, 10, PLT-13, 119]
created: 2026-10-25
---

The external oracle for the evaluator: conditions sampled from the 822 in `PrusaResearch.ini` and the 3.0 YAML forms, expected results worked out by hand from `Preset.cpp:390-421`.

**Code:** `vsslicer/modules/profiles-prusa/test/fixtures/conditions/` (module: `profiles-prusa`, layer: n/a (fixtures))

## Acceptance criteria

- [x] At least 50 conditions with printer fixtures and expected booleans, each citing the native rule used in `PROVENANCE.md`; the evaluator matches all
- [x] The sample covers `nozzle_diameter[0]`, `printer_model` regex, `printer_notes`, `and`/`or`/`not`, `!~` and the 3.0 YAML forms
- [x] A deliberately wrong expectation fails the test (guard against a vacuous suite)

## Tasks

- [x] Sample the conditions
- [x] Compute expectations by hand and review them
- [x] Write the table-driven test

## Progress

Not started.

### 2026-10-26 PRF-11-worker

- Done. 78 cases (57 distinct conditions: 45 `ini:` from PrusaResearch.ini@b028299, 10 3.0 `yaml:` from PrusaSlicer@30ef591 presets/vendor.yaml, 2 `table:` rows from profiles.md section 6) on 26 2.9 and 7 3.0 printer fixtures; expectations hand-computed from Preset.cpp:390-421 and PlaceholderParser.cpp:670-690,735-746 (regex_match full match, boost `.` matches newline, num_extruders = nozzle_diameter length). Each case carries its deciding clause in `why`.
- PrusaResearch.ini@b028299 has no `or`/`||` and no `compatible_prints_condition`; `or` coverage comes from the 3.0 YAML sample (FLEX-Eolas-Prints-TPU93A.yaml:7).
- Test treats an evaluate diagnostic as a failure (evaluate returns true on faults, which would make `want: true` vacuous). Guard test flips every non-lossy expectation and asserts each mismatch is detected.
- Lossy: converter flags 28/57 lossy (partial/multi-tag notes regexes); all still match. One known-lossy case kept and asserted: `ini:1459` on MK3.5 0.25 - Prusa false (MK3.5 notes, PrusaResearch.ini:41869, lack PRINTER_VENDOR_PRUSA3D), unified true. Finding for PRF-10 follow-up: the PRINTER_VENDOR_PRUSA3D -> `printer.vendor == 'PrusaResearch'` rewrite is reported exact but differs for MK3.5 and MK4IS printers whose notes lack the keyword.
- Verified: module `pnpm test` (130 tests, 5 files), `pnpm lint`, `pnpm build`; `node scripts/run.mjs checks` exit 0.
- Files: `vsslicer/modules/profiles-prusa/test/fixtures/conditions/{cases.json,printers.json,PROVENANCE.md}`, `vsslicer/modules/profiles-prusa/test/adapters/conditions-oracle.test.ts`.
- Coordinator lines: none for index.ts. CHANGELOG `## Unreleased`: "- Test: hand-computed oracle of 78 PrusaSlicer compatibility conditions (2.9 INI and 3.0 YAML) for the condition converter and evaluator (PRF-11)." No new dependency.


Review (sp8-reviewer-25, 2026-10-26 08:38): PASS
Ran: `pnpm test` (130 pass), `pnpm lint`, `pnpm build` in profiles-prusa; `node scripts/run.mjs checks` (exit 0); a scratch script against `.reference/repos/PrusaSlicer-2.9` (b028299).
- All 45 `ini:<line>` conditions are verbatim `compatible_printers_condition` values at the cited line, and each is the first occurrence. Fixtures are 29 KB in total: short excerpts, not vendored bulk.
- I hand-checked 15 cases against Preset.cpp:390-421 (num_extruders = nozzle_diameter size, :417-419) and regex_match full-match semantics. All agree: ini:6737/XLIS_04 T, ini:2445/XL_04 F (num_extruders), ini:8253/MK35MMU3_04 T, ini:1195/MK2SMM_06 T, ini:1459/MK3S_025 T, yaml:ABS:5/MK35_MMU3_8B T, ini:1632/MK4_08 F (full match of (MK3|MK2.5).* on MK4), ini:1632/MK3S_08 T, ini:7504/XLIS_HF06 F, ini:1222/MK25_04 T, yaml:FLEX:7/CO1_MMU3_SINGLE T (or branch), ini:4251/MK4MMU3_04 T, ini:1062/MK2S_04 F, ini:8584/MK4IS_HF06 T (`!`), ini:1459/MK35_025 F.
- The guard is genuine. It flips every non-lossy `want` and requires `check` to report a mismatch, and diagnostics count as failures, so `want: true` cannot pass on an evaluator fault.
- The known-lossy case is real. PrusaResearch.ini:41869 (MK3.5) and :40968/:40995 (MK4IS, MK4ISMMU3) notes have no PRINTER_VENDOR_PRUSA3D, so the converter's "exact" vendor rewrite is wrong for them. Coordinator: open a PRF follow-up card (converter, adapters layer) for it.
Non-blocking: cases.json has 79 cases, not the 78 in the note. MK3S `src` "39647,39695" is notes,model, the reverse of the order PROVENANCE.md states.
