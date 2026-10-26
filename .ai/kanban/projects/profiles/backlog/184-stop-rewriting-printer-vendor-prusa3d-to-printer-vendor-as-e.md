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

- [ ] `PRINTER_VENDOR_PRUSA3D` converts to a tag test (`'PRINTER_VENDOR_PRUSA3D' in printer.tags`) like every other keyword, or is flagged lossy with a diagnostic
- [ ] The PRF-11 oracle case `ini:1459` moves from known-lossy to matching

## Progress

Not started.
