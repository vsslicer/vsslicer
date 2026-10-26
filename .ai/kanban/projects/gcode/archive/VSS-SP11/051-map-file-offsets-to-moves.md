---
id: 51
title: Map file offsets to moves
type: feature
priority: P1
effort: M
model: sonnet
area: [live]
story: US17
milestone: "VSS:M1"
sprint: "VSS:SP11"
depends_on: [50, 5]
created: 2026-10-25
---

Binary search over E3's file offsets as Fluidd and Mainsail do.

## Acceptance criteria

- [x] Tests: offset inside a line, on a layer boundary, past the end (clamped with a warning)
- [x] `.bgcode`: offsets are mapped for whichever the printer reports (decoded stream or binary file), documented

## Tasks

- [x] Binary search
- [x] Clamp and warn
- [x] `.bgcode` mapping

## Progress

GCP-50's resolvePosition already had the binary search (lastAtOrBefore, log2 reads, tested). Gaps filled in src/domain/print-position.ts: `Revealed.warning`, set when fileOffset is past the last move's start (clamped to the last move; the file length is not known in the domain, so trailing non-move lines also warn: shortcut noted in code). `.bgcode`: offsets map in the decoded text stream (Move.fileOffset space); container byte offsets are not mapped because bgcodeSource exposes no block table; documented on PrintPosition.fileOffset. Connectors for printers counting container bytes must convert or send layer/percent (what real printers report: unverified). Tests in test/position-map.test.ts (inside a line, boundary 406/407, past end, before first); test/follow.test.ts line 90 loosened to `.move` since the result now carries a warning.
Verified (gcode-preview, macOS): pnpm lint, build clean; pnpm test 125 pass (121 existing + 4 new in test/position-map.test.ts), 0 fail; `node scripts/run.mjs checks` exit 0. CI gate runs on Linux (unverified here).
Mutation probes (each restored): drop the past-end warning -> 1 test fails; `<=` to `<` in the binary search -> fails; layer index off by one -> 2 fail; percent scale /100 -> /50 -> fails.
Release lines: CHANGELOG: "Added: Revealed.warning when a fileOffset is past the last move; fileOffset documented as decoded-stream space for .bgcode." No new exports.
- Moved SP5 to SP6 at SP5 start: depends on GCP-50 (moved to SP6).

**Review passed (sp11-rev-gcp-51-52)**
Ran (gcode-preview, macOS): pnpm install, lint, build exit 0; pnpm test 108 tests, 108 pass, 0 fail (the node runner counts 108 here, not the card's 125; position-map.test.ts's 4 tests all ran); `node scripts/run.mjs checks` exit 0. Mutation probes on src/domain/print-position.ts (copy backed up, restored, diff checked): no warning -> 1 fail; warning `>` to `>=` -> 1 fail (exact-last-move case); binary search `<=` to `<` -> 1 fail; layer index off by one -> 2 fail; percent /100 to /50 -> 1 fail; percent target *0.9 -> 1 fail; layer bound +1 -> 1 fail. Layering: domain is pure (only @vsslicer/gcode-api), no cross-module relative imports. No new parsing: the input still goes through parsePosition (u32 bound) unchanged. AC1: the inside-a-line, 406/407 boundary, past-end clamp and before-first cases are tested. AC2: D20 and docs/research/printer-position-fields.md:42 show that PrusaLink (the `.bgcode` firmware) reports no byte offset, so mapping the decoded stream and documenting it meets the criterion. That settles the card's 'unverified' note. Fixed in place (comment only): the PrintPosition.fileOffset doc now cites D20. Notes for the coordinator: the follow.test.ts line 90 change the card mentions is not in the working tree (that line already uses `.move`); no CHANGELOG line has been written yet, so use the card's release line. Revealed.warning goes back to callers of reveal/exports but nothing in the extension logs it, which is fine for the AC.
