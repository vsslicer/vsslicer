---
id: 278
title: Bound the slicer timeout setting to what runProcess accepts
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M3"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 7 of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [ ] `slicer-extension/package.json` schema for `timeoutSeconds` has `"maximum": 2147483` (the coordinator edits package.json; the worker lists the line in Progress)
- [x] The reader in `slicer-extension/src/presentation/config.ts` validates the value as finite, clamps to 1..2147483 and rounds so `timeoutSeconds * 1000` is an integer in 1..2^31-1 (what `slicer-runtime` `run-process.ts:L106-L113` accepts), with a warning when it changed the value
- [x] **Bounds:** NaN, Infinity, negative, 0, 1.0005 and 3,000,000 each have a test

## Progress

Changed `vsslicer/modules/slicer-extension/src/presentation/config.ts`: new `timeoutSeconds` reader. Non-number, NaN, Infinity, 0 and negative values still fall back to 600 with the existing warning; any other number is rounded, clamped to 1..2147483 (`MAX_TIMEOUT_SECONDS`), and a warning names the value used whenever that changed it. Added test 'timeout is bounded to what runProcess accepts' in `test/config.test.ts` covering NaN, Infinity, -1, 0, 1.0005, 3,000,000, plus 2147483 (no warning) and 0.3.
Verified: `pnpm test` 11/11 pass, `pnpm lint` clean, `node scripts/run.mjs checks` clean. Integration suite not run (coordinator).
For the coordinator: in `vsslicer/modules/slicer-extension/package.json`, add `"maximum": 2147483,` to the `vsslicer.slicer.timeout` schema (next to its `minimum`/`default`; criterion 1 not ticked).

**Review passed (sp9-rev-slc-277)**: `package.json` has `"maximum": 2147483` on `vsslicer.slicer.timeout` (coordinator edit, criterion 1 met). Reader rounds then clamps to 1..2147483 with a warning on change; non-number/NaN/Infinity/<=0 fall back to 600 with the old warning; 2147483.6 rounds to 2147484 and clamps back, so `seconds * 1000` is always an integer in 1..2^31-1. Ran in `slicer-extension`: `pnpm test` 11/11 (unit only; integration suite not run, as instructed), `pnpm lint` clean, `pnpm build` clean; `node scripts/run.mjs checks` exit 0. Mutations in a `mktemp -d` copy: dropping `Math.round` and dropping the max clamp each make 'timeout is bounded to what runProcess accepts' fail.
