---
id: 84
title: "Open .bgcode in the parser: same ParsedFile as the .gcode twin, metadata in the golden JSON"
type: feature
priority: P1
effort: M
model: sonnet
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-84-worker
depends_on: [14]
created: 2026-10-25
---

Module: gcode-parser, layer: adapters. Split from GCP-14 (SP3 review r-wave3): gcode-bgcode 0.4.x decodes a `.bgcode` to its `.gcode` twin and exposes `BgcodeMetadata`, but the parser does not open `.bgcode` yet.

## Acceptance criteria

- [x] Opening a `.bgcode` gives the same `ParsedFile` as its `.gcode` twin (both corpus pairs)
- [x] All bgcode metadata blocks appear in the golden JSON
- [x] A Slicer3 JSON-encoded block is covered (synthetic fixture until a real one exists)

## Progress

Done, published `@vsslicer/gcode-parser` 0.10.0 (local registry).

- `src/adapters/bgcode-source.ts`: `bgcodeSource(bytes, { onMetadata, onDiagnostic })` decodes a `.bgcode` with `@vsslicer/gcode-bgcode` ^0.4.2 (`bgcodeToGcode`) to the twin's text bytes for `parse`; exported from `src/index.ts`.
- `test/bgcode.test.ts`: `collect(parse(bgcodeSource(.bgcode)))` toEqual the twin's, for both pairs (`mini_cube_ps2.8.1`, `mini_cube_b`); metadata and no diagnostics; synthetic Slicer3 JSON block file.
- Finding: the corpus `mini_cube_ps2.8.1.gcode` is PrusaSlicer's own file; it differs from the decoded `.bgcode` in the order of 10 comment lines (so tail fileOffsets differ). The true twin is libbgcode's converter output, added as `*.twin.gcode` (both pairs); see PROVENANCE.
- Goldens: `.bgcode` entries now carry the full parser fields plus a `bgcode` object (file, printer, print entries in full; slicer INI as count, hash, sample; slicerJson; thumbnails). Other 14 goldens regenerated unchanged.
- Verified: `pnpm lint && pnpm test (319 pass) && pnpm build`, then `pnpm publish --no-git-checks`.
- Not done: no real Slicer3 JSON fixture exists (synthetic only, as the card allowed). Slicer3 JSON golden entry is covered by `slicerJson: null` in real files only. Dist published includes the uncommitted GCP-83 0.9.0 sources in the tree.
- Files: src/adapters/bgcode-source.ts, src/index.ts, package.json, pnpm-lock.yaml, README.md, CHANGELOG.md, test/bgcode.test.ts, test/support/parser-summary.ts, test/fixtures/manifest.json, test/fixtures/prusaslicer/{PROVENANCE.md,mini_cube_b.bgcode,mini_cube_b.twin.gcode,mini_cube_ps2.8.1.twin.gcode}, test/golden/prusaslicer/{mini_cube_ps2.8.1.bgcode,mini_cube_b.bgcode,mini_cube_b.twin.gcode,mini_cube_ps2.8.1.twin.gcode}.json (all under vsslicer/modules/gcode-parser).
