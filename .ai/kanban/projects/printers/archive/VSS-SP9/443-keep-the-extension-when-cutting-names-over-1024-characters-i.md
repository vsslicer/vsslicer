---
id: 443
title: Keep the extension when cutting names over 1024 characters in printer-folder
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M3"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 6 of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] `prepare` in `printer-folder/src/domain/names.ts` keeps the last `.ext` (up to 64 characters, as `longName` allows) and cuts only the stem to `MAX_INPUT_LENGTH`, on both the long-filename and the FAT path
- [x] Tests: `sanitiseName('x'.repeat(2000) + '.gcode', {longFilenames: true})` ends in `.gcode` and is at most 255 characters; the FAT case keeps `.GCO`/its 8.3 rule; a 2,000-character extension-only name and a name of 1 MB still return within the caps
- [x] **Bounds:** work stays linear in the input (one pass, no repeated slicing in a loop); input over `MAX_INPUT_LENGTH` is cut before any per-character loop

## Progress

Added `cutInput` in `printer-folder/src/domain/names.ts`: over-length input keeps its last `.ext` (<=64 units, leading dot excluded) and only the stem is cut to MAX_INPUT_LENGTH, before any per-character work (one lastIndexOf, one slice). Applies to FAT and long paths via `prepare`. Added 3 tests (long keeps .gcode <=255; FAT -> XXXXXXXX.GCO; ext-only/1 MB names within caps) and corrected two old hostile-input assertions that encoded the bug ('A' -> 'A.GCO', 'FILE' -> 'X'). 54 tests pass; lint, build, run.mjs checks clean. No shared-file lines needed.

**Review passed (sp9-rev-prn-443)**: ran `pnpm test` (54 passed), `pnpm lint` (clean), `pnpm build` (clean), `node scripts/run.mjs checks` (exit 0). `cutInput` in `src/domain/names.ts` keeps a last `.ext` of at most 64 units including the dot (same rule as `longName`), cuts only the stem with the surrogate-safe `cut`, and runs before the regex/normalize passes; the cut prefix always ends inside the stem, since 1024 - ext.length < d whenever length > 1024. Mutation: with `prepare` reverted to the old `cut(name, MAX_INPUT_LENGTH)` in a temp copy, 3 tests fail (the hostile-input test, "long filenames", "FAT"); the caps test passes either way because it guards a bound. The two changed assertions are right and not just made to pass: `a` + 100k combining marks + `.gcode` now keeps `.gcode`, folding gives `A.GCODE` and 8.3 gives `A.GCO`, the same as the short name; `'.'x100000 + 'x'` keeps `.x` and comes out `X`, the same as the existing `'.'x100 + 'x'` case. The old values encoded the bug. Probes: 63- and 64-unit extensions, astral stems and extensions, `con` + 2000 spaces + `.gcode` (FAT `CON_____.GCO`), all within the caps with no lone surrogates; 50 MB inputs took 18 ms. Doc-only fix: test/names.test.ts:251 comment said "cut ... before the extension", now "the stem is cut at MAX_INPUT_LENGTH, the extension survives".
