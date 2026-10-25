---
id: 6
title: "Run the parser in a worker with cancel, progress and a memory cap"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: GCP-6-worker
depends_on: [5]
created: 2026-10-25
---

Module: `gcode-parser`, layer `adapters` (worker runner). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

A parser crash or out-of-memory error must stay out of the extension host.

## Acceptance criteria

- [x] A `worker_threads` host parses the corpus and returns the same results as in-process
- [x] Cancel stops a 200 MB synthetic parse within 500 ms (test)
- [x] Progress events arrive; exceeding the memory cap gives a typed error in the host (test)
- [x] The host never parses on its own thread

## Tasks

- [x] Worker entry and host wrapper
- [x] Cancel and progress messages
- [x] Memory cap via resourceLimits and typed errors

## Progress

Done, gcode-parser 0.5.0 published to the local registry (only this module); empty-store `pnpm install --frozen-lockfile` + tests pass.
- `parseInWorker(source, {signal, onProgress, memoryCapBytes, maxPendingChunks, total, ...ParserOptions})` in `adapters/worker-host.ts` + `worker-entry.ts`; types and `ParseWorkerError` (memory-cap, parse-failed, worker-crashed) in `application/parse-in-worker.ts`. Source: path or byte stream. Worker_threads only (web-worker variant later).
- Verified (test/worker.test.ts): corpus equals in-process (main thread is not the parsing thread); stream source + monotonic progress ending at total; cancel of a 200 MB parse rejects in <500 ms with nothing after; slow consumer keeps arrayBuffers < 64 MB and the worker far from EOF; heap overflow gives `memory-cap`; worker error gives `parse-failed` with cause (EISDIR).
- Also fixed the GCP-5 `line-too-long` bug in `src/domain/parser.ts` (carry and whole-line paths), test/line-too-long.test.ts for 1 KB, 64 KB, 100 KB, whole input.
- Tooling ^0.8.0. lint, 168 tests, build pass.
- Not done: web-worker variant; abort while a stream source is blocked in its own next().
- Files (vsslicer/modules/gcode-parser/): src/adapters/worker-host.ts, src/adapters/worker-entry.ts, src/application/parse-in-worker.ts, src/index.ts, src/domain/parser.ts, test/worker.test.ts, test/line-too-long.test.ts, package.json, pnpm-lock.yaml, CHANGELOG.md, README.md; .reference/notes/GCP-6-parser-worker.md.

Review fixes: the host-side `stat(source)` in `adapters/worker-host.ts` is now wrapped, so a missing path rejects with `ParseWorkerError` `parse-failed` and `cause.code === 'ENOENT'`. It was the only host-side operation before the worker starts; opening the file happens in the worker (EACCES and EISDIR already gave parse-failed with the fs code as cause). Tests added for ENOENT and EACCES (chmod 000 temp file, skipped on Windows and as root). Version 0.5.1 with CHANGELOG, published alone; empty-store frozen install from a copy of the module passes; lint, 170 tests and build pass.
