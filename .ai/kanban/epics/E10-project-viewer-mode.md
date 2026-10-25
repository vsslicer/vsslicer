---
id: E10
title: Ship vsslicer.project in viewer mode
status: reviewed
initiative: I2
project: VWR
order: 3
depends_on: [E8, E9, E9, E34]
rows: ["§9 Embedded per-plate G-code and thumbnails"]
---

`vsslicer.project` in viewer mode is the first thing a user sees of the project work: double-click a `.3mf`, `.stl` or `.obj` in VS Code and get a WebGL2 3D view with a plates and objects tree, plate thumbnails, and a "Preview sliced plate" action that opens the embedded G-code in the I1 preview.

## Scope

In:
- `CustomReadonlyEditorProvider` for `*.3mf`, `*.stl`, `*.obj` (written new). The extension host holds the `Project` from E8; the webview fetches file bytes through `asWebviewUri` and parses meshes in its workers (`3d-viewer.md` §5).
- Webview: three.js `WebGLRenderer` (MIT) with three-mesh-bvh picking, orbit and view-cube navigation, bed rendering from the project's printer bed shape when known, object selection and hover, wireframe toggle, mesh warnings from E9 statistics. Built on E9 for transport and CSP.
- Plates and objects tree view (`TreeView` under the file), synchronised with the 3D selection; plate thumbnails from `plate_N.png` and the cover thumbnail.
- `ProjectModel` export (read-only in this epic): plates, objects, per-plate sliced artefacts, change events; `renderThumbnail(plate)` rendering a plate image offscreen in the webview.
- "Preview sliced plate" calls `GcodePreview.open(uri, {plate})` from E34.
- WebGL context failure detection with a message telling the user to enable hardware acceleration (`3d-viewer.md` §2).
- Size budgets from the E9 benchmark: above the budget the object shows as a bounding box with "Draw anyway".
- Plain WebGL2 only (D6); no WebGPU path.

Out: editing, saving and undo (E32 switches to `CustomEditorProvider`); measure (E55); web build (PLT, I10).

## Feature-matrix rows

- §9 Embedded per-plate G-code and thumbnails (P0 read): done when every plate of a Bambu/Orca project or `.gcode.3mf` shows its thumbnail and sliced state (time, weight from `slice_info.config`) in the tree, and its G-code opens in `vsslicer.gcode`. The write side (P1) is E27 through E8's part API and E31's writer.

## Acceptance criteria

- [ ] Fixture projects from each dialect open with the right plate and object tree (golden JSON from E8) and render; snapshot tests in headless Chromium with a software WebGL flag (CI only) match reference images within a pixel tolerance.
- [ ] Selecting in the tree highlights in 3D and vice versa; tested in the webview test harness from E8.
- [ ] Frame time and first-render time at 1, 5 and 20 M triangles are recorded on the reference machines and meet the budgets set from E9's benchmark (budgets written into this epic when measured).
- [ ] "Preview sliced plate" on a `.gcode.3mf` fixture opens the matching `plate_N.gcode` in `vsslicer.gcode`; if `vsslicer.gcode` is not installed the command explains how to get it.
- [ ] Error paths each tested and shown in the editor, never a blank panel: WebGL context failure, E8 open errors, E9 parse errors, size above budget, missing thumbnail part.
- [ ] Hidden then re-shown editor restores camera and selection (`getState`/`setState`); GPU resources are released on dispose (heap snapshot test).
- [ ] On the H2C: a `.gcode.3mf` that Bambu Studio sliced for the H2C opens with correct plates and thumbnails (fixture captured, firmware not involved). Everything else verified on fixtures (D5).

## Dependencies

- Needs E8 (`Project`), E9 (meshes, BVH), E9 (webview kit, transport, CSP), E34 (`GcodePreview.open`).
- Exposes `ProjectModel` (read-only now, editable from E32) and `renderThumbnail(plate)` to E27 (thumbnails for output) and PRN (plate references in sends and queue items).

## Risks and spikes

- Whether E9's renderer core is three.js or raw WebGL2. The research recommends three.js for the model viewer; spike with PLT before the first story so both projects share one renderer choice.
- Software WebGL in CI: Chromium needs an explicit flag since SwiftShader fallback was deprecated; confirm the snapshot harness runs on GitHub Actions (E8).
- `retainContextWhenHidden` memory overhead versus reload cost: measure on the 5 M fixture and pick per size.

## Eng review

- Scope challenge: viewer only; the readonly provider keeps undo and save out of I2. The plate tree and preview hand-off are the smallest set that meets I2's exit criteria. Measure was tempting here (cheap with a BVH) but is P2 and moved to E55.
- Tests: snapshots catch render regressions; tree goldens catch model mapping bugs; the hand-off test catches API drift with GCP.
- Blast radius: all parsing in workers; a webview crash closes one editor tab. No writes to user files.
- Reversibility: readonly; disabling the extension restores VS Code's default binary editor.
- Changed because of the review: added the "vsslicer.gcode not installed" path and the dispose heap check.
