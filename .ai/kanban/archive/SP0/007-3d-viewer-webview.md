---
id: 7
title: 3D viewer in VS Code webviews
type: spike
priority: P1
effort: M
area: [viewer, platform]
milestone: R1
sprint: SP0
owner: worker-sonnet
created: 2026-10-25
---

What a 3D model viewer and editor inside a VS Code webview can and cannot do, and what to build it on.

Report: `docs/research/3d-viewer.md`. Notes: `.reference/notes/VSS-7-3d-viewer-webview.md`.

## Acceptance criteria

- [x] three.js, Babylon.js and raw WebGPU compared for a mesh viewer/editor in a webview: loaders (STL/OBJ/3MF/STEP), picking, gizmos, painting, instancing, memory
- [x] WebGPU and WebGL availability inside VS Code webviews (Electron version, flags, Linux) established with sources
- [x] Large-mesh performance: strategies (BVH, LOD, worker-side parsing, SharedArrayBuffer/transferables) and realistic limits
- [x] Existing VS Code STL/3MF/G-code viewer extensions surveyed: what they do, how, licence
- [x] Custom editor API (`CustomReadonlyEditorProvider`/`CustomEditorProvider`) for binary 3MF/STL assessed: backups, undo, large files, message passing costs
- [x] Recommendation with a sketch of the viewer architecture (extension host vs webview responsibilities)

## Tasks

- [x] Survey VS Code marketplace and GitHub for viewer extensions
- [x] Read VS Code webview/custom editor docs; check Electron/Chromium versions for WebGPU
- [x] Survey three.js examples (BVH, gizmos, painting); write the report

## Progress

Done. three.js vs Babylon.js vs raw WebGPU, WebGL/WebGPU status for Electron 43 / Chrome 150, large-mesh strategies, survey of existing VS Code viewer extensions with licences, custom editor API assessment, recommended architecture split between extension host and webview. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: whether `navigator.gpu` works inside a webview is unverified (nothing run); mesh limits are arithmetic, not benchmarks.
