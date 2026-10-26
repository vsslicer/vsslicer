---
id: 48
title: Draw into a foreign three.js WebGL2 context with state save and restore
type: feature
priority: P1
effort: L
model: opus
area: [webview-kit]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-48-worker
depends_on: [44, 43]
created: 2026-10-25
---

VWR draws the G-code ribbon inside three.js. The renderer takes an existing context, saves and restores the GL state it touches.

## Acceptance criteria

- [x] Snapshot of a three.js mesh plus segments matches
- [x] three.js renders correctly after the kit draws (state-leak test comparing GL state before and after)
- [x] three.js is a dev dependency of tests only, not of the kit

## Tasks

- [x] Define the state set to save
- [x] Implement foreign mode
- [x] Write the snapshot and leak tests

## Progress

Done (webview-kit, gl entry; adapters-level GL code, no VS Code API; not published, CHANGELOG under Unreleased).

- State set: `saveGlState(gl)` in `src/gl/gl-state.ts` (exported from `/gl`) saves program, VAO, active unit, `TEXTURE_2D` on units 0-2 and the active unit, `DEPTH_TEST`/`CULL_FACE`/`BLEND`, depth mask, `PIXEL_UNPACK_BUFFER` and the unpack parameters, and returns the restore function.
- Foreign mode: `createSegmentRenderer(gl, moves, { foreign: true })` wraps create and each `draw` in save/restore; default behaviour and the `SegmentRenderer` API are unchanged. `draw` now also sets depth writes on, culling and blending off (three leaves `CULL_FACE` on), which are the defaults standalone.
- Tests: `test/three-foreign.spec.ts` (SwiftShader, three 0.186.1): composite of a textured three.js plane at z 0.3 and the segments drawn with three's camera matrices equals, pixel for pixel, the segments-only render where layer 1 lies above the plane and the plane elsewhere (layer 0 hidden under it); GL state (31 parameters, 6 caps, texture and sampler bindings on units 0-7) is identical before and after create and draw, and three's next frame equals its first; without `foreign` the state differs and three's next frame is wrong, so the test catches the leak.
- "Snapshot" is checked as this computed composite rather than a stored PNG, so it does not depend on per-platform golden files.
- three.js and @types/three are devDependencies only; nothing in `src/` imports three.
- Verified: `pnpm install && pnpm lint && pnpm test && pnpm build` pass (115 unit tests); `npx playwright test` 16 passed (output to a temp dir).

Files: `vsslicer/modules/webview-kit/src/gl/gl-state.ts` (new), `src/gl/segment-renderer.ts`, `src/gl/index.ts`, `test/three-foreign.page.ts` (new), `test/three-foreign.spec.ts` (new), `test/segment-renderer.page.ts` (`moves` exported), `package.json`, `pnpm-lock.yaml`, `README.md`, `CHANGELOG.md`.
