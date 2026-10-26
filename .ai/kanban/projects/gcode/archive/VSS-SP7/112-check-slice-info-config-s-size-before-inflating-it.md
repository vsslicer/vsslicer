---
id: 112
title: "Check slice_info.config's size before inflating it"
type: bug
priority: P2
effort: S
model: sonnet
sprint: "VSS:SP7"
owner: sp7-gcp-a
docs: [.ai/audits/SP6-audit.md]
created: 2026-10-26
---

Module: gcode-parser (adapters). Finding 7 of the SP6 audit, `.ai/audits/SP6-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] Fixed as the audit describes
- [x] A test that fails before the fix
- [x] Bounds (rule 25): the declared uncompressed size of Metadata/slice_info.config is compared with MAX_SLICE_INFO_BYTES (4 MiB) before inflating; oversize gives the 'statistics skipped' diagnostic
- [x] Hostile test: an entry declaring more than 4 MiB is never inflated

## Tasks

- [x] Fix as the audit describes

## Progress

Done: `readGcode3mfPlate` compares the central-directory size of `Metadata/slice_info.config` with MAX_SLICE_INFO_BYTES before inflating; over the limit it skips inflating and emits `gcode-3mf-slice-info-size`. The post-inflate length check stays for a lying directory.
Files: vsslicer/modules/gcode-parser/src/adapters/gcode-3mf-plate.ts, test/gcode-3mf-plate.test.ts (new test spies on `openZip().inflated`; fails with the fix disabled, passes with it).
Verified: pnpm lint ok, build ok, gcode-3mf-plate tests 19/19. Full `pnpm test` shows 1-3 intermittent failures of the existing 500 ms wall-clock assertions in 'scanner is linear on hostile input' (4 MiB shapes) under machine load; untouched by this card.
Not done: nothing. Shared-file lines: none.
Review (sp7-rev-a): PASS. Read the diff (src/adapters/gcode-3mf-plate.ts, test/gcode-3mf-plate.test.ts); no shared files touched. `pnpm lint && pnpm test && pnpm build` green (368 tests, the wall-clock "scanner is linear" tests passed this run). Probe (/private/tmp/claude-501/sp7w.3nRn/gcp112-probe.ts): honest 400 MB entry (zip under 1 MB) gives the diagnostic in 7 ms with ~1 MB RSS growth, never inflated; exactly 4 MiB is read, 4 MiB + 1 gets the diagnostic; the H2C fixture still has statistics. Lying central directory (declares 1 KB or exactly 4 MiB, inflates to 400 MB): `inflated` in @vsslicer/3mf 0.1.0 stops the stream once it passes the declared size (fflateZip.js `inflates past its declared size`, 64 KiB input slices), so `readGcode3mfPlate` throws CorruptZipError in about 0.2 s instead of inflating it all. That is an exception, not the diagnostic, and it is the same as before this card. Fixed in place (comment only): the new comment said the post-inflate length check "stays for a lying central directory"; that check cannot fire (decoded length <= bytes = declared <= 4 MiB), so the comment now says what catches a lying size. The leftover `info.length > MAX` checks are dead but harmless.
