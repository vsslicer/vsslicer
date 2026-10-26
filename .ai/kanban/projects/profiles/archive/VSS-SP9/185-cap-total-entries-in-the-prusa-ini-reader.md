---
id: 185
title: Cap total entries in the Prusa INI reader
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP9"
docs: [.ai/audits/SP8-audit.md]
created: 2026-10-26
---

Finding 2 of the SP8 audit (`.ai/audits/SP8-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] `parseIni` (`profiles-prusa/src/adapters/ini/parse.ts`) caps total entries at `MAX_ENTRIES = 500_000` and stops with one diagnostic, the way `MAX_SECTIONS` does (the pinned PrusaResearch.ini has about 100,000)
- [x] **Bounds:** a test of 60 sections x 9,999 `a=` lines stops at the cap and counts entries returned (at most 500,000) and diagnostics (one for the cap), never time or heap; existing caps (64 MiB, 50,000 sections, 10,000 keys per section, 1,001 diagnostics) are unchanged
- [x] The pinned PrusaResearch.ini golden test still passes

## Progress

Added `MAX_ENTRIES = 500_000` and a running total in `parseIni` (`src/adapters/ini/parse.ts`). At the cap it pushes one error diagnostic ("more than 500000 entries; rest of the file not read") and breaks. That diagnostic bypasses the 1,001 diagnostics cap on purpose: the audit's input (all `a=` duplicates) fills that cap with duplicate-key warnings first, which would hide why the parse stopped. Other caps are unchanged.
Test added in `test/adapters/ini.test.ts`: 60 sections x 9,999 `a=` lines; asserts entries == 500,000, exactly one cap diagnostic, total diagnostics <= 1,002. No timing. `pnpm test` 131 passed (pinned PrusaResearch.ini golden test ran, file present), `pnpm lint` clean, `node scripts/run.mjs checks` passed.
Shared file: coordinator may want to export `MAX_ENTRIES` from `src/index.ts` if the other caps are exported there (not touched by me).

**Review passed (sp9-rev-prf-185)**: ran `pnpm test` (131 passed), `pnpm lint` clean, `pnpm build` ok, `node scripts/run.mjs checks` exit 0. Re-ran the audit's probe on `src/adapters/ini/parse.ts` (node --expose-gc, temp dir): 63 MiB of `[print:sN]` + 9,999 `a=` lines now gives 500,000 entries (was 22 M), heap delta 28 MB (was 1,234 MB), 1,002 diagnostics, exactly one cap diagnostic, last; the same size with distinct keys gives 500,000 entries, 1 diagnostic, 30 MB. Mutation (cap check disabled in a temp copy) fails the new test. No wall-time assertion. Cap diagnostic past the 1,001 cap: judged right. It is pushed at most once, followed by `break`, so the bound is 1,002, and without it the probe input (1,000 duplicate warnings + "suppressed") would hide why the parse stopped. Note for later, not this card: the `MAX_SECTIONS` stop message still goes through `diag()` and can be suppressed the same way.
