---
id: 404
title: Give the slow 3mf opc test its own hang-guard timeout
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 9 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done. `3mf/test/opc.test.ts` "reads every Cura 3MF mesh" now has an explicit 30_000 ms hang-guard timeout (prettier reformatted the call to the 3-arg form).
- Probe, criterion 1: set the timeout to 1 ms in a temp copy: the test fails with a timeout; restored to 30_000: passes. (The timeout is a hang guard only, no wall-time assertion.)
- Probe, criterion 2: no input handling changed; the test reads the same Cura files and caps as before. Nothing new to bound.
- Verify: 3mf lint ok, build ok, test 356 pass, 1 fail: `readModel.test.ts` "real file AnycubicSlicerNext .../3DBenchy.3mf" took 5849 ms against the 5 s default (same class of bug, another card's file, not touched). `node scripts/run.mjs checks` ok. CI gate platform: Linux (macOS locally).
Release lines: none (test-only).

Round 2 (coordinator note: every 3mf test over 1 s alone gets an explicit hang guard of at least 30 s). Measured with the json reporter: 20 tests ran over 0.7 s (editPackage seam_test 17.7 s, zipWriter ZIP64 11.3 s, zip bomb 6 s, 3DBenchy 4.4 s, opc Cura 3.9 s, large 3.8 s, ...). Instead of editing 15 tests in files other cards touch, `vsslicer/modules/3mf/vitest.config.ts` now sets `test.testTimeout: 30_000` for the whole module (the default was 5 s, which failed 3DBenchy.3mf at 5849 ms), so every test, present and future, has a guard of at least 30 s; the existing 60 s guards and opc's 30 s stay.
- Probe: config set to 1 ms: 9 tests in readModel.test.ts fail with "Test timed out in 1ms"; restored to 30_000.
- Verify: 3mf lint ok, build ok, test 358 pass / 0 fail (the earlier 3DBenchy failure is gone), `run.mjs checks` ok. CI gate platform: Linux (macOS locally).
Release lines: none (test config only).
