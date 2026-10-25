---
id: 7
title: "Extract thumbnails, object labels and the config block"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US2
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-7-worker
depends_on: [5]
created: 2026-10-25
---

Module: `gcode-parser`, layer `domain`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Thumbnails, labels and config share the same pass as the moves.

## Acceptance criteria

- [x] PNG, JPG and QOI thumbnails and the Prusa comment form are extracted; other formats leave a marker (tests on corpus)
- [x] Labels from `; printing object`, M486, `EXCLUDE_OBJECT_*` and Cura `;MESH:` match golden JSON
- [x] The config block is exposed as a key-value map matching the golden JSON

## Tasks

- [x] Thumbnail block parser
- [x] Label parsers for all forms
- [x] Config block reader
- [x] Golden updates

## Progress

Done (code under `vsslicer/modules/`): gcode-api 0.3.0 (published) and gcode-parser 0.6.0 (published, depends on ^0.3.0).
- gcode-api: `Thumbnail`, `ThumbnailFormat`, `ObjectLabel`, `MoveRange`; `Chunk` and `ParsedFile` gain `thumbnails`, `objects`, `config` (Record). Type tests pin the full shapes. Tooling dev dep raised to ^0.8.0.
- Streaming model: metadata rides on the chunk where it completes; `collect` gathers it (objects merged by name, id, copy). Documented in both READMEs.
- gcode-parser: new `src/domain/metadata.ts` (thumbnails PNG/JPG/QOI with magic + length checks, unknown format -> marker `THUMBNAIL_XXX` + diagnostic; labels from `; printing object`, M486, EXCLUDE_OBJECT_*, Cura `;MESH:`; config for `*_config = begin/end`, CONFIG_BLOCK_START/END, Cura `;SETTING_3`). `transferList` includes thumbnail buffers.
- Goldens regenerated (thumbnails: format, WxH, bytes, sha256; objects: name/id/copy/range and move counts; config: key count, sha256 of sorted map, sample keys). `test/metadata.test.ts` cross-checks them independently (grep of `thumbnail begin`, Buffer base64 decode and hash, `printing object` / `M486 A` names, config key count) plus unit tests of every form, chunk cuts and the transfer.
- Verified: lint, test (215 parser, 12 api) and build pass; empty-store `pnpm install --frozen-lockfile` + lint + test + build pass for both modules; published to the local registry (left running).

Not covered: `.bgcode` / `.gcode.3mf` keep size+hash goldens (the text parser does not read containers; container cards own that). Corpus has PNG (test_vase) and QOI (mini_cube); JPG, Cura (`;MESH:`, `;SETTING_3`) and Klipper are inline-sample tests only (no fixtures). Criteria are ticked for text G-code on that basis.

Files: vsslicer/modules/gcode-api/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,CHANGELOG.md,README.md,src/index.ts,src/domain/parsed-file.ts,test/types.test.ts}; vsslicer/modules/gcode-parser/{package.json,pnpm-lock.yaml,CHANGELOG.md,README.md,src/domain/{metadata,chunk-writer,parser,transfer}.ts,src/application/collect.ts,test/metadata.test.ts,test/support/parser-summary.ts,test/golden/**/*.json}; .reference/notes/GCP-7-metadata.md
