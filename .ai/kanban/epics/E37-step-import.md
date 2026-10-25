---
id: E37
title: Import STEP files through a separately loaded OCCT WASM module
status: reviewed
initiative: I6
project: VWR
order: 10
depends_on: [E9, E32, E36, E2]
rows: ["§3 Import STEP"]
---

Users who design in CAD export STEP. This epic lets them open a `.step`/`.stp` file in the viewer, or add one to a project, with chosen tessellation quality, and keeps the result as a normal mesh object.

## Scope

In:
- `occt-import-js` (LGPL-2.1 per npm) loaded as a separate WASM file in a worker, never bundled into our JavaScript, so it can be replaced by the user (LGPL relinking). Its licence and the bundled OCCT version are reviewed before the first release.
- `vsslicer.project` opens `.step`/`.stp` in the viewer and offers "Add STEP to project"; a tessellation quality setting (linear and angular deflection) with a preview of the triangle count.
- Each STEP solid becomes a part or object (user choice); names come from the STEP product names.
- The tessellated mesh goes through E36's load-time repair and E9's statistics.
- Written new; no upstream slicer code (PrusaSlicer's STEP path wraps OCCT directly in C++).

Out: keeping the B-rep for re-tessellation after save (the 3MF stores the mesh; the STEP path is recorded in our namespace so the user can re-import); IGES and other CAD formats; live CAD tracking.

## Feature-matrix rows

- §3 Import STEP (P1): done when the STEP fixtures import with the expected solid count and volumes, and the resulting project slices with the Orca CLI.

## Acceptance criteria

- [ ] STEP fixtures (single solid, assembly with several solids, AP203 and AP214, a file with curved faces) import with solid counts and volumes within 0.5 percent of PrusaSlicer's import of the same files (PrusaSlicer release recorded as the oracle).
- [ ] Changing the quality setting changes the triangle count monotonically and the preview count matches the result.
- [ ] Import runs in a worker with progress and cancel; a 50 MB STEP file never blocks the extension host or the webview UI thread.
- [ ] Error classes each with a fixture and message: unsupported schema, empty file, WASM load failure (for example, CSP or missing file), out-of-memory in the worker.
- [ ] The WASM file is a separate asset in the VSIX and the extension still works when it is absent (STEP is then reported unavailable).
- [ ] Verified only on fixtures (D5).

## Dependencies

- Needs E9 (meshes), E32 (add-object command), E36 (repair on load), E2 (worker under CSP, WASM asset loading).
- Exposes `importStep(bytes, quality)` to `vsslicer.project` only.

## Risks and spikes

- `occt-import-js` was last published 2024-12 and its README states no licence (`3d-viewer.md` Licence notes). Spike: confirm the licence of the package and of the OCCT build it embeds; if unclear, build OCCT's STEP reader to WASM ourselves (LGPL-2.1 with the OCCT exception), which spends an innovation token.
- WASM memory limits in the webview or worker for large assemblies; measured on the largest fixture.

## Eng review

- Scope challenge: small (about two sprints), but kept separate from E36 because it brings a third-party WASM with its own licence review and release risk; it can ship or slip independently.
- Tests: PrusaSlicer's import is the oracle for counts and volumes; the absent-WASM test catches packaging regressions.
- Blast radius: a WASM crash kills only its worker; the viewer reports the failure.
- Reversibility: the WASM is optional; removing it disables STEP only.
- Changed because of the review: made the WASM asset optional and added the licence spike before any release.
