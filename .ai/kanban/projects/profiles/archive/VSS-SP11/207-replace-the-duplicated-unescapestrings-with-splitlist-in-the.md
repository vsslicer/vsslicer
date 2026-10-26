---
id: 207
title: Replace the duplicated unescapeStrings with splitList in the physical printer reader
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 7 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done (sp11-prf-205-207). Deleted `unescapeStrings` from `src/adapters/physical/read.ts`; it imports `splitList` from `../import/flatten.ts`. Bounds unchanged (splitList is linear, the value is capped by parseIni's limits). Test `preset_names list (PRF-207)`: quoted `"a;b"` name and unterminated quote -> malformed diagnostic.
Mutation probe: replacing splitList with a no-split array -> 7 tests fail. Platform: Linux CI.
Verify: same run as PRF-205 (build ok, 250 tests passed, checks ok).
Release lines: CHANGELOG: "Changed: the physical printer reader shares splitList with the importer instead of a second copy of unescape_strings_cstyle." No export lines.

**Review passed (sp11-rev-prf-205-207)**
Same run as PRF-205 (build ok, 281/284 with the 3 failures in another card's export-prusa tests, physical+import 48/48, own files lint clean, checks ok).
`unescapeStrings` is gone from `src/adapters/physical/read.ts`; it imports `splitList` from `../import/flatten.ts` (same module, same layer). The semantics match: the audit fuzzed 200,000 strings with 0 differences, and the existing malformed `preset_names` tests still pass. Mutation probes: a no-split stand-in fails 7 tests; a splitList that never reports malformed input (`?? [s]`) fails 5, the new test among them. Bounds: unchanged, the value is still capped by parseIni.
Note for the coordinator: the untracked `src/adapters/export/prusa/serialize.ts:61` (another card's export work) adds a third copy of `unescapeStrings`. That card should import `splitList` too.
