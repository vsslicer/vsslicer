---
id: 184
title: Stop rewriting PRINTER_VENDOR_PRUSA3D to printer.vendor as exact
type: bug
priority: P1
effort: XS
model: sonnet
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [10]
created: 2026-10-26
---

Found by PRF-11 (SP8, `PRF-11-worker`, confirmed by sp8-reviewer-25): `convertPrusaCondition` rewrites a `printer_notes=~/.*PRINTER_VENDOR_PRUSA3D.*/` test to `printer.vendor == 'PrusaResearch'` and reports it exact, but the MK3.5 and MK4IS / MK4ISMMU3 printers' notes lack the keyword (`PrusaSlicer-2.9@b028299:resources/profiles/PrusaResearch.ini:41869, :40968, :40995`), so PrusaSlicer says false where we say true (case `ini:1459` in `test/fixtures/conditions/cases.json`, recorded as known-lossy).

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/conditions/tags.ts` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [x] `PRINTER_VENDOR_PRUSA3D` converts to a tag test (`'PRINTER_VENDOR_PRUSA3D' in printer.tags`) like every other keyword, or is flagged lossy with a diagnostic
- [x] The PRF-11 oracle case `ini:1459` moves from known-lossy to matching

## Progress

Upstream lines (PrusaSlicer-2.9@b028299 `resources/profiles/PrusaResearch.ini`), none contains PRINTER_VENDOR_PRUSA3D:
- :41869 `printer_notes = Don't remove the following keywords. \nPRINTER_MODEL_MK3.5\n`
- :40968 `printer_notes = ... \nPRINTER_MODEL_MK4IS\nPG`
- :40995 `printer_notes = ... \nPRINTER_MODEL_MK4IS\nPRINTER_MODEL_MK4MMU3\nPG`
Change: `PRUSA_TAG_FIELDS` in `src/adapters/conditions/tags.ts` is now `{}`, so `PRINTER_VENDOR_PRUSA3D` converts to `'PRINTER_VENDOR_PRUSA3D' in printer.tags` like every other keyword (export kept, since `conditions/index.ts` re-exports it). Tests: updated the expectation in `test/adapters/conditions.test.ts`; removed `knownLossy` from `ini:1459` / `MK35_025` in `test/fixtures/conditions/cases.json`, which now matches (false) while `MK3S_025` stays true. `pnpm test` 131 passed, `pnpm lint` clean, `node scripts/run.mjs checks` passed. Not done: the profile mapper that fills `printer.tags` from notes is outside this card.

**Review passed (sp9-rev-prf-185)**: checked `.reference/repos/PrusaSlicer-2.9` at b028299: `PrusaResearch.ini:1459` is the `PRINTER_VENDOR_PRUSA3D and PRINTER_MODEL_MK3 and 0.25` condition; :40968 (MK4 Input Shaper 0.4), :40995 (MK4 MMU3 0.4) and :41869 (MK3.5 & MK3.5S 0.4) are the quoted `printer_notes` lines word for word, none containing PRINTER_VENDOR_PRUSA3D. `PRINTER_VENDOR_PRUSA3D` stays in `PRUSA_NOTE_TAGS` (tags.ts:31), so the tag test is filled from notes. `pnpm test` 131 passed (oracle suite ran with the pinned file, `ini:1459` on MK35_025 -> false matches without `knownLossy`), lint, build and `run.mjs checks` clean. Mutation (old `PRUSA_TAG_FIELDS` restored in a temp copy) fails `conditions.test.ts` and the oracle case `ini:1459 on MK35_025`.
