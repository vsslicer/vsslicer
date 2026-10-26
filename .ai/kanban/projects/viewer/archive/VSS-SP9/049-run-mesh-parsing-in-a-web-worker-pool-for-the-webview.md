---
id: 49
title: Run mesh parsing in a Web Worker pool for the webview
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [47, 46, PLT-36, PLT-37]
created: 2026-10-25
---

Web Worker pool that uses the E2 transport to receive bytes and return transferred buffers, under the kit CSP.

**Code:** `vsslicer/modules/mesh/src/adapters/worker-web/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [x] A pool of N workers parses fixtures in headless Chromium through the kit's transport (bytes come from fetch of the file URL, D18; the kit's `sendBuffer` is not used)
- [x] Results are transferred, not copied (input detached in Chromium; reply transfer list asserted in Node)
- [x] Worker creation works under the kit CSP (E2's answer): blob: worker per D19, CSP header `worker-src 'self' blob:`, no violations
- [x] Pool size is an integer 1..16, validated; maxInFlight 1..size, maxQueued 0..1024 validated
- [x] Input bytes capped by the parser's `DEFAULT_MAX_FILE_BYTES` (lowerable), refused before queueing; file fetches capped while streaming
- [x] In-flight cap per pool; later requests queue up to `maxQueued`, then are refused with `PoolQueueFullError`
- [x] A worker crash rejects only its job (`WorkerCrashedError`); the worker is replaced
- [x] Tests count, never time

## Tasks

- [x] Pool
- [x] Transport wiring
- [x] Browser test

## Progress

Added `src/adapters/worker-web/`: `pool.ts` (`createWebModelWorkerPool`, `blobWorkerSpawner`, limits), `fetch-bytes.ts` (streamed, capped `fetch`), `handler.ts` + `worker.ts` (worker entry; handler testable in Node), `errors.ts` (`PoolQueueFullError`, `PoolDisposedError`). The worker file must be bundled self-contained (esbuild iife) and served as a webview file; `blobWorkerSpawner(url)` fetches it into a blob: URL (D19).
Tests: `test/worker-web-pool.test.ts` (18, Node, fake workers: validation, input cap, queue/refusal, crash isolation, abort, dispose, view copy, reply transfer list) and `test/worker-web-browser.test.ts` (1, real headless Chromium via Playwright, kit CSP header, pool of 2, 4 fixtures, input buffer detached, no CSP violations; passes with `PLAYWRIGHT_MODULE=.../modules/test-webview/node_modules/@playwright/test/index.mjs`; skipped when Playwright is not resolvable, since mesh has no Playwright dependency and I may not edit package.json). `pnpm test` 73 passed, 1 skipped (browser, unless the env var is set); lint, build, `run.mjs checks` clean.
Not done: no build script that emits the worker bundle (the test bundles it with the esbuild binary); no abort-in-browser test; Windows/Linux Chromium not run. Coordinator lines: src/index.ts `export { createWebModelWorkerPool, blobWorkerSpawner, MAX_POOL_SIZE } from './adapters/worker-web/pool.ts'; export type { PoolWorker, WebPoolOptions, WebModelWorkerPool } from './adapters/worker-web/pool.ts'; export { fetchBytes } from './adapters/worker-web/fetch-bytes.ts'; export { PoolQueueFullError, PoolDisposedError } from './adapters/worker-web/errors.ts';` ; package.json devDependency `@playwright/test` 1.64.1 (to un-skip the browser test) and optionally a `build:worker-web` script (esbuild iife of worker.ts).

**Review failed (sp9-rev-vwr-49)**

Ran in `vsslicer/modules/mesh`: `pnpm test` 73 passed, 1 skipped; with `PLAYWRIGHT_MODULE=.../test-webview/node_modules/@playwright/test/index.mjs` the browser and pool files pass 19/19 (real headless Chromium); `pnpm lint`, `pnpm build` clean; `node scripts/run.mjs checks` exit 0. Layer rule holds: everything is in `src/adapters/worker-web/`, imports only the application port/types, domain errors and sibling adapters (`bvh`, `parse-model`, `worker-node/errors`, which has no Node imports). Bounds checked in code: size 1..16, maxInFlight 1..size, maxQueued 0..1024, maxInputBytes 1..`DEFAULT_MAX_FILE_BYTES` and refused before queueing, crash terminates and drops only that worker, abort removes a queued job or terminates a running one, dispose rejects all. Results really transferred: handler posts mesh positions/indices + BVH roots/indirect buffer in the transfer list; input buffer detached in Chromium.

Mutation probes (temp copy): 9 of 11 killed (CSP without `blob:`, empty reply transfer list, empty input transfer list, queue `>=`->`>`, crash recycles worker, abort recycles worker, no in-flight cap, size cap 64, no input cap). Two survive:

1. `test/worker-web-pool.test.ts:112-118` ("a view that does not own its buffer is copied") cannot fail: `FakeWorker.postMessage` never transfers, so `whole.buffer.byteLength` stays 16 even with the copy removed (`pool.ts:118` -> `const owned = bytes` passes). Fix: make the fake really transfer (`postMessage = (m, t) => { structuredClone(m, { transfer: t }); this.posted++; }`), then assert `whole.buffer.byteLength === 16`.
2. AC "file fetches capped while streaming" has no test: removing the streaming check at `src/adapters/worker-web/fetch-bytes.ts:24` passes everything (Chromium fixtures are tiny). Fix: a Node test with a local `http` server streaming past `maxBytes` with no `Content-Length`, and one with a `Content-Length` over the cap, both expecting `FileTooLargeError`. (A probe confirmed the code itself is correct: endless stream and lying header both refused, pre-aborted signal rejects.)

Not blocking, for the coordinator:
- Browser test skip (`test/worker-web-browser.test.ts:15`): `.catch(() => undefined)` also swallows a wrong `PLAYWRIGHT_MODULE` path, so an explicitly requested run turns into a silent skip (false green). Expected: fail when the env var is set and the import fails; when unset, skip with the reason in the output (e.g. the test title or `ctx.skip('no @playwright/test: set PLAYWRIGHT_MODULE')`).
- Playwright devDependency: agree, pinned `@playwright/test` 1.64.1 like test-webview, but run it as a `test:integration` script (CI already runs `test:integration`) so `pnpm test` stays browser-free and CI needs `playwright install chromium` only there.
- The test runs `node_modules/.bin/esbuild`, a transitive dependency of vite; declare `esbuild` as a devDependency (also needed for the proposed `build:worker-web`).
- `pool.ts:121` the queued-job abort listener is never removed once the job starts or ends; a long-lived signal reused for many parses accumulates listeners. Remove it in `pump`/`end`.
- `test/worker-web-pool.test.ts:90` title says "the running worker is replaced" but only asserts `terminated`; add a follow-up parse and `spawned.length === 2`.
- The test CSP uses `script-src 'self'` in place of the kit's nonce; fine for worker-src, worth a one-line comment.

**Fix round (sp9-vwr-49-fix)**

Blocking: (1) `FakeWorker.postMessage` now does `structuredClone(m, { transfer })`, so the view-copy test asserts the shared buffer stays 16 bytes and an owning array is detached. (2) New `test/fetch-bytes.test.ts` (3 tests, local `http` server on 127.0.0.1 port 0): body within the cap, `Content-Length` over the cap, endless chunked stream with no `Content-Length`; both refusals expect `FileTooLargeError`.
Non-blocking: browser test now throws (fails the file) when `PLAYWRIGHT_MODULE` is set and does not import; unset, it skips with the reason in the test title. Queued-job abort listener is stored on the job and removed when the job starts and on dispose; test counts live listeners via a wrapped signal (2 -> 1 -> 0). Crash/abort test now parses again and asserts `spawned.length === 2`.
Real bug found by the listener change: when one signal aborts a running and a queued job, the running job's end pumped the queued job into a worker even though it was already aborted. `pump` now rejects a job whose signal is aborted instead of starting it (covered by the existing abort test).
Verified: `pnpm test` 77 passed, 1 skipped; with PLAYWRIGHT_MODULE the browser and pool files pass 20/20; `PLAYWRIGHT_MODULE=/nope` fails with a clear message; lint, build, `run.mjs checks` clean. Not done: mutation re-run of the two surviving probes; no dependency added (Playwright/esbuild devDependency and `test:integration` left to the coordinator).

**Review passed (sp9-rerev-vwr-49)**

Ran in `vsslicer/modules/mesh`: `pnpm test` 77 passed, 1 skipped (12 files, browser skipped); `pnpm lint`, `pnpm build` clean; `cd vsslicer && node scripts/run.mjs checks` exit 0. Browser test with `PLAYWRIGHT_MODULE=.../test-webview/node_modules/@playwright/test/index.mjs`: browser + pool + fetch-bytes files 23/23 pass in real headless Chromium. `PLAYWRIGHT_MODULE=/nope/index.mjs`: file fails with "cannot be imported: Cannot find module". Unset: skipped, title reads "(skipped: no @playwright/test, set PLAYWRIGHT_MODULE)".

Mutation probes (temp copy, pool + fetch-bytes tests, baseline 22/22): both previously surviving probes now killed: view copy removed (`pool.ts:125` -> `bytes`) fails "a view that does not own its buffer is copied"; streaming check removed (`fetch-bytes.ts:24`) fails "an endless stream ... is cut off at the cap". New fixes also guarded: `pump` aborted-job check removed (`pool.ts:91`) fails the abort test (queued job would start); queued-listener removal in `pump` (`pool.ts:89`) and running-listener removal in `end` (`pool.ts:75`) each fail the listener-count test. Read the `pump` fix: one signal aborting a running and a queued job now rejects the queued one instead of starting it; listener is not `once` for running jobs and is removed in `end`, so no leak.

Every acceptance criterion re-checked against code and tests (bounds 1..16 / 1..size / 0..1024 / input cap before queueing, queue refusal, crash isolation, transfer both directions, CSP `worker-src 'self' blob:`). No wall-time asserts (the endless server's 1 ms write interval is not an assertion).

Not blocking: two probes survive, both harmless: removing the `Content-Length` early-out (`fetch-bytes.ts:13`) passes because the streaming check still refuses (the header check is only an early exit; a test could assert the server connection closed before 1000 bytes were read if wanted); removing the listener removal in `dispose` (`pool.ts:150`) is untested (one stale no-op listener per queued job at dispose). Dependency items from the first review (Playwright/esbuild devDependencies, `test:integration`) remain with the coordinator. No in-place edits made.
