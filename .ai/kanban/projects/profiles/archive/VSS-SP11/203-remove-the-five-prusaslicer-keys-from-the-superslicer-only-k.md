---
id: 203
title: Remove the five PrusaSlicer keys from the SuperSlicer-only key list
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 2 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Removed the 5 keys (wipe_tower_x, wipe_tower_y, wipe_tower_rotation_angle, wiping_volumes_extruders, support_points_minimal_distance) from `profiles-prusa/src/adapters/import/superslicer-keys.ts`; comment now says 351. Test: `test/adapters/superslicer.test.ts` new test (each key -> dialect prusa, not in set); old counts 356 -> 351. Bounds: the fix only deletes list entries; no new input handling, so nothing to bound.
Mutation probe: re-adding `wipe_tower_x` to the set made 2 tests fail (the count test and the new test); restored.
Verify: superslicer.test.ts 4/4 pass. Full `pnpm lint`/`build`/`test` fail ONLY in other cards' in-progress files (export/prusa/export.ts no-control-regex; test/adapters/export-prusa.test.ts irregular whitespace, undefined MAX_KEYS_PER_SECTION/MAX_LINE_LENGTH); not mine; `run.mjs checks` not run. Gate platform: n/a (no platform-specific code).
Release lines:
- CHANGELOG: PRF-203: removed `wipe_tower_x`, `wipe_tower_y`, `wipe_tower_rotation_angle`, `wiping_volumes_extruders` and `support_points_minimal_distance` (PrusaSlicer's own keys) from `SUPERSLICER_ONLY_KEYS`, so Prusa presets that set them are `prusa`, not `superslicer`; the list has 351 keys. Also change "356" to "351" in the PRF-26 line.
- Exports: none.

**Review passed (sp11-rev-prf-203)**
- Fix matches audit Finding 2 exactly: the 5 keys removed, set size 351, comment updated. Upstream checked: all 5 are on `PrintConfigDef_ignore` (`PrusaSlicer-2.9@b028299:src/libslic3r/PrintConfig.cpp:L5281-L5283`).
- Ran: `pnpm install` ok; `superslicer.test.ts` 4/4; eslint on the card's two files clean; `tsc --noEmit` clean; `pnpm build` ok; full `pnpm test` 292/293 and `pnpm lint` 2 errors, all in another card's `export/prusa/export.ts` and `test/adapters/export-prusa.test.ts`; `node scripts/run.mjs checks` exit 0 (84 pass).
- End to end: the built `importPrusaIni` on `PrusaSlicer-2.9@b028299/resources/profiles/PrusaResearch.ini` gives 6,533 entities and 0 marked `superslicer` (the audit saw 214).
- Mutation probes (mktemp copy): re-adding `support_points_minimal_distance` fails the count test and the new test; swapping `z_step` for `wipe_tower_y` (size stays 351) fails the new test alone.
- Bounds: the fix only deletes entries, so there is no new input path to bound. Agree.
- For the coordinator: `docs/research/features-prusaslicer-superslicer.md` still says 356 SuperSlicer-only keys (L62, L283, L295, L323); the code comment cites its appendix. That file is outside the module, so I left it. CHANGELOG lines are in the card's release lines.
