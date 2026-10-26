---
id: 402
title: Test that the public readProject reaches the PrusaSlicer 2.x reader
type: bug
priority: P1
effort: S
model: sonnet
sprint: "VSS:SP12"
docs: [.ai/audits/SP11-audit.md]
created: 2026-10-26
---

Finding 7 of the SP11 audit (`.ai/audits/SP11-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done in `vsslicer/modules/3mf/test/readProject.test.ts`: fixture loop now asserts `notices ?? []` is empty; new test pins
`fdm_roundtrip1.3mf` to dialect `prusa2` with no notices through the public `src/readProject.ts`.
- Probe, criterion 1: removed `['prusa2', readPrusa2]` from `src/readProject.ts` (restored): the loop row for fdm_roundtrip1.3mf and the new test both fail (2 failed).
- Bounds: the fix adds no parsing or input handling (test only); nothing to bound, no hostile test applies.
- Verify (macOS gate): 3mf lint, build clean; test 22 files / 357 tests pass; `run.mjs checks` passes.

Release lines: none (test only).

**Review passed (sp12-rev-vwr-401)**

Matches audit finding 7 exactly (notices empty in the loop, `fdm_roundtrip1.3mf` pinned to `prusa2`). Ran in
`vsslicer/modules/3mf`: lint, build clean; `pnpm test` 22 files / 358 pass; `run.mjs checks` exit 0.
Probe: deleted `['prusa2', readPrusa2]` from `src/readProject.ts` (restored): 2 fail (the loop row for
`fdm_roundtrip1.3mf` and the new pin test). Test only, no input handling, so no bound applies.
