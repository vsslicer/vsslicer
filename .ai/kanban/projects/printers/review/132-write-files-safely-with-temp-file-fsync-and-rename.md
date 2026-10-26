---
id: 132
title: "Write files safely with temp file, fsync and rename"
type: feature
priority: P0
effort: S
model: sonnet
area: [storage]
story: US27
milestone: "VSS:M3"
sprint: "VSS:SP9"
depends_on: [130]
created: 2026-10-25
---

Safe write to the target volume.

**Code:** `vsslicer/modules/printer-folder/src/adapters/...` (module: `printer-folder`, layer: `adapters`)

## Acceptance criteria

- [x] Write to a temp name in the target directory, `fsync`, then rename; an aborted export (AbortSignal) leaves no partial file under the final name (test)
- [x] A full disk gives a typed `PrinterError.refused`, not a truncated file
- [x] **Bounds:** the temp name is unique and in the target directory (no `..`, length within the folder's name rules from `names.ts`); writes are streamed in chunks (no full-buffer copy of the input); a failed write removes the temp file; tests count bytes and calls, never time

## Tasks

- [x] Safe writer
- [x] Abort and full-disk tests

## Progress

Added `src/adapters/safe-write.ts` (+ `src/adapters/index.ts`) and `test/safe-write.test.ts` in printer-folder.
`writeFileSafely(dir, name, source: AsyncIterable<Uint8Array>, {signal, ops, longFilenames})`: sanitises the name via `names.ts`, creates a unique `XXXXXXXX.TMP` (8 hex digits, valid 8.3, `wx`, at most 4 EEXIST retries) in `dir`, streams chunks as subarray views of at most 64 KiB (handles short writes), fsyncs, closes, renames. Any failure or abort unlinks the temp file. ENOSPC/EDQUOT/EACCES/EPERM/EROFS become `PrinterError('refused')`, other errno `unreachable`; abort reasons pass through. `FileOps` is injectable; tests inject an ENOSPC write (no real disk filling).
Verified: `pnpm test` 63 passed (9 new: write, temp name, collision retry bound, ENOSPC keeps old target, abort mid-stream, pre-aborted creates nothing, chunk cap and short writes by byte counts, rename failure, path-traversal name), `pnpm build` ok. No test asserts time.
Not done / for the coordinator: printer-folder does not yet declare `@vsslicer/printer-api` (not published to the registry, so I verified with a temporary node_modules symlink, removed afterwards). Until `package.json` gets `"dependencies": {"@vsslicer/printer-api": "^0.0.0"}` (or the right range) and installs, `pnpm lint` fails import-x/no-extraneous-dependencies and tsc/test cannot resolve it. Shared-file line for `src/index.ts`: `export * from './adapters/index.ts';`. Directory-entry fsync after rename is not done (shortcut noted in code).

**Carried to SP10 (sp9-coordinator, 10:41):** it needs `@vsslicer/printer-api` published (still 0.0.0) before it can lint and be reviewed. The unreviewed work is parked, untracked, under `.ai/local/wip/SP9/` at the same paths (vsslicer/modules/printer-folder/src/adapters/, test/safe-write.test.ts); move it back with `mv` before continuing. Nothing of it is committed.
