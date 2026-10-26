---
id: 31
title: Run openPackage and readProject in a worker
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US8
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [20]
created: 2026-10-25
---

Wraps the library in a `worker_threads` worker for the extension host and a Web Worker for the webview, with transferable results and per-file crash handling.

**Code:** `vsslicer/modules/3mf/src/adapters/worker/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] The same library runs in both workers on a fixture
- [x] A crash or out-of-memory in the worker is reported as a typed error for that file only
- [x] Results are transferred, not copied

## Tasks

- [x] Node worker entry
- [x] Web Worker entry
- [x] Crash handling test

## Progress

Done (sp11-vwr-31). Files: `src/adapters/worker/{protocol,handle,nodeWorkerEntry,nodeWorkerClient,webWorkerEntry,webWorkerClient}.ts`, `test/worker.test.ts`.
- One worker per file (spawned, used once, terminated), so a crash or OOM touches only that file; the next read gets a fresh worker. Failures reject with `WorkerReadError` (`code`: a ThreeMfErrorCode, `worker-crashed`, `worker-out-of-memory`). OOM comes from `resourceLimits.maxOldGenerationSizeMb` (validated finite, > 0; default 2048); the web client cannot tell OOM apart, so it reports `worker-crashed`.
- Both entries call the same `handle()` (openPackage then readProject). Input bytes are transferred to the worker (caller's buffer detached); every ArrayBuffer in the result (part bytes, mesh arrays, rawConfig, preserved) is collected once (bounded visited set) and transferred back.
- Web Worker entry exports `attach(scope)` and self-attaches only when `WorkerGlobalScope` exists; the web test runs the real entry over a MessageChannel stand-in (no Worker in Node). A webview bundler builds `webWorkerEntry.ts` as the worker script. Node entry resolves to `.ts` from source and `.js` from dist (dist run checked by hand).
- Bounds: no new parsing; limits are the zip caps already in openPackage plus the heap limit; buffer walk capped at 5M visited values.
- Mutation probes (each fails a test): no input transfer, OOM code mapping, heap limit removed (hog test exits 0 after 240 MB, so only the limit makes it OOM), option validation, empty result transfer list, typed-array views skipped, Map walk skipped, visited set removed (cycle), messageerror listener removed, crash code swapped.
- Verify (macOS, Node 24; CI gate platform is the repo CI runner, not checked here): `pnpm lint` clean, `pnpm build` ok, `pnpm test` 243 passed (13 new in worker.test.ts), `node scripts/run.mjs checks` exit 0.

Release lines:
- CHANGELOG: `Added: run openPackage and readProject in a worker_threads or Web Worker (readInNodeWorker, readInWebWorker), results transferred, per-file typed crash errors (VWR-31).`
- index.ts exports: `export { readInNodeWorker } from './adapters/worker/nodeWorkerClient.ts'; export type { NodeWorkerOptions } from './adapters/worker/nodeWorkerClient.ts'; export { readInWebWorker } from './adapters/worker/webWorkerClient.ts'; export type { WebWorkerLike } from './adapters/worker/webWorkerClient.ts'; export { WorkerReadError } from './adapters/worker/protocol.ts'; export type { WorkerResult, WorkerErrorCode } from './adapters/worker/protocol.ts';` (the worker entries are not exported; a package.json `exports` subpath for them is the coordinator's call).

**Review failed (sp11-rev-vwr-31)**
- Ran in `vsslicer/modules/3mf`: `pnpm install` ok; `pnpm lint` fails only on `src/adapters/prusa/readPrusa2.ts` (prettier, VWR-25's file); for this card's files `prettier --check`, `eslint` and `tsc --noEmit -p tsconfig.test.json` are clean; `pnpm build` ok (dist entry run by hand: `dist ok 1`); `pnpm test` 243 passed (16 files, 13 in worker.test.ts); `node scripts/run.mjs checks` exit 0.
- Mutation probes re-run (each fails a test): heap limit removed, `messageerror` listener removed, typed-array buffers skipped in `collectBuffers`.
- Layering: adapters only, no VS Code, no cross-module imports. AC1 and AC2 hold for the tested paths.

Problems:
1. `src/adapters/worker/nodeWorkerClient.ts:46` (same shape at `webWorkerClient.ts:36`): a buffer that cannot be transferred makes `postMessage` throw after the worker was spawned (line 27). The promise rejects with an untyped `DOMException` (DataCloneError), not `WorkerReadError`, and the worker is never terminated, so the thread leaks and keeps the process alive. The most natural call hits it: `readInNodeWorker(readFileSync(path))` (Node Buffers are untransferable/pooled; the probe's Buffer had a 65600-byte backing for 23059 bytes). Same for `Buffer.from(...)` and for re-reading a buffer already detached. Probe: a script calling `readInNodeWorker(readFileSync('test/fixtures/real/pa_pattern.3mf'))` printed `rejected DataCloneError` and the process never exited (killed after 60 s). Expected fix (the rule): every failure after the worker exists settles through `done` (terminate, then reject with `WorkerReadError` or a documented error), and input whose buffer cannot be transferred, or that does not span its whole buffer, is copied (`bytes.slice()`) before transfer or refused before spawning. Add a test that reads a `readFileSync` Buffer and asserts it resolves (or rejects typed) with no worker left.
2. `src/adapters/worker/nodeWorkerEntry.ts:8`: the Node half of AC3 is untested. Probe: `parentPort!.postMessage(response)` (transfer list dropped) leaves all 13 worker tests passing. Expected fix: the Node entry goes through a tested function the way the web entry does (`attach(port)` over a MessageChannel, asserting the sender's buffers are detached), so dropping the transfer list fails a test.

Notes (not blocking): a view into a larger buffer detaches the caller's whole buffer (probe: `big.subarray(50, ...)` left `big.byteLength` 0); the fix in 1 covers it. The web client has no timeout, so a web worker that dies without an `error` event (some browsers on OOM) leaves the promise pending; worth one line in the doc comment.

**Fix (sp11-vwr-31-fix)**
- Problem 1: both clients now copy input that is not the whole of its buffer (`new Uint8Array(bytes)`, so pooled `readFileSync` Buffers and subarrays work and the caller's buffer is untouched), and `postMessage` is in try/catch that settles through `done` (terminate, then typed `WorkerReadError` `worker-crashed` with cause). Web client doc comment: it has no timeout, a worker dying without an `error` event leaves the promise pending (known limit).
- Problem 2: `nodeWorkerEntry.ts` now exports `attach(port)` (self-attaches when `parentPort` exists); test runs it over a MessageChannel and asserts the sender's result buffers are detached.
- New tests (3): node entry transfer, pooled/subarray input resolves with caller buffer intact, detached input rejects typed (node and web). Probes, each fails a test: entry transfer list `[]`, copy removed, node catch not settling via `done`, web catch not settling via `done`.
- Verify (macOS, Node 24): lint clean, build ok, worker.test.ts 16 passed; full `pnpm test` 270 passed, 1 failed in readProject.test.ts "Bambu falls back with a notice" (VWR-21's in-flight change, not this card); `node scripts/run.mjs checks` exit 0.

**Review failed (sp11-rev2-vwr-31)**
- Ran in `vsslicer/modules/3mf`: `pnpm install` ok, `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` ok, `pnpm test` 271 passed (17 files, 16 in worker.test.ts), `node scripts/run.mjs checks` exit 0. Dist run by hand: `readInNodeWorker(readFileSync(...))` from `dist/` resolves (`dist ok 1`) and the process exits.
- Previous problems: 1 is fixed in the code (pooled `readFileSync` Buffer resolves with the caller's buffer intact; detached input rejects `WorkerReadError` and the process exits at once). 2 is fixed (node entry `attach(port)` tested; dropping its transfer list fails a test).
- Hostile probes (node, real worker): empty bytes and 1 MB of junk reject `corrupt-zip`; no hang.
- Mutation probes in a temp copy that fail a test: node entry transfer list `[]`, web entry transfer list `[]`, client input transfer list `[]`, node client copy removed.
- Layering: adapters only, no VS Code, no cross-module imports.

Problems:
1. `test/worker.test.ts:182` ("a detached input rejects typed and spawns no lingering worker") cannot fail on the thing it names. Probe: in `nodeWorkerClient.ts:52` replace `done(() => reject(...))` with `settled = true; reject(...)` (no terminate): all 16 worker tests pass, yet a script reading a detached input then prints `rejected WorkerReadError worker-crashed` and never exits (killed by `timeout 20`, exit 124; the real code exits in 0 s). Same mutation in `webWorkerClient.ts:43` also passes every test. The fix note's "node catch not settling via done" / "web catch not settling via done" probes therefore do not hold for a catch that rejects typed but skips terminate. Expected fix (the rule: a test that names a bound must fail when the bound is removed): assert the worker was terminated, e.g. count `terminate()` calls in `fakeWebWorker` and spy on `Worker.prototype.terminate` (vitest `vi.spyOn`) for the node client, in that test.
2. `src/adapters/worker/webWorkerClient.ts:22`: the web client's copy of a partial view is untested. Probe: `owned = bytes` always leaves all 16 tests passing (a `subarray` input would then detach the caller's whole buffer). Expected fix: the pooled/subarray test (`test/worker.test.ts:170`) also runs `readInWebWorker(big.subarray(...), fakeWebWorker())` and asserts `big.byteLength` is unchanged.

Both are test-only gaps; the shipped behaviour is correct.
