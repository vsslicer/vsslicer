---
id: 398
title: Match 3MF part names with a leading slash or other case in detectDialect
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 13 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Fixed in `3mf/src/domain/detectDialect.ts`: part names are normalised once (strip one leading `/`, lower case) into the set; the three part-name comparisons use the lower-case forms. Linear, one pass over names, no regex. Tests: 5 new rows in `test/detectDialect.test.ts` (CURA/, /Cura/, /Metadata/Slic3r_PE.config, lower-case config, mixed-case prusa3 json); the old `cura/x` -> core row became `curb/x` since `cura/` is now matched case-insensitively (per the audit).
Mutation probes: removing `.toLowerCase()` -> 9 tests fail; removing the leading-slash strip -> 3 fail.
Verify: 3mf lint, build, test (191 passed) ok; `node scripts/run.mjs checks` ok. CI gate platform: ubuntu.
Release lines:
- CHANGELOG: `detectDialect` matches part names case-insensitively and with a leading `/`.
- Export lines: none.

**Review passed (sp11-rev-vwr-398)**
- Ran in `vsslicer/modules/3mf`: `pnpm install`, `pnpm lint` (eslint, prettier, tsc ok), `pnpm build` ok, `pnpm test` 13 files / 201 tests passed (includes VWR-20's in-progress `readProject` tests, which are not this card's); `node scripts/run.mjs checks` exit 0.
- Fix matches audit finding 13: names normalised once at the top (one leading `/` stripped, lower case), the same rule as `src/adapters/opc/opcEdit.ts` `norm`; all three part-name comparisons use the lower-case forms. Domain layer, no imports added. The only caller is VWR-20's `application/readProject.ts`, which passes raw part names, so it benefits unchanged.
- Mutation probes (temp copy, `test/detectDialect.test.ts`, 29 tests): drop `.toLowerCase()` gives 9 failures; drop the slash strip gives 3; match `cura` without the trailing `/` gives 1 (the `curb/x` / `Curaf/x` row). Each new behaviour has a test that fails without it.
- Hostile probes: `//Cura/x`, `Cura`, `/`, `''`, `İ`, `Metadata/Slic3r_PE.config/` all give `core`; `/cura/` gives `cura`. 200,000 names run in one linear pass (no wall-time assert). The audit names no new bound; no input limit changed, so no bounds test is needed.
- `project.ts` `notices` is VWR-20's change, not reviewed here. CHANGELOG line is for the coordinator to add at release.
