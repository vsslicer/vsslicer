---
id: 95
title: "Use gcode-parser's bgcodeSource in loadPreview and drop the gcode-bgcode dependency"
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-preview (application). Finding 11 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] loadPreview opens .bgcode through bgcodeSource; gcode-preview no longer depends on gcode-bgcode; tests pass

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Part A (gcode-parser) DONE, card stays in doing for part B.

Review (gcode95-review): PASS (part A), bgcodeSource offset `at` is computed identically to gcode-preview load-preview.ts L20-35 (sum of yielded text bytes, read when the diagnostic event arrives); extra trailing arg is backward compatible; gcode-parser pnpm install/lint/test (338 passed)/build all pass; card left in doing for part B.

Part A: `bgcodeSource`'s `onDiagnostic` is now `(diagnostic, textOffset: number) => void`; `textOffset` = decoded text bytes yielded before the problem (same `at` loadPreview computes). Backward compatible (extra trailing arg). `bgcodeSource` and `BgcodeSourceOptions` are already exported from the package entry `src/index.ts` (L4-5). Verified in modules/gcode-parser: `pnpm lint`, `pnpm test` (338 passed, +1 new test 'reports the decoded-text offset with each diagnostic (truncated file)'), `pnpm build` all pass.
Files: vsslicer/modules/gcode-parser/src/adapters/bgcode-source.ts, vsslicer/modules/gcode-parser/test/bgcode.test.ts.
CHANGELOG (gcode-parser, minor): - Added: `bgcodeSource` passes the decoded-text offset as a second argument to `onDiagnostic`.

Part B (after gcode-parser is released; bump the preview's `@vsslicer/gcode-parser` range to that version):
1. gcode-preview/src/application/load-preview.ts: delete `bgcodeText` (L19-35) and the `@vsslicer/gcode-bgcode` import (L4); import `bgcodeSource` from `@vsslicer/gcode-parser`. In `loadPreview`: `const text = kind === 'bgcode' ? bgcodeSource(bytes, { onDiagnostic: (d, at) => container.push({ code: `bgcode-${d.code}`, severity: d.severity, fileOffset: at, message: d.message }) }) : bytes;` (keep the `bgcode-` prefix and the push-after-collect).
2. Remove `codecs` from `LoadOptions` (bgcodeSource has deflate/heatshrink11/12 baked in) and the `Codec` import; update callers: src/adapters/worker-entry.ts (L5 import and where codecs are passed), test/load.test.ts (L7), test/renderer.test.ts (L8), plus any other `codecs:` use (grep).
3. Remove `@vsslicer/gcode-bgcode` from package.json dependencies (L82); coordinator updates lockfile via pnpm install. Check the bundle/worker build config for gcode-bgcode references.
4. Verify: pnpm install && lint && test && build; the existing bgcode diagnostic test in test/load.test.ts must still see the same codes and fileOffset values.
