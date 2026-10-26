---
id: 130
title: Download Cura resources from upstream when Cura is not installed
type: feature
priority: P1
effort: S
model: sonnet
area: [importers]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [121, 135]
created: 2026-10-25
---

Fetches Cura definitions and quality resources at the pinned commit when the user has no Cura installed.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/download/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] Fetch at Cura@5bea2f8 into a given folder with `source.commit` recorded; a network failure leaves no partial folder and returns a retryable error
- [x] Network tests skip with a reason offline and run in CI with a cache outside the repository

## Tasks

- [x] Write the fetch
- [x] Atomic placement
- [x] Tests

## Progress

**Coordinator (sp12-coordinator):** the first build's Progress and the first review (sp12-rev-prf-130, FAIL: cache keeps bad downloads, no timeout, no CI cache, six untested hostile rules) were overwritten by the rework's edit; this header is restored from git and the rework record follows. Both are restored below from the SP12 run log (sp12-rev2-prf-130).

Done (sp12-prf-130). Files: `src/adapters/download/fetch.ts` (`fetchCuraResources`, `readCuraTar`, `CURA_PINNED_COMMIT`), `test/fetch.test.ts`.
Design: GitHub tarball `codeload.github.com/Ultimaker/Cura/tar.gz/<40-hex commit>` (default `5bea2f86153faed3a1c2d9081b8d6b753684678a`),
buffered, `gunzipSync` with `maxOutputLength`, own bounded ustar/pax reader keeping regular files under `resources/{definitions,extruders,variants,quality}`;
built in `.<dest>.part-XXXX` beside dest, `source.json` `{format:'cura',origin,commit}`, then `rename`; failure removes the part folder. Result
`{ok:true,source,files}` or `{ok:false,retryable,error}` (network, body error, HTTP 5xx/429/408 retryable). Optional `cacheDir/<commit>.tar.gz`.
Bounds (defaults, all overridable, validated positive safe integers): download 256 MiB, inflated 512 MiB, entries 100000, files 20000, file 16 MiB, total 128 MiB, path 512 chars, depth 16;
dot names skipped (as Cura), `\\ : < > " | ? *`, control chars, trailing dot/space, empty segments refused, NFC+case alias refused; Map for names. Real tarball: 54 MB gz / 130 MB tar, 9002 files in the four folders, none unsafe.
CI gate platform: ubuntu (live test runs when codeload is reachable; set `CURA_FETCH_CACHE` to a folder outside the repo, e.g. the runner temp dir, to cache the tarball). Offline: describe is skipped with the reason in its name.
Verified: lint, build, test (193 passed, 11 files; one unexplained transient failure in one full run, 3 clean reruns), `scripts/run.mjs checks` pass. Live test downloaded the real commit and matched `.reference` clone's fdmprinter.def.json byte for byte.
Probes (each removed, a test failed, restored): criterion 1 -> maxFiles, maxTotalBytes, maxFileBytes, maxDepth, download cap, maxTarBytes, alias check, regular-file filter, retryable flag, tmp cleanup (partial folder test); criterion 2 -> cacheDir branch removed fails the cache test (offline skip is `describe.skipIf(!online)`).
Release lines:
- CHANGELOG: `fetchCuraResources(dest, options)`: downloads Cura's definitions, extruders, variants and quality resources at a pinned commit (default Cura@5bea2f8) into a new folder with `source.json`; atomic placement, bounded tar reader, retryable-error result.
- index.ts: `export { fetchCuraResources, readCuraTar, CURA_PINNED_COMMIT, CURA_ORIGIN, CURA_FETCH_LIMITS } from './adapters/download/fetch.ts'; export type { CuraFetchLimits, CuraFetchOptions, CuraFetchResult } from './adapters/download/fetch.ts';`

**Review failed (sp12-rev-prf-130)**
Ran in profiles-cura: `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 193 passed / 11 files (live download test ran online, 5.5 s), `node scripts/run.mjs checks` exit 0, fail 0.
Mutation probes on `src/adapters/download/fetch.ts` (each applied, `test/fetch.test.ts` run, restored): killed: maxFiles, maxEntries, maxFileBytes, maxTotalBytes, maxDepth, maxPathLength, download cap, maxTarBytes (each at cap+1, so the exact caps are asserted), case fold, NFC, regular-file filter, unsafe chars, empty segment, dot skip, existing dest, empty archive, limit validation, SHA check, network retryable, 5xx retryable, tmp cleanup, cache read, pax path. Survived: control-char refusal, content-length precheck, corrupt pax refusal, pax 64 KiB cap, cached-file size cap, ustar `prefix` field. Layering fine (adapters, node only, no cross-module imports). Upstream commit hash matches the card.
Problems:
1. `fetch.ts:207-218`: the tarball is written to the cache before it is validated. Probe: a fake fetch returning a 200 body cut 10 bytes short with `cacheDir` gave `{ok:false,retryable:false,"not a usable gzip stream"}`; the next run with a good server returned the same error from the cache, and every run after it will too. A captive portal's HTML page or any bad body poisons the cache permanently, with a non-retryable error. Fix (rule: never persist untrusted input before it has been validated): write the cache only after `gunzipSync` and `readCuraTar` succeed, and treat a cached file that fails to parse as a cache miss (delete it, download again). Add a test: bad body then good body with the same `cacheDir` succeeds.
2. `fetch.ts:182` and `:196`: no timeout. Probe: a fetch that never resolves, and a body that sends 5 bytes then stalls, both still pending after 3 s and would hang forever, so criterion 1 ("a network failure ... returns a retryable error") does not hold for a stalled connection. Fix: pass an `AbortSignal` (connect plus idle timeout, overridable in options) to `fetch` and the body read, and return `retryable: true` when it fires. Test with a fake fetch that never settles and a tiny injected timeout, asserting the result, not the elapsed time.
3. Criterion 2 "run in CI with a cache outside the repository": `.github/workflows/ci.yml:93-94` sets only `VSCODE_TEST_CACHE`; `CURA_FETCH_CACHE` is set nowhere, so CI downloads 54 MB uncached every run. Shared-file line for the coordinator: add `CURA_FETCH_CACHE: ${{ runner.temp }}/cura-fetch` to that env, and an `actions/cache` step for that path keyed on the pinned commit.
4. Untested hostile rules (rule 25; the surviving mutants above): `fetch.ts:121` control characters, `:191-192` declared content-length over the cap, `:100-101` corrupt pax record, `:147` pax header over 64 KiB, `:175` cached file over `maxDownloadBytes`, `:151` ustar prefix. Add one test row each (the content-length test needs a Response with a `content-length` header and a fetch that is never read past it).
Not blocking: the Progress note's "one unexplained transient failure in one full run" was not reproduced here (2 full runs clean).

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.

**Rework (sp12-prf-130b)** for the review above. Files: `src/adapters/download/fetch.ts`, `test/fetch.test.ts`.
1. Cache poisoning: the cache is written only after `gunzipSync` + `readCuraTar` succeed (`obtain`/`unpack`); a cached file that is over `maxDownloadBytes` or does not unpack is deleted and the network is asked. Tests: body cut short then good server with same cacheDir succeeds and leaves no cache file; bad cached file replaced; bad cached file removed when the network is down.
2. Timeout: option `idleTimeoutMs` (default 30000, validated positive safe integer) covers the response and every body chunk (`within` races the promise and aborts the `AbortSignal` passed to `fetch`); expiry is `retryable: true`. Test: a never-settling fetch and a body that stalls after 5 bytes, 20 ms timeout, asserting the result only; `idleTimeoutMs: 0` refused.
3. CI: Release lines below (shared file `.github/workflows/ci.yml`).
4. Hostile rules, one test each: control char name, declared content-length over cap (body throws if read), corrupt pax record, pax 65536 accepted by size check / 65537 refused, cached file over cap, ustar prefix.
Probes (each applied, a test failed, restored): control-char refusal; content-length precheck; corrupt pax refusal; pax 64 KiB cap; cached-file size cap; ustar prefix; delete of bad cache file; cache write before validation (cache-write guard removed -> two cache tests fail); idle validation; stalled retryable flag.
Verified: lint, build, test (200 passed, 11 files; one run showed the unrelated curaprofile-archive 16 MiB test hit its 5 s timeout while other cards ran, clean on rerun), `scripts/run.mjs checks` exit 0. CI gate platform: ubuntu.
Release lines (in addition to those above; the CHANGELOG line also gains: `idleTimeoutMs` option, cache written only after the archive unpacks):
- `.github/workflows/ci.yml`, in the `node scripts/run.mjs ci` step env (next to `VSCODE_TEST_CACHE`): `CURA_FETCH_CACHE: ${{ runner.temp }}/cura-fetch`; and a step before it:
  `- uses: actions/cache@v4` with `path: ${{ runner.temp }}/cura-fetch` and `key: cura-fetch-5bea2f86153faed3a1c2d9081b8d6b753684678a`.

**Review passed (sp12-rev2-prf-130)**
Ran in profiles-cura: `pnpm install`, `pnpm lint`, `pnpm build` ok; `pnpm test` 205 passed / 12 files (fetch.test.ts 38, live download included); `node scripts/run.mjs checks` exit 0.
Against the first review: 1 fixed (`obtain` writes the cache only after `unpack`; a cached file over the cap or that does not unpack is removed, then the network is asked); 2 fixed (`within` covers the response and every body chunk, aborts the signal, `retryable: true`; `idleTimeoutMs` validated); 3 left to the coordinator as release lines (ci.yml has no `CURA_FETCH_CACHE` yet); 4 fixed, one test each.
Mutation probes (temp copy, each applied, fetch.test.ts run, restored), all killed: cache written before `unpack` (1 failed), no delete of bad cache (1), cached-size cap off (1), stall `retryable` false (1), idle validation off (1), body read without timeout (1), control-char check off (1), content-length precheck off (1), corrupt pax returns instead of throwing (1), pax cap 65535 (1) and 65537 (1), ustar prefix dropped (1). Caps are asserted at exact values (65536 accepted / 65537 refused). No wall-time asserts. Names go into a Map/Set (`__proto__` test present). Layering fine (adapters, node only, no cross-module imports); pinned commit matches `.reference/repos/Cura` HEAD.
Card restored (doc only): the first Progress and the first review were lost when the rework rewrote the file; I put them back from the run log and ticked the criteria.
Not blocking: a cache path that is a directory makes `rm(cached, { force: true })` throw, so every fetch fails non-retryable until it is removed by hand (local state, not network input). For the coordinator: ci.yml pins actions by SHA (`actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9 # v6.1.0` at :80), so use that rather than the `@v4` in the release line.
