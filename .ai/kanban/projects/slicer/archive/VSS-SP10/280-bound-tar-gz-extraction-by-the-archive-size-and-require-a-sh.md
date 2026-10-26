---
id: 280
title: Bound tar.gz extraction by the archive size and require a sha256 check before extract
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 8 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done. `extractArchive(archive, dest, limits, { sha256 })`: sha256 is streamed and compared before any extraction; a tar.gz without one is an ArchiveError, a wrong one fails for tar.gz and zip, a malformed one is a RangeError. tar.gz ratio now uses the archive file size (stat), not `bytesRead` read-ahead. Hostile tests: missing sha256, wrong sha256 (tar.gz and zip, nothing left behind), tar.gz bomb over `maxRatio` with a matching sha256. Existing tar.gz tests pass the archive's own sha256. No callers of extractArchive exist yet. Did not lower maxRatio/maxTotalBytes defaults (the audit's alternative); the caller should pass the engine's real size as maxTotalBytes.
Mutation probes: sha256-required check removed -> fails; hash comparison removed -> fails; ratio check removed -> 2 tests fail.
Verified: pnpm lint, build, test in slicer-runtime (75 tests, 4 files) and `node scripts/run.mjs checks` all pass.

**Review failed (sp10-rev-slc-279-280)**
Ran in slicer-runtime: pnpm install, lint, build clean; pnpm test 75/75. `node scripts/run.mjs checks` exits 1 only on `modules/mesh/test/zz-probe-397.test.ts` (another module).
Mutation probes (copy): sha256-required check removed -> 1 fails; comparison removed -> 1 fails; zip hash skipped -> 1 fails; ratio back to `file.bytesRead` -> 45/45 pass (see 2). Hashing is streamed (`createReadStream`, no full read); a refused sha256 leaves nothing (the check runs before the staging dir exists, tests assert an empty parent). Bomb with a matching sha256 is still refused by the ratio.
1. The bytes hashed are not the bytes extracted (`src/adapters/extract-archive.ts:L80`, `L91`, `L105`, `L119-L123`, `L529-L530`). `sha256Of` opens the archive by path; tar.gz then closes `fh` and re-opens by path in `readTarGz`; zip reads `fh`, opened before the hash. Probe (vi.mock of `createHash`, rename at the window): tar.gz, rename an evil archive over the path after the digest -> `{format:'tar.gz', entries:1}`, evil file extracted; zip, rename the good archive over the path after `open`, before hashing -> evil zip extracted with the good sha256. Severity: low in practice (the archive is in our own download dir, and whoever can rename there can usually also tamper with the installed engine), but the check exists to guarantee the verified bytes are the extracted ones, and the fix is small. Fix: one open file handle for everything: hash with `fh.createReadStream({ start: 0, autoClose: false })`, take the size from `fh.stat()`, and pass `fh` to `readTarGz` (`fh.createReadStream({ start: 0 })` piped to gunzip) instead of the path. Rule: verify and consume through the same descriptor; never re-resolve a verified path. Add the swap probe as a test (mock `createHash` or inject the hash step) for both formats.
2. Minor: the `bytesRead` -> `stat` size change for the tar.gz ratio has no test that tells them apart (mutation passes), and it changes nothing in practice: read-ahead reaches the full size of a small bomb in one read. The real bound now is the required sha256, which is fine (the audit offered it as the fix). Either drop the claim from the card/CHANGELOG or keep `size` (from `fh.stat()` per 1) and say it is for clarity, not a bound.

**Review fix (sp10-slc-fix)**
1. One descriptor: `extractArchive` opens the archive once; `sha256Of(fh)` hashes via `fh.createReadStream({start:0, autoClose:false})`, `readTarGz(fh, ...)` reads the same handle (size from `fh.stat()`), and zip already read `fh`. No path is re-resolved after the hash. New test (`the verified bytes are the extracted bytes`, tar.gz and zip, posix only): a mocked `createHash().digest` hook renames an evil archive over the path right after the digest; the extraction must hold only the good entry.
2. The `stat` size is kept for clarity, not as a bound; CHANGELOG says so (the required sha256 is the bound).
Mutation probes: tar.gz reopened by path -> tar.gz swap test fails; zip reopened by path -> zip swap test fails.
Verified: pnpm lint, build, test in slicer-runtime (77 passed, 1 skipped, 4 files), `node scripts/run.mjs checks` exit 0.

**Review failed (sp10-rerev-slc)**
Ran in slicer-runtime: pnpm install, lint, build clean; pnpm test 77 passed, 1 skipped; `node scripts/run.mjs checks` exit 0.
Earlier fails fixed: 1. one descriptor (`fh`) for hash, zip and tar.gz; no path re-resolved. Swap probe re-run (copy): reopen by path for both -> both swap tests fail; tar.gz only -> tar.gz test fails; zip only -> zip test fails. 2. CHANGELOG states the `stat` size is for clarity, the sha256 is the bound.
Handle-close probe (dist build, open fds counted via `/dev/fd` before/after, positive control with the catch-close removed shows the leaks): closed on tar.gz success, zip success (with and without sha256), hash mismatch tar.gz and zip, missing sha256, not an archive, ratio refusal, read error (truncated gzip).
1. The handle leaks when staging setup fails (`src/adapters/extract-archive.ts:L97-L98`). `mkdir(dirname(dest))` and `mkdtemp(...)` run after the first try/catch and before the try/finally that closes `fh`, so an error there (probe: read-only parent dir -> EACCES from mkdtemp) leaves the descriptor open: `/dev/fd` +1 on every run. On Node 26 (this machine) a later GC then kills the process: `node --expose-gc` probe -> `ERR_INVALID_STATE: A FileHandle object was closed during garbage collection`, script never reaches its next line; on Node 24 it is a deprecation warning plus the leak. In the extension host that is a crash from an ordinary permission error. Fix: one `try { ... } finally { await fh.close() }` around everything after `open` (the staging cleanup stays in its own inner catch), with a test that makes mkdtemp fail (read-only parent, posix) and asserts the error and that the handle is closed (e.g. mock `open` from node:fs/promises to count `close`, or `/dev/fd` count where available). Rule: every path after a resource is acquired releases it; no awaited step sits between the acquire and its try.
Probe script kept: /private/tmp/claude-501/-Users-jkiraly-Workspace-VSSlicer/4676c1f0-96a4-4e6e-a8a7-cf01ebb69886/scratchpad/probe/fd.mjs (args: module dir, work dir).
Note (not this card): `test/run-process.test.ts` run 5 times, 28/28 each, no flake seen.

**Review fix 2 (sp10-slc-280-fix2)**
`extractArchive` now has one `try { ... } finally { await fh.close() }` around everything after `open` (magic, hash, `mkdir`, `mkdtemp`, extraction); the staging cleanup stays in its own inner catch. SLC-279 behaviour is unchanged (its tests pass). New test `the handle is closed when staging fails` (posix, non-root): read-only parent -> EACCES, `/dev/fd` count equals the count before.
Mutation probe: close moved out of the finally (only on success) -> the new test fails.
Verified: pnpm lint, build, test in slicer-runtime (78 passed, 1 skipped); `node scripts/run.mjs checks` exit 0 (see final message).

**Review passed (sp10-coordinator, re-review of fix round 2)**: `pnpm test` 78 passed, 1 skipped; `run.mjs checks` exit 0. `extract-archive.ts:77-108`: everything after `open` sits in one try/finally that closes the handle, so the staging-failure path (mkdir/mkdtemp) closes it too; the worker's probe (close only on success) fails the new test. The second review's other checks (single descriptor for hash and both readers, swap tests, close on the listed paths) stand.
