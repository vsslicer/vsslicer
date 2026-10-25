---
id: 57
title: Add the modal state-change table to gcode-api
type: feature
priority: P0
effort: S
model: opus
area: [parser]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-57-worker
depends_on: [1]
created: 2026-10-25
---

Module: `gcode-api`, layer `domain`. Module model: `.ai/instructions.md` "Architecture rules" and D12.

GCP-1's review found the contract drops modal state the parser interprets: commanded feedrate, extrusion amounts, and fan, temperature and acceleration-limit changes. The planner (E4) and the fan and temperature colour modes need them, so they go into gcode-api before the parser (GCP-3) is written. Additive: a minor version bump.

## Acceptance criteria

- [x] `Chunk` and `ParsedFile` carry a sparse state-change table (move index, kind, value) covering feedrate (F), extrusion (E per move or as a table), fan (M106/M107), hotend and bed temperatures (M104/M109/M140/M190), acceleration and velocity limits (M204/M205/M201/M203/M566/`SET_VELOCITY_LIMIT`), pressure advance (M900/M572/`SET_PRESSURE_ADVANCE`) and tool changes; the 28-byte move record is unchanged
- [x] Type tests pin the whole shape of `Chunk`, `ParsedFile` and the new types (a field turning optional or changing type fails), not only the key lists
- [x] README and doc comments state: the segment start/end binding and what happens at chunk boundaries; that `fileOffset` is the offset in the decoded text stream (and for `.bgcode` what it refers to); that files past 4 GiB of decoded text produce a diagnostic, never a wrapped offset; that `Marker` is for uninterpreted commands only
- [x] `@vsslicer/gcode-api` 0.2.0 published to the local registry with a CHANGELOG entry

## Tasks

- [x] Design the state-change table against E4's planner inputs and the colour modes
- [x] Update types, docs and tests
- [x] Publish 0.2.0

## Progress

Done (module path `vsslicer/modules/gcode-api`, i.e. "repository root" read as `vsslicer/`).

- E is a dense f32 column per chunk (`Chunk.extrusion` / `ParsedFile.extrusion`, 4 B/move, worker-side only); every other interpreted change, including F, is a sparse 12-byte table (`Chunk.stateChanges` / `ParsedFile.stateChanges`, `StateKind` 0-20, `StateChange`, `STATE_CHANGE_STRIDE`, `readStateChange`/`writeStateChange`). Rationale and measured F/E densities on the reference corpus in `.reference/notes/GCP-57-state-changes.md`. Move record unchanged (28 B; layout test untouched).
- Kinds record the command per parameter (M204 S/P/R/T separate, M201/M203/M205/M566 per axis via `index`) so each firmware planner chooses what to honour (Klipper ignores M201/M203/M205).
- README + doc comments: start/end binding and chunk-boundary carry-over, decoded-text `fileOffset` (also `.bgcode`), `offset-overflow` diagnostic past 4 GiB, `Marker` uninterpreted only (tool changes are now state changes).
- Adopted `@vsslicer/tooling` ^0.4.0 lint: `pnpm lint` = eslint + prettier --check + tsc; `pnpm format`.
- Verified: `pnpm lint`, `pnpm test` (11 tests; type tests pin whole shapes of Chunk, ParsedFile, Layer, Marker, Diagnostic, Slicer, StateChange, StateKind, Move, ParseOptions, Parse), `pnpm build`. Mutation: making `Chunk.extrusion` optional and `ParsedFile.stateChanges` `| undefined` gave two TS2344 errors; reverted. Published 0.2.0 to the local registry; `rm -rf node_modules && CI=true pnpm install --frozen-lockfile --store-dir <empty tmp>` then lint/test/build green.
- Not done: no dependents of gcode-api exist yet to bump. Registry left running.

Files: `vsslicer/modules/gcode-api/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,.prettierignore,eslint.config.mjs,README.md,CHANGELOG.md,src/index.ts,src/domain/state-change.ts,src/domain/parsed-file.ts,src/domain/move-buffer.ts,test/types.test.ts,test/state-change.test.ts,test/move-buffer.test.ts (prettier only)}`, `.reference/notes/GCP-57-state-changes.md`.
