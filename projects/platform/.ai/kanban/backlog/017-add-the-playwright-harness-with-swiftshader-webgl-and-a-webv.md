---
id: 17
title: Add the Playwright harness with SwiftShader WebGL and a webview stub loader
type: feature
priority: P0
effort: M
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [14, 9]
created: 2026-10-25
---

Module: `tooling` (snapshot harness). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Pinned Playwright and Chromium with `--use-angle=swiftshader --enable-unsafe-swiftshader`, a page loader that stubs `acquireVsCodeApi`, and a WebGL2 triangle rendered and compared to a snapshot.

## Acceptance criteria

- [ ] The triangle snapshot matches within a stated pixel tolerance
- [ ] The harness exposes `test:snapshot`; versions pinned exactly
- [ ] Snapshots are written only when `UPDATE_SNAPSHOTS=1` and the Linux runner is detected
- [ ] A webview bundle from the sample webview loads with the stub

## Tasks

- [ ] Install and pin Playwright
- [ ] Write the loader and stub
- [ ] Render and snapshot the triangle
- [ ] Document tolerance and regeneration

## Progress

Not started.
