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

Part A (gcode-parser) released and reviewed (PASS). Part B done (gcode-preview, application):
- load-preview.ts: `bgcodeText` and the gcode-bgcode import removed; `.bgcode` goes through `bgcodeSource` with `onDiagnostic: (d, at)` pushing `bgcode-<code>` diagnostics at `fileOffset: at`. `codecs` removed from `LoadOptions` (options now default to `{}`); callers updated (worker-entry.ts, load.test.ts, renderer.test.ts).
- The existing bgcode diagnostic test and the bgcode == gcode twin test pass unchanged in behaviour.
- No import of `@vsslicer/gcode-bgcode` remains in src, test or build scripts (grep).
Verified in gcode-preview: pnpm lint, pnpm test (43 pass, 0 fail), pnpm build, pnpm test:integration (9 passing).

coordinator: drop @vsslicer/gcode-bgcode from dependencies and re-lock (package.json line 82).
CHANGELOG (gcode-preview): - Changed: .bgcode files open through gcode-parser's `bgcodeSource`; no longer depends on gcode-bgcode.

Files: vsslicer/modules/gcode-preview/src/application/load-preview.ts, src/adapters/worker-entry.ts, test/load.test.ts, test/renderer.test.ts (codecs import/option only).

Review (gcode8995b-review): PASS, ran old (HEAD) and new loadPreview side by side on 7 .bgcode files (repo fixture, libbgcode, PrusaSlicer, Buddy incl. bad-crc, heatshrink) whole and truncated at 100 and 3000 bytes: diagnostics (code, severity, fileOffset, message), moveCount and totalTime identical in all 21 cases. No gcode-bgcode import in src/test/scripts; the bundle (dist/worker.js) still builds, includes bgcode code via gcode-parser, test:integration 9 passing. package.json still lists @vsslicer/gcode-bgcode (coordinator drops it and re-locks). Note: renderer.test.ts has no diff despite the Progress listing; harmless. 3 renderer test failures belong to concurrent GCP-35.
