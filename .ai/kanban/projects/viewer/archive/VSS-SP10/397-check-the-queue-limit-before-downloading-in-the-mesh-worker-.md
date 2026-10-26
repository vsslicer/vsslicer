---
id: 397
title: Check the queue limit before downloading in the mesh worker pool parseUrl
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP10"
docs: [.ai/audits/SP9-audit.md]
created: 2026-10-26
---

Finding 6 of the SP9 audit (`.ai/audits/SP9-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Done: `pool.parseUrl` (`worker-web/pool.ts`) now refuses with `PoolQueueFullError` before `fetch` when running + queued + downloading >= maxInFlight + maxQueued (a `fetching` counter, decremented in `finally`), and with `PoolDisposedError` when disposed. Counting downloads too means 100 parallel calls start at most capacity fetches, not 100.
Test (`test/worker-web-pool.test.ts`): size 1, maxQueued 1, 10 parallel `parseUrl` with a counting fake `fetch`: exactly 2 fetches, 8 `PoolQueueFullError`.
Probe: check replaced by `if (false)` -> test fails (10 fetches, expected 2); restored.
Bounds: concurrent downloads (each up to the input cap) now bounded by maxInFlight + maxQueued (<= 16 + 1024); hostile test is the parallel burst.
Verify: mesh `pnpm lint`, `pnpm build`, `pnpm test` (78 passed, 1 skipped), `node scripts/run.mjs checks` pass.


**Review failed (sp10-rev-vwr-396-397)**
- Ran in `vsslicer/modules/mesh`: `pnpm install`, `pnpm lint`, `pnpm build`, `pnpm test` (78 passed, 1 skipped); `node scripts/run.mjs checks` exit 0.
- The check itself is right: `src/adapters/worker-web/pool.ts:143-151` refuses before `fetch`, and `fetching--` sits in `finally`. Probe (temporary test, deleted): pool size 1, maxQueued 0; the first `parseUrl` ends by fetch reject, abort mid-fetch, `FileTooLargeError` (body over cap), HTTP 500, body stream error, and refusal by `parse` after the fetch. In every case a second `parseUrl` got to `fetch` (2 fetches), so no path leaks capacity.

Problems:
1. No test pins the release of capacity. Mutation: delete `fetching--` at `pool.ts:150` -> `test/worker-web-pool.test.ts` still passes (20/20). With that bug the pool refuses every `parseUrl` forever after maxInFlight+maxQueued downloads. Fix: add a test that a failed (rejecting `fetch`) and a finished download free their slot, i.e. a later `parseUrl` reaches `fetch` (count fetches). Rule: a counter that is incremented needs a test that fails when its decrement is lost.
2. The audit's fix (finding 6) has a second sentence not done: "When `Content-Length` is known, allocate the buffer once." `src/adapters/worker-web/fetch-bytes.ts:18-35` still keeps every chunk and copies them into a new buffer, so each download briefly costs twice its size (up to 2 GiB at the 1 GiB cap). Fix: when `content-length` is present and <= maxBytes, allocate `new Uint8Array(declared)` up front and write chunks into it (refuse if the body runs past it), with a test that counts allocations or checks the returned buffer is the preallocated one; keep the chunk path for a missing header.
- Minor (no change needed): the `setTimeout(20)` in the new test is not required, since the refusal is decided synchronously before the first await; harmless.

**Fix for the review (sp10-vwr-397-fix)**
- `worker-web/fetch-bytes.ts`: with a `Content-Length` (integer, within the cap) the buffer is allocated once and chunks are written into it; a body past the declared length throws `FileTooLargeError`; a short body returns an owned `slice` of what arrived. No header (previously `Number(null)` was 0) keeps the chunk list.
- Tests: `test/worker-web-pool.test.ts` "a failed download and a finished download each free their slot" (size 1, maxQueued 0: a rejecting fetch, then 3 finished downloads, 4 fetches, none refused). `test/fetch-bytes.test.ts`: allocation of the declared size happens once and before the first read (counting `Uint8Array` proxy, zero-highWaterMark stream), over-long body refused, short body returned owned.
- Mutation probes: `fetching--` commented out -> pool test fails; prealloc branch disabled (`false`) -> the allocation and over-long tests fail. Both restored.
- Verify: mesh `pnpm lint`, `pnpm build`, `pnpm test` (82 passed, 1 skipped), `node scripts/run.mjs checks` exit 0.

**Review failed (sp10-rerev-vwr-397)**
- Card restored: the fix round had overwritten this file with only its own block (front matter, criteria, the first Progress entry and the earlier FAIL were gone). Rebuilt from `HEAD` and the SP10 run log; the fix block is kept word for word.
- Ran in `vsslicer/modules/mesh`: `pnpm install`, `pnpm lint` (eslint, prettier, tsc clean), `pnpm build`, `pnpm test` (82 passed, 1 skipped, 11 files + 1 skipped); `node scripts/run.mjs checks` exit 0.
- Earlier point 1 fixed: the "free their slot" test fails with `fetching--` commented out (1 failed / 27). Earlier point 2 fixed: `fetch-bytes.ts:19-33` preallocates and writes in place.
- Mutation probes (scratch copy): prealloc branch `if (false)` -> 2 tests fail; overflow check off -> "longer" test fails; `slice` -> `subarray` on a short body -> "shorter" test fails (`buffer.byteLength`); return the whole preallocated buffer on a short body -> "shorter" test fails. All new tests can fail.
- Hostile header probes (stubbed `Response`, counting `Uint8Array` allocations, cap 100): `-5` and `10.5` take the chunk path (still capped: `-5` with a 200-byte body refused); `1e30`, `Infinity`, `101` refused before any allocation; `1e1` and `0x0a` parse as 10 and preallocate 10 (within the cap, harmless; an 11-byte body is refused); `10, 10` and `10,20` are NaN -> chunk path (200-byte body refused at the cap); `  10 ` -> 10; `0` with no body -> empty, with 1 byte refused; lying header `10` with 12 bytes refused, with 3 bytes returns 3 bytes in a 3-byte buffer, with none an empty buffer. The returned buffer never exposes unwritten bytes.

Problems:
1. A compressed response is refused (regression). `fetch-bytes.ts:13`, `:19`, `:26`: `Content-Length` counts the bytes on the wire, but `fetch` hands back the decoded body, so with `Content-Encoding: gzip` (or br/deflate) the body is longer than the header. Probe (real `node:http` server, Node `fetch`): a 50,000-byte file sent gzipped (`content-length: 84`), cap 1 MB -> `FileTooLargeError: The file is 16384 bytes, above the 84 byte limit`. Before this round the same call succeeded (the chunk path caps the decoded bytes). Text formats (ASCII STL, OBJ) are what servers gzip, and `parseUrl` takes any URL. Expected fix: preallocate only when the body is not content-encoded (`content-encoding` absent or `identity`); otherwise take the chunk path, which still caps the decoded total at `maxBytes`. The early `declared > maxBytes` refusal can stay as it is. Add a test with a real gzip response (server sets `content-encoding: gzip` and the compressed `content-length`) that returns the full decoded bytes, and confirm it fails against the current code. Rule: a length header is trusted only for the representation it describes.
- Minor (optional): on the "longer than declared" path the error says "above the <declared> byte limit", which reads as the cap; the size is right, the wording is not.

**Fix for the second review (sp10-vwr-397-fix2)**
- `worker-web/fetch-bytes.ts`: preallocation from `Content-Length` only when `content-encoding` is absent or `identity`; a content-encoded body takes the capped chunk list (decoded total still capped at `maxBytes`). The "longer than declared" case now throws a plain `Error` ("the body is longer than its Content-Length (N bytes)"), not `FileTooLargeError`, so it no longer reads as the cap.
- Test (`test/fetch-bytes.test.ts`): real `node:http` server sends a 50,000-byte body gzipped with the compressed `content-length`; `fetchBytes` returns all 50,000 decoded bytes, and with a 20,000 cap still refuses with `FileTooLargeError`. The over-long test now asserts the new message.
- Mutation probe: encoding condition removed -> the gzip test fails (1 failed / 83); restored.
- Verify: mesh `pnpm lint`, `pnpm build`, `pnpm test` (83 passed, 1 skipped), `node scripts/run.mjs checks` exit 0.

**Review passed (sp10-rerev2-vwr-397)**
- Ran in `vsslicer/modules/mesh`: `pnpm install`, `pnpm lint` (eslint, prettier, tsc clean), `pnpm build`, `pnpm test` (83 passed, 1 skipped; 11 files + 1 skipped); `node scripts/run.mjs checks` exit 0.
- Second FAIL fixed: `fetch-bytes.ts:20-21` preallocates only when `content-encoding` is absent, empty or `identity` (case-insensitive); anything else takes the capped chunk path. The over-long message no longer reads as the cap (`:30`).
- `content-encoding` probes (scratch copy, real `node:http` server, Node `fetch`, 50,000-byte body, compressed `content-length`): `gzip`, `br`, `deflate`, `identity`, `IDENTITY`, empty -> 50,000 bytes at cap 1 MB, and `FileTooLargeError` at cap 20,000 (decoded body over the cap still refused). `gzip, identity` -> Node's `fetch` does not decode that list and hands back the 84 compressed bytes via the chunk path; that is fetch behaviour, not `fetchBytes`, and the chunk path caps whatever is decoded.
- Mutation probes (scratch copy): encoding condition removed -> gzip test fails; chunk-path cap off -> gzip and endless tests fail; pool `fetching--` commented out -> "free their slot" fails; pool check -> `if (false)` -> the refusal test fails. Dropping `toLowerCase` or the `''` case survives, but only loses the preallocation (safe chunk path); no behaviour at risk, no change needed.
- Earlier points hold: refusal before `fetch` (`pool.ts:144`), decrement in `finally` (`pool.ts:150`), preallocation for identity bodies with over-long/short-body handling (tests still pass, mutations from the previous round not repeated). Layering unchanged: adapters only, no VS Code, no cross-module imports. CHANGELOG has both entries.
