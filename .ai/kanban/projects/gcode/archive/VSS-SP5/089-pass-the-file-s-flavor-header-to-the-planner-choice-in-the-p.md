---
id: 89
title: "Pass the file's ;FLAVOR: header to the planner choice in the preview"
type: bug
priority: P1
effort: M
model: opus
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-preview (application); may need gcode-api/gcode-parser. Finding 2 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] A ;FLAVOR:Klipper file without a config block is timed by the Klipper planner, and Cura files stop showing 'marlin assumed' when the header names the flavour (test)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Part A (gcode-api, gcode-parser) released and reviewed (PASS). Part B done (gcode-preview, application):
- load-preview.ts: `resolveLimits({ flavour: parsed.flavourName, config: parsed.config })`.
- test/load.test.ts: a `;FLAVOR:Klipper` file with no config block gets `flavourName 'Klipper'` and a different timing than the same file as `;FLAVOR:Marlin`; Marlin gives `flavourAssumed: false`. Both fail without the one-line fix (checked by reverting it).
- Not as the card guessed: the Cura fixture states `;FLAVOR:RepRap`, a name the planner does not know, so `resolveLimits` still flags it `flavourAssumed` (true). Cura files keep showing 'assumed' until gcode-planner's `flavourFromName` maps `RepRap` (Cura's name for Marlin-compatible firmware) to marlin: follow-up in gcode-planner, not done here. No Cura test added.
Verified in gcode-preview: pnpm lint, pnpm test (43 pass, 0 fail), pnpm build, pnpm test:integration (9 passing).

CHANGELOG (gcode-preview): - Fixed: the planner follows the file's `;FLAVOR:` header (e.g. Klipper without a config block).

Files: vsslicer/modules/gcode-preview/src/application/load-preview.ts, src/adapters/worker-entry.ts, test/load.test.ts, test/renderer.test.ts (codecs import/option only).

Part C: flavourFromName (src/domain/limits.ts) now maps Cura's names. Finding: `;FLAVOR:RepRap` is NOT Marlin/Sprinter. CuraEngine@47b0388 writes `Marlin` for "RepRap (Marlin/Sprinter)" (already mapped) and `RepRap` for "RepRap (RepRap)", the original RepRap firmware family (gcodeExport.cpp:210-214, Settings.cpp:397-398), so `RepRap` and `reprap (reprap)` map to reprapfirmware (`RepRapFirmware` still does). Added to marlin: `Marlin(Volumetric)`, `RepRap (Volumetric)`, `Griffin`, `Cheetah` (Marlin-based Ultimaker firmware, EnumSettings.h:197-214). `UltiGCode` (UM2 firmware, volumetric E) stays unknown, so it is reported as assumed. Test: limits.test.ts "maps Cura's ;FLAVOR: names". Verified: lint/test (94 passed)/build green. Files: src/domain/limits.ts, test/limits.test.ts.
CHANGELOG: - Fixed: Cura `;FLAVOR:RepRap` selects the RepRapFirmware planner and `Griffin`/`Cheetah`/`Marlin(Volumetric)` the Marlin planner without an "assumed" flag; `UltiGCode` is still assumed.

Review (gcode8995b-review): PASS (part B only), diff is the one-line resolveLimits({ flavour: parsed.flavourName, config }) plus the test; lint, build, integration (9 passing) green; the new test needs the header-driven planner (Klipper vs Marlin timing differ, Marlin not assumed). pnpm test has 3 renderer failures (draw instance counts, off by 6) in test/renderer.test.ts, from the concurrent GCP-35 preview-renderer.ts edit, not from this card (parse and moves are untouched here). Cura ;FLAVOR:RepRap stays open for part C. Left in review for the coordinator.

Review (gcp93-rereview, part C): PASS. Citations verified in CuraEngine@47b0388 (src/gcode_export/gcodeExport.cpp:210-211, Settings.cpp:397-398, EnumSettings.h:226 "Real RepRap GCode ... RepRap firmware (e.g. Duet)"; Cura emits M566/M204 P/relative E for REPRAP). Probe: names are trim/case-insensitive; RepRapFirmware, "REPRAP", "RepRap (RepRap)" -> reprapfirmware; Griffin/Cheetah/Marlin(Volumetric)/RepRap (Volumetric) -> marlin, not assumed; UltiGCode assumed; the gcode-preview Cura fixture header "RepRap" (CRLF) -> reprapfirmware, flavourAssumed false. RepRap->RRF judged sound (Cura documents it as the RRF/Duet flavour); caveat: with no config block RRF defaults (100 mm/s feed, 1000 accel) apply and `assumed` stays true, so Cura estimates may run slower than Marlin defaults until the file sets M204/M566 (the fixture has none). No code changed by reviewer.
