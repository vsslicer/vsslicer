---
id: 196
title: Count YAML documents against the parser node cap
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 9 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

- In the stream loop of `src/adapters/yaml/parse.ts` each document now counts one node; past MAX_YAML_NODES it adds a `too-many-nodes` diagnostic and stops reading.
- Test: 1,000,100 bare `---` lines -> stats.nodes = MAX+1, documents <= MAX, too-many-nodes present. Existing scalar-too-long test now allows 2 nodes (document + scalar).
- Mutation probe: replacing the count condition with `false` -> the new test fails (restored).
Release lines: CHANGELOG: "Count each YAML document against the parser node cap."
Verification (profiles-prusa): eslint and prettier clean on the changed yaml files; `pnpm lint` as a whole fails only on another card's files (export/prusa/export.ts no-control-regex, export-prusa.test.ts irregular whitespace); `pnpm build` ok; `pnpm test` 293 passed (293); `node scripts/run.mjs checks` ran to the end with no failure shown. CI gate platform: linux (ubuntu).


**Review passed (sp11-rev-prf-195-196)**
- Ran in profiles-prusa: `pnpm install` ok; `pnpm lint` 2 errors, both in another card's untracked export files (`src/adapters/export/prusa/export.ts`, `test/adapters/export-prusa.test.ts`); eslint + prettier on the yaml files clean; `pnpm build` ok; `pnpm test` 12 files, 293 passed; `node scripts/run.mjs checks` exit 0.
- Criteria: the stream loop in `src/adapters/yaml/parse.ts` counts each document against MAX_YAML_NODES and stops with `too-many-nodes`; the audit's "call node() once per document" is met by the same increment and message as `node()` (inline, since there is no node object yet). Optional `Fail` change not taken; fine, it was optional.
- Mutation probe (temporary, restored, cmp-checked): only the stream-loop count disabled -> "bare --- documents count against the node cap (PRF-196)" fails.
- Hostile probe (counts only): 1.3M repeats of `---\n@\n` (the audit's failing-document case) -> 999,999 documents, nodes 1,000,001, diagnostics 1,001: the cap now bounds it.
- Layering: adapters/yaml only, no cross-module imports. No wall-time asserts in the new test.
