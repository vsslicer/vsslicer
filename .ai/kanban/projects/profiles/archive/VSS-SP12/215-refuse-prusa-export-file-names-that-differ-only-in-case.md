---
id: 215
title: Refuse Prusa export file names that differ only in case
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 6 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Fix: `paths` in `profiles-prusa/src/adapters/export/prusa/export.ts` is keyed on `path.normalize('NFC').toLowerCase()`; the second entity is skipped with the existing "already written" warning. Test: `names differing only in case or Unicode form` in `test/adapters/export-prusa.test.ts` (Generic PLA / generic pla; NFC / NFD cafe).
Probes: (1) fix criterion: key reverted to plain `path`, the new test fails (confirmed, restored). (2) Bounds: no new input, no new loop; the alias is derived from `safeName`-checked names (already length-bounded) and the entity cap/byte cap are unchanged; the hostile case (case and Unicode aliases) is the new test, and the same probe covers it.
Verification: lint, build pass; 322 of 324 tests pass. The 2 failures (`canon per option type`, `a file PrusaSlicer wrote is a fixed point`) come from another worker's uncommitted edit to `serialize.ts` (PRF-214, backslash handling), not this card; my test passes. `node scripts/run.mjs checks` passes. CI gate platform: Linux (case-sensitive), so the test asserts the alias directly.
Release lines: CHANGELOG: Fixed: Prusa export refuses a second file whose name differs only in case or Unicode normalisation (PRF-215). No export changes.

**Review passed (sp12-rev-prf-215, reviewer sp12-rev-prf-214)**

Ran in `vsslicer/modules/profiles-prusa` (with PRF-214's edits in the same tree): `pnpm install` ok, `pnpm lint`
clean, `pnpm build` clean, `pnpm test` 13 files, 328 passed (two reruns; the earlier 2 failures the card mentions were
PRF-214's in-progress edit and are gone). `node scripts/run.mjs checks` exit 0.

Fix matches the audit's rule exactly: `paths` keyed on `path.normalize('NFC').toLowerCase()` (export.ts:200,248), the
second entity skipped with the existing "already written" warning, the first file's path kept as written. `paths` is a
Set, so `__proto__`/`constructor` names are harmless. Adapters layer only.

Mutation probes (temp copy, export-prusa.test.ts, 47 tests): key back to plain `path`: 1 fails; `toLowerCase()`
without NFC: 1 fails (the cafe NFC/NFD pair); NFC without `toLowerCase()`: 1 fails (Generic PLA pair). Both halves
of the key are pinned. Bounds: no new input, loop or cap; the entity and byte caps are unchanged, so the card's
"no new bound" is right.

Note for the coordinator (not a failure, the audit fixed the rule): `toLowerCase` is context-sensitive for Greek
sigma (`'ΑΣ'.toLowerCase()` is `ας`, `'ασ'` stays `ασ`), so those two names still both come out though APFS and NTFS
fold them together. Folding with `toUpperCase()` (or upper then lower) would cover it; a follow-up card if wanted.
