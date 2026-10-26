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
sprint: "VSS:SP10"
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

**Review failed (sp10-rev-prn-132)**

Ran in `vsslicer/modules/printer-folder` (with the coordinator's `@vsslicer/printer-api@^0.1.0` and the `src/index.ts` export): `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 63 passed (4 files, 9 in safe-write), `node scripts/run.mjs checks` exit 0. Layering ok (node fs only in `adapters`, imports `domain/names.ts` inward, no cross-module relative imports). No wall-time asserts.

Mutation probes (mktemp copy, `test/safe-write.test.ts`): caught: dropping the temp unlink (5 fail), dropping the 64 KiB cap (1), ignoring short writes (1), copying instead of `subarray` (1), dropping the ENOSPC mapping (1), using the raw name (3), dropping the pre-abort check (1). **Survived (9/9 pass):** `TEMP_ATTEMPTS = 100`, deleting `await file.sync()`, deleting the in-loop `throwIfAborted`, `open(path, 'w')` instead of `'wx'`.

Hostile probes (real fs, macOS): a symlink planted at the final name is replaced, not followed (outside file untouched); a directory at the final name is left intact (EISDIR, mapped `unreachable`); `'wx'` refuses a symlink planted at a temp name (EEXIST, target untouched); names `..`, `../x`, `a/../../b`, `..\..\x`, NUL, `CON`, `con .gcode`, `nul.txt`, `COM¹`, fullwidth `ＣＯＮ`, 2000-char and 200x`é` inputs all stay inside the directory with safe names in both modes.

1. `src/adapters/safe-write.ts:104-106`: the errno mapping is applied to every error, including ones thrown by the **source** iterable and by abort. Probes: a source that throws `{code:'EACCES'}` comes back as `PrinterError('refused', 'the target refused the write')`; a source that throws Node's `AbortError` (`code: 'ABORT_ERR'`, which is what `fs.createReadStream(p, {signal})` and `stream` helpers throw on abort) comes back as `PrinterError('unreachable', 'the target failed: ABORT_ERR')`; an abort with a reason carrying `code: 'ETIMEDOUT'` becomes `unreachable`. So a user cancel can surface as a printer failure, and a failure to read the G-code blames the printer. Rule: map only errors raised by the target's `FileOps`/`OpenFile` calls (create, write, sync, close, rename); source errors and the abort reason pass through unchanged (e.g. `if (signal?.aborted) throw signal.reason` first, and wrap the ops calls rather than the whole body). Add tests for a throwing source and for an `ABORT_ERR` source.
2. `test/safe-write.test.ts:35-50, 79-90` and no test for fsync: four bounds the card names cannot fail (survivors above). (a) The "bounded number of times" test never counts calls in its always-EEXIST case (`calls = -100` is dead), so 100 or 10^6 attempts pass; assert the create-call count equals the bound. (b) AC1 "fsync, then rename" has no test: record the op order through injected `FileOps` (`create, write..., sync, close, rename`) and assert sync precedes rename and that a failing `sync` unlinks the temp and leaves no final name. (c) The abort test passes with the in-loop check removed because the post-loop check catches it; assert no `write` call happens after the abort (count writes). (d) `nodeFileOps.create`'s "must fail with EEXIST" contract is untested; one test creating an existing path through `nodeFileOps.create` (and one with a symlink there) pins `'wx'`.

Not blocking, for the fix or a follow-up:
- Directory fsync shortcut (`safe-write.ts:63`): acceptable as a documented shortcut against the card's ACs, but the main target is removable media pulled without eject, where the renamed entry can still be only in the page cache when the export reports success. It is ~5 lines (open the dir read-only, `sync()`, close; ignore EISDIR/EPERM/EINVAL/EBADF where the platform refuses, e.g. Windows); I recommend doing it in this fix. Note also that on macOS `fsync` does not flush the device cache (`F_FULLFSYNC`); unmount/eject is the real guarantee there.
- EISDIR/ENOTDIR at the final name maps to `unreachable`; `refused` fits better (retrying will not help).
- The writer replaces an existing file of the same (or case-aliased) name silently; say so in the doc comment so callers use `uniqueName` when they must not overwrite.
- An input like `deadbeef.tmp` sanitises to a name in the temp-name space, so two concurrent writers into one folder could rename over each other's in-flight temp. Rare; rejecting (or suffixing) a final name that matches the temp pattern `^[0-9A-F]{8}\.TMP$` would close it.
- Long-name mode: 200x`é` is 400 UTF-8 bytes, fine on FAT/exFAT/APFS but ENAMETOOLONG on an ext4 folder target (card 130's `names.ts`, not this card).

**Fix for the failed review (sp10-prn-132-fix)**

Changed `src/adapters/safe-write.ts`, `test/safe-write.test.ts` (printer-folder).
1. Errno mapping now wraps only the `FileOps`/`OpenFile` calls (create, write, sync, rename, syncDir) via a `target()` helper; source errors and abort reasons pass through unchanged (tests: source throwing EACCES, `ABORT_ERR` source, abort reason with `ETIMEDOUT`, all `rejects.toBe` the same object).
2. Tests that can fail: (a) always-EEXIST counts creates, expects exactly 4; (b) recorded op order `create, write, sync, close, rename, syncDir`, and a failing sync never renames and leaves an empty dir; (c) write count is 1 when the signal aborts inside the first write of a 3-chunk input; (d) `nodeFileOps.create` on an existing path and on a symlink gives EEXIST, target untouched.
Coordinator's extras: directory fsync after rename (`FileOps.syncDir`, EINVAL/EPERM/EISDIR/EBADF/ENOTSUP/EACCES ignored, others map to PrinterError; tested through injected ops), EISDIR/ENOTDIR map to `refused`, doc comment says an existing file is replaced. `names.ts` length note and the temp-pattern final-name note left alone.
Mutation probes (each fails the suite): TEMP_ATTEMPTS 100 (1 fail), delete `file.sync()` (2), delete in-loop `throwIfAborted` (1), `'wx'`->`'w'` (1), skip `syncDir` (2), map errno on source errors (1), drop EISDIR mapping (1). Restored after each.
Verified: `pnpm lint` ok, `pnpm build` ok, `pnpm test` 70 passed (4 files), `node scripts/run.mjs checks` exit 0.

**Review passed (sp10-rerev-prn-132)**

Ran in `vsslicer/modules/printer-folder`: `pnpm install --frozen-lockfile` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 70 passed (4 files, 16 in safe-write), `node scripts/run.mjs checks` exit 0. `package.json` declares `@vsslicer/printer-api` ^0.1.0 as a runtime dependency (printer-api is at 0.1.0), the lockfile adds only that package, `src/index.ts` exports `./adapters/index.ts`. Layering ok (node fs only in `adapters`, inward import of `domain/names.ts`). No wall-time asserts.

Earlier problems: (1) fixed, errno mapping wraps only `FileOps`/`OpenFile` calls through `target()`; source errors, `ABORT_ERR` sources and abort reasons pass through by identity (tested). (2) fixed, all four earlier survivors now fail the suite. Coordinator's extras done: directory fsync after rename with tolerated codes, EISDIR/ENOTDIR to `refused`, doc comment on replacement.

Mutation probes (mktemp copy, safe-write.test.ts), caught: TEMP_ATTEMPTS 100 (1 fail), no file `sync` (2), no in-loop abort check (1), `'w'` for `'wx'` (1), no `syncDir` call (2), EISDIR mapping dropped (1), EPERM dropped from the tolerated set (1), swallow every dir-sync error (1), errno-map source errors (1), no temp unlink (6). Survived (not blocking, no card bound names them): EACCES dropped from the tolerated set (only EPERM is tested), `nodeFileOps.syncDir` not calling `sync` (real-fs, unobservable without a seam), mapping code-less target errors, dropping the pre-rename abort check (an abort there would still rename a complete file), and `n > 0` to `n < 0` (a write that returns 0 then loops forever; the guard has no test).

Hostile probes (real fs, macOS, against `dist`): symlink at the final name is replaced, the outside file untouched; directory at the final name now gives `refused` (cause EISDIR), directory contents intact, no temp left; symlink at a temp name gives EEXIST from `nodeFileOps.create`, target untouched; `..`, `../x`, `a/../../b`, `..\..\x`, NUL, `CON`, `con .gcode`, `nul.txt`, `COM¹`, fullwidth `ＣＯＮ`, 2000 x `x`, 200 x `é` all land as one safe entry inside the directory in both name modes.

EACCES in the directory-fsync tolerated list: acceptable. With `nodeFileOps`, EACCES can only come from `open(dir, 'r')` (fsync(2) and close(2) do not return it), i.e. a write-and-search-only directory the process cannot read. The file data was already fsynced before the rename; only the directory-entry flush is skipped, the same degradation as EPERM on Windows. Real I/O failures (EIO, ENOSPC) still surface as `PrinterError`.

Fixed in place (no behaviour change): CHANGELOG entry for PRN-132; doc comment rewrapped and now says a failed directory fsync rejects although the complete file is already in place.

Follow-ups (not blocking): a test for a write that returns 0 (the guard against a hang); a test tolerating EACCES; the earlier notes on final names matching the temp pattern `^[0-9A-F]{8}\.TMP$` and long-name byte length on ext4 still stand.
