---
id: 1
title: Define the @vsslicer/gcode package API and move-buffer layout
type: feature
priority: P0
effort: M
model: opus
area: [parser]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-1-worker
depends_on: [PLT-2, PLT-8]
created: 2026-10-25
---

Module: `gcode-api` (`@vsslicer/gcode-api`, domain types only): the shared G-code model that `gcode-parser`, `toolhead-sim` and the `gcode-preview` extension depend on. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

The data contract every other epic reads: ParsedFile, Chunk, move buffer (about 28 bytes per move), layer table, diagnostics.

Needs the PLT monorepo, vitest and CI (PLT:E1) before it can start; those cards belong to the platform worker.

## Acceptance criteria

- [x] Types for `parse(source, opts) -> AsyncIterable<Chunk>` and `ParsedFile` compile and are exported; a type-level test pins the field list
- [x] Buffer layout is f32x3 position, f16 width and height, u8 role, tool and flags, u32 file offset, f32 start time, and a unit test asserts the byte size per move
- [x] Diagnostic type carries a code, severity and file offset

## Tasks

- [x] Read the E3 scope and D2 provenance rule
- [x] Write the types and the layout constants with a doc comment per field
- [x] Add the type tests
- [x] Note the layout in the package README

## Progress

Done. New module `vsslicer/modules/gcode-api` (`@vsslicer/gcode-api` 0.1.0, domain layer only), copied from `modules/example`, on `@vsslicer/tooling` ^0.3.0; published 0.1.0 to the local registry.

- `Parse` (`(source: AsyncIterable<Uint8Array>, opts?: { signal?: AbortSignal }) => AsyncIterable<Chunk>`), `Chunk`, `ParsedFile` (slicer, moveCount, moves as chunk ArrayBuffers, layers, markers, diagnostics), `Layer { z, firstMove }`, `Marker`, `Diagnostic { code, severity, fileOffset, message }`.
- Move record, interleaved, 28 bytes: position f32x3 @0, width/height f16 @12/14, role/tool/flags u8 @16-18, pad @19, fileOffset u32 @20, startTime f32 @24; every field aligned to its element size for WebGL2 `vertexAttribPointer`. `MoveRole` follows libvgcode's role order (provenance line, D2) plus `Unknown`; `MoveFlag` Travel/Retract/Unretract/Wipe/Arc; `readMove`/`writeMove` over a DataView.
- Metadata from US2 (labels, thumbnails, config, summary) is not in `ParsedFile` yet; adding it is a minor bump.

Verified: `test/move-buffer.test.ts` asserts stride 28, alignment, no overlap and a round trip; `test/types.test.ts` pins the field lists with `expectTypeOf`, checked by `tsc` as part of `pnpm test` (adding a field fails it, checked by hand). `CI=true pnpm install --frozen-lockfile --store-dir <empty tmp> && pnpm test && pnpm build` in the module and `CI=true node scripts/run.mjs ci` both pass. Without `CI=true`, run.mjs fails in tooling's install (pnpm no-TTY modules purge), which is not this module's problem.

Files: `vsslicer/modules/gcode-api/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,.npmrc,LICENSE,CHANGELOG.md,README.md,tsconfig.json,tsconfig.test.json,vitest.config.ts,src/index.ts,src/domain/move-buffer.ts,src/domain/parsed-file.ts,test/move-buffer.test.ts,test/types.test.ts}`; notes `.reference/notes/GCP-1-gcode-api.md`.
