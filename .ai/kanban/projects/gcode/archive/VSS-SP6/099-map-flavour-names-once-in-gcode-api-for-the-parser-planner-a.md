---
id: 99
title: "Map flavour names once, in gcode-api, for the parser, planner and language features"
type: bug
priority: P1
effort: M
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-api (domain), gcode-parser, gcode-planner, gcode-language. Finding 2 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] One Flavour type and flavourFromName in gcode-api used by all three; a Cura ;FLAVOR:RepRap file is parsed and timed with the same flavour
- [x] A test that fails before the fix

## Tasks

- [x] Fix as the audit describes

## Progress

Done. The firmware flavour names are now mapped once, in gcode-api, and used by the parser, planner and language features.

Part A (gcode-api, domain): added `Flavour` and `flavourFromName(name)` (the planner's full table incl. Cura names and citations, trim + lowercase, `undefined` for unknown) in src/domain/flavour.ts, exported from src/index.ts; tests in test/flavour.test.ts (27 tests).

Part B (gcode-parser, gcode-planner; `^0.7.0` in both package.json, lockfiles updated by pnpm install): deleted both modules' own `Flavour` type and name tables; the parser uses `flavourFromName(name) ?? 'marlin'`; both index.ts re-export gcode-api's `Flavour` (planner also `flavourFromName`), so public APIs are unchanged. Behaviour change: `;FLAVOR:RepRap` / `RepRap (RepRap)` is now reprapfirmware in the parser (was marlin). Parser test `;FLAVOR:RepRap` + `M203 X6000` now expects 100 mm/s (was 6000); cura golden `flavour` marlin -> reprapfirmware. Parser 338 tests, planner 94 pass.

Part C (gcode-language, domain): `@vsslicer/gcode-api` `^0.7.0` added under `dependencies` (like gcode-preview; esbuild bundles it, so the lockfile changed by `pnpm add`). `resolveFlavour` (src/domain/lookup.ts) now uses `flavourFromName` for the base firmware, so `RepRap` -> reprapfirmware, klipper -> klipper, marlin names -> marlin. Kept: any name starting with `marlin` is marlin ("Marlin Legacy" with a space is not in gcode-api's table), and the catalogue keys `bambu` / `prusa-buddy` still resolve when named directly (override). One consequence: the Cura corpus file (`;FLAVOR:RepRap`) now resolves to the RRF catalogue, which lacks common codes (G0, M82, M83, M106, M107, M140, M141, T0), so the corpus test flagged them. Fix: the existing catalogue fallback (index build, `FALLBACK`) now also maps reprapfirmware -> marlin for codes its own catalogue lacks, marked as a shortcut in the code. The RRF catalogue itself is still small (14 entries), a follow-up could grow it. Test added in test/features.test.ts: `resolveFlavour(index, 'RepRap')` is reprapfirmware and looks up the RRF entry (M550); failed before the change (gave undefined). lint, build, test pass (29 tests). Did not touch flavour.ts or status.ts. Not verified: the extension in a real VS Code host (no integration run).
Files: vsslicer/modules/gcode-language/{package.json, pnpm-lock.yaml, src/domain/lookup.ts, test/features.test.ts}.

Changelog:
- gcode-api 0.7.0: Added `Flavour` and `flavourFromName(name)`, the one firmware-flavour name table shared by parser, planner and language.
- gcode-parser: Flavour names now come from gcode-api; `;FLAVOR:RepRap` (Cura) is reprapfirmware, not marlin, so its limits and units follow RepRapFirmware.
- gcode-planner: Flavour and `flavourFromName` come from gcode-api (still re-exported); no behaviour change.
- gcode-language: Flavour names resolve through gcode-api, so `;FLAVOR:RepRap` uses the RepRapFirmware catalogue (which falls back to Marlin for codes it lacks).
- Review passed (gcp99-reviewer): part C. gcode-language lint/build/test green (29 tests, corpus no warnings, grammar snaps ok); lookup.ts resolves via gcode-api flavourFromName, marlin-prefix kept, RRF->marlin fallback carries an honest 'shortcut:' comment. E2E probe on cura.gcode (;FLAVOR:RepRap): parser flavourName RepRap resolved by the same flavourFromName (slicer-tags.ts:138), planner limits.flavour=reprapfirmware, assumed=false, rrfPlanner used.
