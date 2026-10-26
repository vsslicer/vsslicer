---
id: 47
title: Memory test with 15 million synthetic moves
type: feature
priority: P1
effort: M
model: sonnet
area: [webview-kit]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-47-worker
depends_on: [44]
created: 2026-10-25
---

The 500 MB budget case: GPU-side bytes per move must stay at or under the stated layout.

## Acceptance criteria

- [x] 15 million moves render in headless Chromium; the test prints GPU bytes per move and fails above the layout's figure
- [x] Result noted with machine, GPU and Chromium version

## Tasks

- [x] Generate moves in chunks
- [x] Measure texture bytes
- [x] Assert and print

## Progress

Done. `test/memory.spec.ts` (+ memory.page.ts, shared test/synthetic-moves.ts) generates 15,000,000 moves in 1M-record chunks, renders them with the segment renderer (SwiftShader, Speed mode), prints GPU bytes per move from the spied `texStorage2D` allocations and fails above 28 + 0.2 (layer table is 0.125 for the 64-move synthetic layers). Takes about 3 minutes.
Result: 28.1281 B/move, 421.9 MB total, no GL error. Machine: Apple M1 Pro, 16 GB, darwin/arm64; renderer ANGLE (Google, Vulkan 1.3.0, SwiftShader Device, LLVM 10.0.0) (software, no hardware GPU); max texture 8192 (9 chunks); Chromium 156.0.8078.4 (Playwright).
Not covered: browser-process RSS and real GPU memory (spy counts allocated texture storage; the 28 B figure is the data textures, which dominate). Files: test/memory.spec.ts, test/memory.page.ts, test/synthetic-moves.ts, src/testing/gl-spy.ts, CHANGELOG.md.
