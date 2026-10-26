---
id: 45
title: Test that colour and range changes cause no texture or buffer uploads
type: feature
priority: P0
effort: S
model: sonnet
area: [webview-kit]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: PLT-45-worker
depends_on: [44]
created: 2026-10-25
---

Context spy test catching per-slider-step re-uploads, a regression a snapshot would miss.

## Acceptance criteria

- [x] Switching colour mode and sweeping the range issues no `texImage2D`, `texSubImage2D` or `bufferData` call
- [x] The spy is a reusable helper in the testing entry

## Tasks

- [x] Write the spy proxy
- [x] Write the test
- [x] Export the helper

## Progress

Done. `spyGlUploads(gl)` (src/testing/gl-spy.ts, exported from the `testing` entry) proxies a WebGL2 context, counting `texImage2D`, `texSubImage2D`, `texImage3D`, `texSubImage3D`, `bufferData`, `bufferSubData` and summing `texStorage2D` bytes. `test/gl-upload-spy.spec.ts` builds a segment renderer on a spied context (SwiftShader), then runs 4 colour modes x 21 range sweeps (with colorRange changes): zero upload calls, no GL error; the spy is shown not blind (construction uploads are counted). Verified: `npx playwright test gl-upload-spy` passes; a mutation adding a texSubImage2D per draw makes it fail. `pnpm build` and prettier/tsc/eslint on my files pass; `pnpm lint` as a whole fails only on test/three-foreign.spec.ts:43 (another worker's file).
Files: src/testing/gl-spy.ts, src/testing/index.ts, test/gl-upload-spy.page.ts, test/gl-upload-spy.spec.ts, test/synthetic-moves.ts, CHANGELOG.md (all webview-kit).
