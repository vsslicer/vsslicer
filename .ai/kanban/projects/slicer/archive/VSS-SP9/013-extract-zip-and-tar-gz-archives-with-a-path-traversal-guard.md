---
id: 13
title: Extract zip and tar.gz archives with a path-traversal guard
type: feature
priority: P0
effort: S
model: opus
area: [engine]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP9"
depends_on: [8]
created: 2026-10-25
---

Extracts release archives into the install directory. Security-sensitive: archive paths are untrusted.

**Code:** `vsslicer/modules/slicer-runtime/src/adapters/...` (module: `slicer-runtime`, layer: `adapters`)

## Acceptance criteria

- [x] Entries with `..`, absolute paths or symlinks that escape the target are rejected (negative fixtures built at test time)
- [x] Executable bits survive extraction on POSIX
- [x] Extraction is all-or-nothing: a failure removes the partial directory
- [x] **Bounds:** at most 100,000 entries, path at most 4,096 bytes, each file at most 1 GiB and 4 GiB in total, enforced while inflating; tar header checksums validated, hard links and device files refused, gzip and zip bombs (ratio over 1000:1 past 1 MiB) refused; tests count bytes and entries, never time
- [x] zip via fflate 0.8.3 (already in package.json, coordinator), gzip via `node:zlib`, tar parsed in the module; no other dependency

## Tasks

- [x] Extractor
- [x] Negative archives
- [x] Tests

## Progress

sp9-slc-13, 2026-10-26:

- Added `src/adapters/extract-archive.ts`: `extractArchive(archive, dest, limits?)`, `EXTRACT_LIMITS`, `ArchiveError`, `safeParts`. Format by magic bytes (zip `PK\3\4`, gzip `1f8b`). Writes into a sibling `.<dest>.partial-XXXX` staging dir (mkdtemp), renames to `dest` on success, `rm -rf` on any failure; `dest` must not exist.
- zip: own EOCD/central-directory parser (fflate's unzip exposes no unix attrs), deflate via fflate `Inflate` in 16 KiB pushes, CRC via `zlib.crc32`, size+CRC checked against the directory. Refuses zip64, multi-disk, encrypted, methods other than stored/deflate, device/fifo modes.
- tar.gz: `node:zlib` gunzip stream, tar parsed in the module: checksum (unsigned or signed), ustar prefix, pax `path`/`linkpath`, GNU `L`/`K`; refuses hard links, devices/fifos, base-256 sizes, pax `size`, unknown types, dirs/symlinks with data.
- Paths: NUL, backslash, leading `/`, drive letters, `..` refused; `.`/empty parts dropped; duplicates refused. Symlinks: absolute targets refused, lexical escape refused, then created only after all files and each checked with `realpath` against the staging root (catches chains like `sub/c -> ..`, `sub/e -> c/../..`); nothing is ever written through a link. Modes kept as `mode & 0o755` (exec bits survive; setuid/sticky/group-write dropped).
- Bounds (defaults; callers may only tighten, validated as safe integers in 1..default): 100,000 entries, 4,096-byte paths, 1 GiB per file, 4 GiB total, enforced per inflated chunk; ratio over 1000:1 refused once past 1 MiB (zip per entry, gzip over the stream).
- Exported from `src/adapters/index.ts` (`export * from './extract-archive.ts';`).
- Tests: `test/extract-archive.test.ts`, 36 cases, all archives (including negatives and 32 MiB-zero bombs) built at test time in a mkdtemp dir; each refusal also asserts the parent dir is empty. Module: 67 tests pass; `pnpm lint` and `pnpm build` clean. `node scripts/run.mjs checks` fails only on `modules/profile-catalogue-data/package.json` licence, not this card.
- For the coordinator, CHANGELOG line: `- Archive extraction (\`extractArchive\`): zip (fflate) and tar.gz with path-traversal and symlink guards, all-or-nothing staging, and entry/size/ratio bounds (SLC-13).`
- Not done: zip64 (marked `shortcut:` in code), Windows symlink privileges, case-insensitive path collisions, no AbortSignal. Not yet wired into an `EngineProvisioner` (no provisioner exists in the module yet).


**Review failed (sp9-rev-slc-13)**, 2026-10-26:

- Ran in `vsslicer/modules/slicer-runtime`: `pnpm test` 67/67 pass (4 files), `pnpm lint` clean, `pnpm build` clean. `node scripts/run.mjs checks` fails only on check-licence, all 13 problems in `modules/profile-catalogue-data` (another card's).
- Probes ran in a mktemp dir and imported `src/` by absolute path. Both problems reproduced; the probe dir is deleted.
1. **A symlink chain writes outside the target, and cleanup leaves the write behind.** `src/adapters/extract-archive.ts:193-197`. `finish()` creates links in order and runs `mkdir(dirname(path), {recursive:true})` before it validates any of them. So a link whose parent is an earlier link has its directories and the link itself created through that earlier link. Reproduced with tar `sub/` dir, `sub/c -> ..`, `d -> sub/c/..` (each passes the lexical check) and `d/newdir/evil -> x`. The extraction is refused, but `<dirname(dest)>/newdir/evil` is left on disk outside the staging folder, and `rm` of the staging folder does not remove it. Repeating the chain climbs further up the tree, so an attacker can create directories and relative symlinks anywhere the user can write. Fix: refuse any entry (file, dir or link) whose path has a declared symlink entry as an ancestor, or create every link parent as a real directory before creating any link. Either way, check `realpath(dirname(path))` is under the root before each `symlink()`. Add a test that asserts nothing exists next to `dest` afterwards.
2. **An overlapping-entry zip bomb gets past the ratio bound.** `src/adapters/extract-archive.ts:290-303,345`. The ratio is checked per entry, but DEFLATE tops out near 1032:1, so the check only fires at the format's limit. Many central-directory entries can point at the same local data. Reproduced: a 613,517-byte zip (one 100 MiB kernel at 171:1, referenced 30 times) extracted 3,145,728,000 bytes, an overall ratio of 5127:1. Only the 4 GiB total cap stops it, which misses the criterion "zip bombs (ratio over 1000:1 past 1 MiB) refused". Fix: refuse overlapping entry ranges (`[local, start+csize)` must not intersect another entry's range), and check the total inflated bytes against the archive's file size with `checkRatio(out.bytes, fileSize, ...)`. Add a test with a two-entry overlapping zip.
- Checked and fine: `..`, absolute, drive and backslash paths; pax `path`/`linkpath` and GNU `L`/`K` go through `safeParts`; a file and a link under the same name, or a dir then a link, are refused as duplicates (a link then a dir fails at `symlink` EEXIST and is cleaned up); `open('wx')` never follows a link, because no link exists while files are written; hard links, devices, fifos, base-256, pax `size` and unknown types are refused; checksums are checked; lying sizes and CRCs are refused, with the per-file cap enforced while inflating; the staging folder is mkdtemp 0700. The tests assert no wall time.

sp9-slc-13-fix, 2026-10-26 (fixes for the FAIL above):

1. Symlink chain: `Output.finish()` now first refuses any entry (file, dir or link) whose path has a symlink entry as an ancestor (sorted entry list, binary search per link, O(n log n)), before any link is created. Then before each `symlink()` it checks `realpath(dirname(path))` is the staging root or under it. Test: the reviewer's tar chain (`sub/`, `sub/c -> ..`, `d -> sub/c/..`, `d/newdir/evil -> x`) is refused with "inside a symlink entry" and the parent of `dest` is empty afterwards (no `newdir`). The old `a -> b` + `a/x` case now fails on the same rule.
2. Overlapping zip bomb: `checkNoOverlap()` reads every local header, builds `[local, start+csize)` ranges, sorts by offset and refuses any overlap before extracting anything. The total inflated bytes are also checked against the archive file size (`checkRatio(out.bytes, fileSize)`, 1000:1 past 1 MiB), on top of the per-entry check. Test: a zip with a second central-directory record pointing at the first entry's data (built at test time) is refused with "overlap".
- Verified in `vsslicer/modules/slicer-runtime`: `pnpm test` 69/69 pass (4 files), `pnpm lint` clean, `pnpm build` clean; `node scripts/run.mjs checks` fail 0.
- Not done: same as before (zip64, Windows symlinks, case-insensitive collisions, AbortSignal).

**Review failed (sp9-rerev-slc-13)**, 2026-10-26 (re-review):

- Ran in `vsslicer/modules/slicer-runtime`: `pnpm test` 69/69 pass (4 files), `pnpm lint` clean, `pnpm build` clean; `node scripts/run.mjs checks` exit 0.
- Can the new tests fail: in a mktemp copy I removed the ancestor check, the parent `realpath` check, `checkNoOverlap` and the whole-archive `checkRatio`. 3 tests fail (overlapping bomb, `a -> b` + `a/x`, the reviewer's chain); 35 pass. With the fix in place they pass.
- Probes ran in a mktemp dir and imported `src/` by absolute path. Refused, with nothing left next to `dest` or above it: the previous tar chain; the 30-entry zip sharing one 100 MiB deflate block ("overlap"); the same chain in a zip, with a link and with a file as the last entry; `sub/c -> ..`, `e -> sub/c`, `f -> e/..` (link through a sibling link, "escapes"); an `x <-> y` loop ("dangling or loops"); a partial overlap (second record pointing 40 bytes into the first's local header); entries out of offset order with an overlap. These extract correctly: a benign `b -> a -> real`, and two non-overlapping entries listed out of offset order (4 MiB).
1. **The symlink-chain escape still works when the names differ only in Unicode normalisation (or case, on a case-insensitive volume).** `src/adapters/extract-archive.ts:195-209`. The ancestor check compares paths byte by byte, but APFS ignores normalisation, and default macOS and Windows volumes ignore case too. Reproduced on this Mac's APFS volume (case-sensitive, normalisation-insensitive) with tar entries `sub/`, `sub/c -> ..`, `é -> sub/c/..` (NFC) and `é/newdir/evil -> x` (NFD). No ancestor matches, so line 209's `mkdir(dirname(path), {recursive:true})` goes through the `é` link and creates `<dirname(dest)>/newdir` before line 210's `realpath` check fires. The extraction is refused, but `newdir` stays outside the staging folder. With `sub/k/c -> ../..` and `é -> sub/k/c/../..`, the leftover `climb/` landed two levels above `dest`, so chained links still let an archive create empty directories anywhere the user can write. On a case-insensitive volume `D -> ...` plus `d/newdir/...` would do the same (the probe ran on a case-sensitive volume, so this part is unverified). The card lists case-insensitive collisions as not done, but this breaks criteria 1 and 3, which say nothing is written outside the target. Expected fix: in `finish()`, create each link's parents one component at a time from the root, `lstat` each one and refuse it if it is a symlink (or `realpath` the deepest existing ancestor and check it is under the root before any `mkdir`). Add a test with an NFC link and an NFD child that asserts nothing exists next to `dest`.
- Checked and fine: everything listed as fine in the first review still holds, and the overlap check reads local header lengths, so a central directory that lies about name or extra lengths cannot shrink a range.
- Probe dir deleted. I changed no code.

sp9-slc-13-fix2, 2026-10-26 (fix for the re-review FAIL above):

1. Normalisation/case aliases: fixed at the file-system level. New `Output.mkdirs(path)` creates a path one component at a time from the staging root (`mkdir` without `recursive`, EEXIST tolerated), then `lstat`s each component and refuses it with "is not a real directory" if it is a symlink or not a directory; verified components are cached in a `Set` (a real dir is never replaced: links are only created afterwards and `symlink()` fails on EEXIST). Used for every dir entry, every file's parent and every link's parent in `finish()`. No `recursive: true` mkdir remains under the staging root (the only one left creates `dirname(dest)`, the caller's path). The byte-wise ancestor check and the `realpath` checks stay as extra layers.
- Tests: the reviewer's NFC-link / NFD-child tar (`sub/`, `sub/c -> ..`, `é` (NFC) `-> sub/c/..`, `é/newdir/evil` (NFD)) is refused and `rejects()` asserts the parent of `dest` is empty. A case-only variant (`D -> sub/c/..`, `d/newdir/evil`) is added too; on this Mac's case-sensitive APFS volume it passes trivially (the names are distinct, so it fails as a dangling link), so it only proves something on a case-insensitive volume.
- Can it fail: in a mktemp copy I put `mkdir(dirname(path), {recursive:true})` back for files and links; the NFC/NFD test fails with `expected [ 'newdir' ] to deeply equal []` (1 failed, 39 passed). Copy deleted.
- Verified in `vsslicer/modules/slicer-runtime`: `pnpm test` 71/71 pass (4 files), `pnpm lint` clean, `pnpm build` clean; `node scripts/run.mjs checks` exit 0.
- Not done: the case-only test not run on a case-insensitive volume; zip64, Windows symlinks, AbortSignal as before.

**Review passed (sp9-rerev2-slc-13)**, 2026-10-26 (third round):

- Ran in `vsslicer/modules/slicer-runtime`: `pnpm test` 71/71 pass (4 files), `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` clean; `node scripts/run.mjs checks` exit 0. The NFC/NFD test really holds U+00E9 in the link and `e`+U+0301 in the child (checked the bytes).
- Can the new test fail: in a mktemp copy I put `mkdir(dirname(path), {recursive:true})` back for link parents in `finish()`; the NFC/NFD test fails with `expected [ 'newdir' ] to deeply equal []` (1 failed, 39 passed).
- Probes ran in a mktemp dir, imported `src/` by absolute path, with `dest` at `base/g1/g2/parent/out` and a snapshot of `base` before and after. Each ran as tar and as zip, 18 runs, no leak anywhere under `base`:
  - the last FAIL's NFC/NFD chain (`sub/c -> ..`, `é -> sub/c/..`, NFD `é/newdir/evil`): refused, "is not a real directory";
  - the chained variant (`sub/k/c -> ../..`, `é -> sub/k/c/../..`, NFD `é/climb/evil`): refused the same way, no `climb/` at any level;
  - the same chain ending in a file, a dir entry after the aliased link, the child link listed before the aliased link, a file and a link under an aliased link's path, two links aliasing one name, and a 3-level link under an aliased parent: all refused (by "not a real directory", or by `symlink` EEXIST, since files and dirs are made as real dirs during reading, before any link exists).
  - benign: an NFD dir with a file, a link to it by its NFD name and one by its NFC name both extract.
- Cache: `realDirs` only holds components that `lstat` showed as real directories. Files and dirs are written while reading, and links only in `finish()`, so no link exists while a file or dir is written. `symlink()` never replaces an existing entry (EEXIST), so a cached directory cannot later turn into a link. A key that differs only in normalisation misses the cache and gets its own `lstat`. I found no way to race or bypass it (the staging dir is mkdtemp 0700, so other users are out of scope).
- Rest of the card: the earlier rounds' probes are recorded above; the tests that cover them still pass. Criteria 1 to 5 hold.
- Note, not a blocker: alias collisions surface as a raw Node `EEXIST` error carrying the absolute staging path, not as an `ArchiveError`. The extraction is still refused and cleaned up.
- Probe dir deleted. I changed no code.
