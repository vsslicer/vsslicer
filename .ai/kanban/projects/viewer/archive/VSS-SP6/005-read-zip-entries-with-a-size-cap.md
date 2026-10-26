---
id: 5
title: Read zip entries with a size cap
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [3, 4]
created: 2026-10-25
---

Reads the central directory and exposes each entry's raw and inflated bytes lazily, refusing declared sizes above a cap before inflating.

**Code:** `vsslicer/modules/3mf/src/adapters/zip/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Stored and deflated entries, data descriptors and zip64 read correctly on test archives
- [x] A corrupt zip and a zip bomb (declared size above the cap) throw the typed errors from the fixtures
- [x] Raw (still compressed) entry bytes are available for byte-identical save

## Tasks

- [x] Wrap fflate for central directory reading
- [x] Add the size cap check
- [x] Expose raw entries
- [x] Tests

## Progress

Done. Port `ZipArchive`/`ZipEntry` in `src/application/zipArchive.ts` (so the OPC reader depends on the port, not on fflate); adapter `openZip(bytes, {maxEntryBytes})` in `src/adapters/zip/fflateZip.ts`. It parses the central directory itself (including ZIP64 end records and extra fields, which fflate does not expose with CRC/offsets), lists entries with declared sizes, CRC and local-header offset, and inflates lazily with fflate's streaming `Inflate`. `raw(name)` returns the still-compressed data (a view); `inflated(name)` throws `SizeCapExceededError` before inflating when the declared size is above the cap (default 512 MiB), and `CorruptZipError` for a missing end record, bad records, a deflate stream that disagrees with its declared size (stopped while streaming, never buffered whole), encryption or an unknown method. Both exported from `src/index.ts`.
Verified: `test/zip.test.ts` covers stored, deflated, data descriptors, ZIP64 (with and without descriptors), raw bytes inflate back, the corrupt-zip and zip-bomb fixtures, and lying sizes. `pnpm lint`, `pnpm build`, `pnpm test` pass; no dependency added.
Not done: CRC-32 is not verified (shortcut comment in code); the local-header copier for byte-identical save is a later card (raw bytes and local offsets are exposed for it); archive comments ignored.
Changelog: VWR-5: zip reading behind a `ZipArchive` port with a per-entry size cap (ZIP64, data descriptors, raw entry bytes).


Review failed (vwr456-reviewer): the size cap is bypassable. fflateZip.ts:127-135 `inflate.push(packed, true)` makes fflate inflate the whole stream into its own buffer before the callback fires, so the "stopped while streaming" check never limits memory. Probe (scratch rv456/bomb.ts): a 1 MB entry declaring size 10 (under the cap) with a deflate stream of 1 GiB zeros took 4.4 s and 1.3 GB RSS before CorruptZipError; 3 GiB (3 MB file) took 34 s. Needs input fed to Inflate in small slices (or a cap on produced bytes) so output is bounded by the declared size. Also: no total cap, and readPackage inflates every part eagerly (a zip of many honest 400 MiB parts retains them all). Verified OK: truncation at every length and 20k random byte flips give only CorruptZipError/SizeCapExceededError, no hang; declared-size lies and 64-bit/count lies fail fast; layers right (port in application, fflate only in adapters/zip and index re-export); CRC shortcut comment present.

Fix (vwr56-fix): `inflated()` now feeds fflate's `Inflate` in 64 KiB input slices and the callback throws `CorruptZipError` as soon as produced bytes exceed the declared size (which is already <= the cap), so output is bounded by about 64 KiB x 1032 per push instead of the whole stream. New test: a 256 KiB deflate stream of 256 MiB zeros declared as 10 bytes throws `CorruptZipError` (about 1 s, mostly building the input). `pnpm lint`, `build`, `test` (48) pass.
Not done: no total-inflated cap across entries (shortcut comment in `fflateZip.ts`); `readPackage` still inflates all parts eagerly, so many honest large parts are all retained (belongs to the streaming reader, VWR-15).
Changelog: VWR-5: inflate in bounded slices so a lying deflate stream cannot exhaust memory.

Review passed (vwr56-rereview): bomb probe (1 MB entry, 1 GiB zeros declared 10 bytes): new code throws CorruptZipError in ~0.9 s (3 GiB: 0.23 s), old single-push code reconstructed from the review notes took 4.4 s and 1.9 GB RSS, so the bomb test (256 MiB, <2 s) guards the fix. eslint clean on adapters/zip, adapters/opc and their tests; module tests 84 pass. Remaining: no total cap and eager readPackage (documented, VWR-15). Module-wide pnpm lint fails only on editPackage.ts:115 (VWR-9) and prettier on zipWriter.ts/opcEdit.ts (other lanes).
