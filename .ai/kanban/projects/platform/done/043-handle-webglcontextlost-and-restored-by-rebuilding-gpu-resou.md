---
id: 43
title: Handle webglcontextlost and restored by rebuilding GPU resources
type: feature
priority: P0
effort: M
model: sonnet
area: [webview-kit]
story: US9
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-43-worker
depends_on: [41, 42]
created: 2026-10-25
---

A resource registry rebuilds buffers and textures from CPU-side arrays on `webglcontextrestored`.

## Acceptance criteria

- [x] `loseContext()` then `restoreContext()` redraws a snapshot-identical image without a new host message
- [x] Test asserts no host message sent between lose and restore
- [x] CPU arrays remain referenced only while registered (no leak after dispose)

## Tasks

- [x] Implement the registry
- [x] Hook the events
- [x] Test with `WEBGL_lose_context`

## Progress

Done: `trackContextLoss(canvas, {onLost, onRestored})` in `vsslicer/modules/webview-kit/src/gl/context-loss.ts` (exported from `gl`): `add(build)` runs a builder now and on every restore (closes over the CPU data; returns remover), `dispose()`. Cancels `webglcontextlost`. Verified: `pnpm lint`, `pnpm test` (unit: order, remover frees once, dispose drops entries), `pnpm test:browser` (SwiftShader, WEBGL_lose_context: identical pixels after lose+restore, zero postMessage calls between, no GL error). Leak criterion is covered structurally (entries dropped on remove/dispose; unit-tested), not by a heap measurement.

Files: src/gl/context-loss.ts, test/context-loss.test.ts, test/context-loss.page.ts, test/context-loss.spec.ts, src/gl/index.ts, README.md, CHANGELOG.md (Unreleased).

Review failed: `src/gl/context-loss.ts:40-48` (`add`) keeps `free` only from the first `build()`; `restored` (line 30-31) discards the function each rebuild returns. After a restore the remover/`dispose` frees the stale first-build objects (belonging to the dead context) and the rebuilt GPU objects are never freed. A renderer whose `build` returns `() => renderer.dispose()` (the only way PLT-44's `createSegmentRenderer`, whose textures/program/VAO are closure consts, can register) leaks its whole GPU state per restore. The browser test passes only because its free closes over the shared `textures` variable. Fix: store the latest free per entry (Map of {build, free}), update it on each rebuild, and add a unit test where each build returns a distinct free and the remover calls the latest. The "no leak" criterion needs that test, not just entry-drop checks. Verified fine: lint, 115 unit tests, build, spec passes.

Fix round: `add` now stores the latest `free` per entry (updated on every restore rebuild); remover and `dispose` call it (dispose now frees, per review). New unit test with a distinct free per build, written failing first. lint and unit tests pass. Files: src/gl/context-loss.ts, test/context-loss.test.ts.
