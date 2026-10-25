---
id: 7
title: 3D viewer in VS Code webviews
type: spike
priority: P1
effort: M
area: [viewer, platform]
milestone: R1
created: 2026-10-25
---

What a 3D model viewer and editor inside a VS Code webview can and cannot do, and what to build it on.

Report: `docs/research/3d-viewer.md`. Notes: `.reference/notes/VSS-7-3d-viewer-webview.md`.

## Acceptance criteria

- [ ] three.js, Babylon.js and raw WebGPU compared for a mesh viewer/editor in a webview: loaders (STL/OBJ/3MF/STEP), picking, gizmos, painting, instancing, memory
- [ ] WebGPU and WebGL availability inside VS Code webviews (Electron version, flags, Linux) established with sources
- [ ] Large-mesh performance: strategies (BVH, LOD, worker-side parsing, SharedArrayBuffer/transferables) and realistic limits
- [ ] Existing VS Code STL/3MF/G-code viewer extensions surveyed: what they do, how, licence
- [ ] Custom editor API (`CustomReadonlyEditorProvider`/`CustomEditorProvider`) for binary 3MF/STL assessed: backups, undo, large files, message passing costs
- [ ] Recommendation with a sketch of the viewer architecture (extension host vs webview responsibilities)

## Tasks

- [ ] Survey VS Code marketplace and GitHub for viewer extensions
- [ ] Read VS Code webview/custom editor docs; check Electron/Chromium versions for WebGPU
- [ ] Survey three.js examples (BVH, gizmos, painting); write the report

## Progress

Not started.
