---
id: 48
title: Run mesh parsing in worker_threads for the extension host
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [47, 46]
created: 2026-10-25
---

Node worker adapter that parses and builds the BVH off the host thread and returns transferred buffers.

**Code:** `vsslicer/modules/mesh/src/adapters/worker-node/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [x] Parse and BVH run in a worker on the fixtures
- [x] A crash is reported as a typed error for one file
- [x] `ArrayBuffer`s are transferred (detached in the sender)

## Tasks

- [x] Worker entry
- [x] Crash handling
- [x] Tests

## Progress

Done. Port `ModelWorker` (`src/application/model-worker.ts`), adapter `nodeModelWorker` (`src/adapters/worker-node/`: `node-model-worker.ts`, `worker.ts`, `errors.ts`). One short-lived worker per file parses and builds the BVH; input bytes are transferred (detached in the caller), mesh and BVH buffers transferred back. Typed errors cross as code plus fields and are rebuilt with `instanceof` intact; crashes, non-mesh errors and worker exit become `WorkerCrashedError`; an AbortSignal terminates the worker and rejects with its reason. `SerialisedBvh` moved to the application layer (re-exported). Verified with a real worker in test/parse-model.test.ts (also run from built `dist`). Caveat: a `bytes` view transfers its whole buffer. Not done: worker pooling.


Review failed (vwr374748-reviewer): lint/build/test pass (51, Node 26.12.1; Node 24 not installed here, so the .ts worker path under 24 is unverified; it needs type stripping, unflagged from 24.3). Real worker, detach, typed-error rebuild, abort and the TypeError crash path verified. FAIL: src/adapters/worker-node/node-model-worker.ts:36 postMessage throws synchronously (DataCloneError) when the buffer is already detached or opts is not cloneable (probe: parse(bytes, {extension: () => 1}), or parse() twice on the same bytes). The Promise rejects with a raw DOMException, not a typed MeshError, and the worker is never terminated and the abort listener stays: the process stayed alive after the rejection (probe in the review scratch dir, dist build). Fix: wrap postMessage in try/catch and call finish(() => reject(new WorkerCrashedError(...))). Also untested: the real worker exit / out-of-memory path (only a TypeError inside the worker is exercised).
Fix (vwr48-fix): postMessage is wrapped; a DataCloneError (detached buffer, uncloneable opts) rejects with WorkerCrashedError, terminates the worker and removes the abort listener. Tests: uncloneable opts and double-parse (assert type, no worker resource left); lint/build/test pass (53). Real worker exit/OOM still untested (needs a test-only hook in worker.ts; skipped). Files: node-model-worker.ts, test/parse-model.test.ts.
Changelog: VWR-48 `nodeModelWorker` parses and builds the BVH off-thread.

Review passed (vwr48-rereview): fix verified. Probes p1-p3 on dist: uncloneable opts and double-parse reject WorkerCrashedError, no live worker, process exits. Both new tests fail (2 failed) against a scratch copy with the old unwrapped postMessage, pass with the fix. Full mesh suite twice: 53/53 both runs, lint clean. Notes: the abort-listener part of the first test only checks signal.aborted, so listener removal is not strictly asserted (minor); the real worker exit/OOM path stays untested, accepted as a follow-up needing a test-only hook, not a blocker.
