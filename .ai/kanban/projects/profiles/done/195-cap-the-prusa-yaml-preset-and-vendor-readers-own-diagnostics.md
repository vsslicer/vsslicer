---
id: 195
title: "Cap the Prusa YAML preset and vendor readers' own diagnostics"
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 3 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

- Added `pushDiagnostic(list, d)` in `src/adapters/yaml/parse.ts` (cap MAX_YAML_DIAGNOSTICS, last entry "further diagnostics suppressed"); `parseYaml`'s `diag`, preset.ts `warn` and vendor.ts `warn` all use it.
- Tests: preset (10,000 non-map variants -> 1,001 diagnostics) and vendor (5,000 repeated documents without kind -> 1,001) in yaml-preset.test.ts and yaml.test.ts.
- Mutation probes: raising the cap check to 1e9 -> both new tests fail (restored).
Release lines: CHANGELOG: "Cap the preset and vendor YAML readers' own diagnostics at MAX_YAML_DIAGNOSTICS + 1." Export lines: none (pushDiagnostic is internal to adapters/yaml).
Verification (profiles-prusa): eslint and prettier clean on the changed yaml files; `pnpm lint` as a whole fails only on another card's files (export/prusa/export.ts no-control-regex, export-prusa.test.ts irregular whitespace); `pnpm build` ok; `pnpm test` 293 passed (293); `node scripts/run.mjs checks` ran to the end with no failure shown. CI gate platform: linux (ubuntu).


**Review passed (sp11-rev-prf-195-196)**
- Ran in profiles-prusa: `pnpm install` ok; `pnpm lint` 2 errors, both in another card's untracked export files (`src/adapters/export/prusa/export.ts` no-control-regex, `test/adapters/export-prusa.test.ts` no-irregular-whitespace); eslint + prettier on `src/adapters/yaml` and the two yaml tests clean; `pnpm build` ok; `pnpm test` 12 files, 293 passed; `node scripts/run.mjs checks` exit 0.
- Criteria: preset.ts `warn` and vendor.ts `warn` both go through `pushDiagnostic` (parse.ts), the same cap as `parseYaml`'s `diag`, with one "further diagnostics suppressed" at the end; the 10,000 non-map variant test is there, as the audit asked.
- Mutation probes (temporary, restored, cmp-checked): cap check raised to 1e9 -> both new tests fail; preset `warn` back to a raw push -> preset test fails; vendor `warn` back to a raw push -> vendor test fails; suppressed-marker message dropped -> both fail.
- Hostile probes at the audit's sizes (counts only): preset with 900k `- a` variants -> 1,001 diagnostics (was 900,000); vendor with 900k `---\na: 1` -> 1,001 (was 500,001).
- Layering: adapters/yaml only, intra-folder imports, no cross-module paths.
- In-place fix, no behaviour change: `pushDiagnostic` had been inserted between `parseYaml`'s JSDoc and `parseYaml`, so the doc comment attached to the wrong function; moved `pushDiagnostic` above that comment.
- Note: the preset/vendor list can hold the experimental-off line or the stream's 1,001 plus nothing more, so the total stays at MAX_YAML_DIAGNOSTICS + 1 in every probe.
