---
id: 40
title: Download Prusa vendor bundles from upstream at a pinned commit
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [119, 135]
created: 2026-10-25
---

Fetches PrusaSlicer-settings-prusa-fff and -non-prusa-fff bundles at a pinned commit into a target folder and records `source.commit` (D4). Cura resources are a separate card in `profiles-cura`.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/download/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [x] The downloader writes only into the folder it is given and records `source.commit` and the URL on the vendor entity
- [x] A network failure mid-download leaves no partial bundle (temp folder and rename) and returns a retryable error
- [x] Tests needing the network skip with a reason offline and run in CI with a cache outside the repository
- [x] No Prusa data is in the repository or in the module's published file list (test)

## Tasks

- [x] Write the pinned-commit fetch
- [x] Write atomic placement
- [x] Tests

## Progress

Done (sp10-prf-40). Files: `src/adapters/download/{download,index}.ts`, `test/adapters/download.test.ts`, `src/index.ts` (export appended), CHANGELOG.
Design: GitHub codeload tar.gz at a full 40-hex commit (`<baseUrl>/<repo>/tar.gz/<commit>`), no new dependency (node:zlib plus a small tar reader). Unpack in `<targetDir>/.download-*`, rename each bundle to `<targetDir>/<repo>` only when all are complete; an existing destination is refused up front, and a rename failure rolls back bundles already placed. Result per bundle: `source {format:'prusa-ini', origin:<URL fetched>, commit}`, shaped for `Vendor.source`. `DownloadError.retryable` is true for network error, timeout, 429, 5xx, a cut body; false for 4xx, bad archive, limits.
Bounds (rule 25): fetch injected or global (`redirect: manual`, limit 5, no scheme change), one `AbortSignal.timeout` for the call (limit 1..3,600,000 ms); compressed size cap checked against Content-Length and while streaming; gunzip `maxOutputLength`; entries and file bytes budgeted across all archives of the call; path bytes, depth, `..`/empty/control/backslash/colon/trailing dot components, links and devices refused, NFC plus case aliases, file-under-file and duplicates refused; tar checksum and base-256 sizes checked; pax header 64 KiB cap; the global pax `comment` must equal the pinned commit (verified only against synthetic archives, not against live GitHub).
Network-skip criterion: no test touches the network (local `node:http` server), so none needs a skip or CI cache; a live smoke test is not added.
Published-list criterion: test asserts package.json `files` is dist, LICENSE, README.md and no .ini/.idx under src.
Mutation probes (each restored): redirect limit, Content-Length cap, streaming cap, commit-header check, link-type refusal, alias normalisation, gunzip maxOutputLength, limit validation, total-bytes budget, scheme change, checksum, retryable mapping, depth, file-under-file, entry budget, rollback (race test added), up-front exists check: each failed at least one test. `p === '..'` alone is redundant with the trailing-dot rule (not a gap).
Verify: download tests 25 passed; whole module 225 passed, 2 failed in test/adapters/import.test.ts (PRF-34 in progress, not mine); `pnpm lint` and `pnpm build` fail only on PRF-34's import.ts/split.ts (prettier, a type error); my files pass eslint, prettier and tsc. `node scripts/run.mjs checks` passed.

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.

**Review failed (sp10-rev-prf-40)**
Ran (card files only, PRF-34 owns import/): eslint and prettier on `src/adapters/download` and `test/adapters/download.test.ts` clean; `tsc -p tsconfig.test.json` has 1 error, in `src/adapters/import/import.ts` (PRF-34), none in these files; `vitest run test/adapters/download.test.ts` 25/25; `node scripts/run.mjs checks` exit 0. No test reaches the network: all fetches go to the `node:http` server on 127.0.0.1, and the `https://example.invalid` and `file:///etc` cases are refused before any fetch.
Hostile probes, own script against a local server (`.../scratchpad/probe/probe.mts`). These held: an endless chunked body under a 1 MB cap stops in 14 ms; a 10 GB Content-Length is refused before the body; a server that sends no headers, stalls mid-body or drips slowly hits the deadline as a retryable error; a redirect loop stops at 5; a redirect to `file:` is refused; types 1, 2, 6, 7 and L are refused; `..`, absolute paths, a ustar prefix with `..`, a pax path with `..` or an absolute pax path, backslashes, case and NFD aliases, file-under-file, dir-then-file and two top folders that collide are all refused; a missing or different global `comment` is refused; uppercase, short, newline-suffixed and branch commits are refused; a symlink at the destination is refused; repo names `..` and `a/b` are refused. Every failure left `targetDir` empty.
My 32 mutations: 25 failed a test. The 7 that survived: the `..` check (the trailing-dot rule still catches it, as the author noted), the trailing-dot/space rule, the pax 64 KiB cap, `maxPathBytes`, the leading-dot repo check, "entry runs past the end of the archive", and `flag: 'wx'` (defence in depth, fine).

1. `download.ts:111`: a hostile server's `Location: http://[` throws a bare `TypeError: Invalid URL` out of `downloadPrusaVendorBundles`, so the documented "Throws DownloadError" with `retryable` breaks on untrusted input (probe "redirect bad Location"). Rule: anything parsed from the response (here the Location header) fails as a `DownloadError(retryable: false)`. Wrap `new URL(location, current)` and add a test. Caller input is the same: an invalid `baseUrl` (`:260`) also throws TypeError, and a missing `targetDir` throws a raw ENOENT from `mkdtemp` (`:276`). Report both as DownloadError too.
2. `test/adapters/download.test.ts`: five bounds have no test that fails when they are removed: the pax extended-header 64 KiB cap (`:194`), `maxPathBytes` (`:217`), a trailing dot or space component such as `a.` (`:159`), the leading-dot repo name (`:258`) and a truncated entry body (`:191`). Rule 25: every bound gets a test that fails when the bound is removed. Add one small case each.
Notes, not blocking: Windows reserved names (`CON`, `nul.ini`) are accepted, which matters only if upstream ever ships one. A `baseUrl` with a query string builds `?q=1/r/tar.gz/<commit>`, and that is caller input.

**Review fix (sp10-prf-40-fix)**
1. `download.ts`: an invalid redirect `Location`, an invalid `baseUrl` and an unusable `targetDir` (mkdtemp failure) now throw `DownloadError(retryable: false)`. Test: 'hostile responses and bad caller input fail as non-retryable DownloadErrors'.
2. Added test 'each archive bound has its own refusal': pax 64 KiB cap, `maxPathBytes`, trailing dot (`x/a.`), truncated entry body, leading-dot repo name.
Mutation probes (each restored): pax cap, maxPathBytes, trailing-dot rule, leading-dot repo check, truncated-body check, Location wrap, baseUrl wrap, targetDir wrap: each failed exactly 1 test.
Verify: download tests 27 passed; eslint, prettier and `tsc -p tsconfig.test.json` clean on my files; `node scripts/run.mjs checks` exit 0. Not run: whole-module lint/build/test (PRF-34 files in flux).

**Review passed (sp10-rerev-prf-40)**
Ran: whole module now green: `pnpm lint` (eslint, prettier, tsc) clean, `pnpm build` clean, `vitest run` 236/236 (download 27/27); `node scripts/run.mjs checks` exit 0.
Problem 1 resolved: `download.ts:111-115` wraps the redirect `Location`, `:265-269` the `baseUrl`, `:286-290` the `mkdtemp` of `targetDir`, each as `DownloadError(retryable: false)`; the test 'hostile responses and bad caller input...' covers all three.
Problem 2 resolved: 'each archive bound has its own refusal' covers the pax 64 KiB cap, `maxPathBytes`, trailing dot, truncated entry body and leading-dot repo name.
Mutation probes on the fixed code (each restored, file byte-identical after): rethrowing the raw error in each of the three wraps, and removing the pax cap, maxPathBytes, trailing-dot rule, truncated-body check and leading-dot repo check: each of the 8 fails exactly 1 test.
Note, not blocking: dropping only the trailing-space half of `:163` (`p.endsWith(' ')`) still passes; a `x/a ` case would pin it.
