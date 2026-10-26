---
id: 104
title: "Catch flavour typos, leading-zero codes and cross-file duplicates in the catalogue lint"
type: bug
priority: P2
effort: XS
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-language (domain). Finding 7 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] The lint rejects an unknown flavour name, G01-style codes and the same code and flavour in two files; klipper:M104 duplicate removed
- [x] A test that fails before the fix

## Tasks

- [ ] Fix as the audit describes

## Progress

Done: FLAVOURS set (marlin, prusa-buddy, bambu, klipper, reprapfirmware) checked in validateEntry; CODE rejects G01-style (also via the extended-command branch); parseEntries takes a shared `seen` set and loadCatalogue passes one across files; reprap.json M104 no longer lists klipper (klipper.json owns it). Verified: new tests in test/catalogue.test.ts (typo, G01, cross-file duplicate); lint, build, test green (32 pass). Changelog: gcode-language: the catalogue lint rejects unknown flavours, leading-zero codes and duplicates across files.

Review passed (gcp104-106-103-reviewer): lint, build, 32 tests green. Probes: klippper, G01, M0104, T00, G1X rejected; G0, G1.10, SET_X accepted; same flavour:code in two files throws; reprap.json M104 no longer lists klipper (klipper.json owns it); full catalogue loads (161).
