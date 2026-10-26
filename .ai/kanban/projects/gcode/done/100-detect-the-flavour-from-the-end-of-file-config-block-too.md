---
id: 100
title: Detect the flavour from the end-of-file config block too
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-language (domain). Finding 3 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] PrusaSlicer, SuperSlicer and Orca files with the config block at the end show their flavour, not generic
- [x] A test that fails before the fix

## Tasks

- [x] Fix as the audit describes

## Progress

Done. `detectFlavour(head, tail = '')` scans both, the head's flavour name and printer model winning over the tail's; the status bar passes the first and last 64 KiB. Corpus excerpts of the 7 files with their config block at the end (orca marlin, 4 PrusaSlicer, test_vase, superslicer) now carry those lines after the commands; the corpus test uses head and tail and stays at zero warnings, with orca-marlin, test_vase and superslicer asserted as marlin/marlin/klipper. New `test/fixtures/tail-config.gcode` (padded >128 KiB in the test) proves tail detection, head-wins and Buddy refinement from the tail. Verified: pnpm lint, build, test (29 pass).

Catalogue (decisions): MK3MMU2 runs Prusa-Firmware (Marlin 1, not Buddy) and resolves to marlin. Simplest fix: G80, M403, M702, M862.1, M862.3 in prusa-buddy.json now list ["marlin", "prusa-buddy"], source the Prusa KB page "Prusa-Firmware specific G-code commands" (checked: lists all five), instead of a new prusa flavour. Cost: all Marlin files accept these codes, and Bambu (falls back to marlin) too; the fallback test now uses M862.5. Klipper G21 added (accepted no-op, G20 errors) citing klippy/extras/gcode_move.py:166 @ee2c6fb. Allowed-source list gained github.com/Klipper3d/klipper and the Prusa KB article (tested).

Not done: flavour-name mapping (GCP-99); tail is chars not bytes.

Files: gcode-language/src/domain/flavour.ts, src/domain/catalogue.ts, src/presentation/status.ts, catalogue/klipper.json, catalogue/prusa-buddy.json, test/{corpus,flavour,catalogue,features}.test.ts, test/fixtures/tail-config.gcode, 7 test/fixtures/corpus/*.gcode, PROVENANCE.md.

Review passed (gcp100-reviewer): lint/build ok; flavour, catalogue, features-minus-GCP-99 tests pass. Probe over all 15 gcode-parser corpus .gcode files with full head+tail: zero unknown-command warnings under GCP-100's resolveFlavour (flavours: orca-marlin marlin, test_vase marlin, superslicer klipper, 4 prusaslicer prusa-buddy, bambu/orca-x1c bambu). Head wins over tail verified in code and test. G21 source verified at klipper@ee2c6fb gcode_move.py:166; the five Prusa-Firmware codes confirmed on the Prusa KB page. Tail is chars not bytes (documented in progress). Note: with GCP-99's in-flight lookup.ts (Cura 'RepRap' -> reprapfirmware) corpus.test and features.test:13 currently fail; not GCP-100's change.

Changelog: Detect the flavour from the last 64 KiB too (head wins), so PrusaSlicer, SuperSlicer and Orca files with the config block at the end are no longer generic; add Klipper G21 and the Prusa-Firmware codes G80, M403, M702, M862.1, M862.3 to Marlin.
