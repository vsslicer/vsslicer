# 3D viewer and editor in VS Code webviews

Researched 2026-10-25. Sources: VS Code docs and `microsoft/vscode` main@4ef6bab74 (read over raw.githubusercontent.com, not cloned), npm registry, Open VSX API, three.js 0.186.1, Babylon.js 9.32.0, PrusaSlicer@30ef591 and OrcaSlicer@09aa0114 (local clones, read only). Raw notes: `.reference/notes/VSS-7-3d-viewer-webview.md`. Anything not read from a source is marked `(unverified)`. No code was run, so every runtime claim about WebGPU/WebGL in a webview is a documented-behaviour inference until the probe in Open questions is done.

## Findings

### 1. three.js vs Babylon.js vs raw WebGPU

| Aspect | three.js 0.186.1 (MIT) | Babylon.js 9.32.0 (Apache-2.0) | Raw WebGPU |
|---|---|---|---|
| STL | `STLLoader`: DataView, non-indexed Float32 position+normal (72 B/tri on GPU), no vertex dedup, ASCII via regex, no DOM use so workable in a worker (inference) (`three@0.186.1:examples/jsm/loaders/STLLoader.js`) | `.stl` plugin in `@babylonjs/loaders` | write own (binary STL is ~30 lines) |
| OBJ | `OBJLoader` | `.obj` plugin | write own |
| 3MF read | `3MFLoader`: core + materials; Materials ext. partial (textures, colour groups, beam lattice approximated); no Production ext., no Slice ext.; unzip via fflate, XML via `DOMParser`, so main thread only; `parse()` is synchronous (`.../3MFLoader.js`) | none listed in the loader docs | write own |
| 3MF write | none: `examples/jsm/exporters` has only OBJ and STL (jsDelivr file listing of three@0.186.1) | none listed | write own |
| STEP | none in three; use `occt-import-js` 0.0.23 (WASM, `ReadStepFile(Uint8Array)` returns triangulated meshes plus `brep_faces`, LGPL-2.1 per npm, last published 2024-12) | none listed | same WASM |
| Picking | `Raycaster` (CPU, linear in triangles) + `three-mesh-bvh` 0.9.16 (MIT) for accelerated raycast/shapecast; `BatchedMesh.raycast` returns `batchId` | built-in `scene.pick`, GPU or CPU; thin instances support picking but collide on one bounding info | write own (GPU id buffer or BVH) |
| Gizmos | `TransformControls` (translate/rotate/scale, snapping, `dragging-changed`, `objectChange`; picks own helper meshes); `ViewHelper`; `three-viewport-gizmo` 2.2.0 (MIT) | `GizmoManager` with position/rotation/scale/bounding-box gizmos, snapping, utility-layer rendering | write own |
| Selection | `SelectionBox`/`SelectionHelper` (box); lasso and triangle collection via three-mesh-bvh `selection`/`collectTriangles` examples | built-in picking, no lasso doc found | write own |
| Painting | no built-in; `DecalGeometry`, vertex colours, BVH `collectTriangles` triangle painting example | texture painting via DynamicTexture, vertex colours (unverified in detail) | write own |
| Clipping/cut plane | `clippingPlanes`, `ClippingGroup`; BVH `clippedEdges` example for cap/outline | clip planes | write own |
| Instancing | `InstancedMesh`; `BatchedMesh` (per-instance matrix, colour, visibility, per-instance frustum cull, raycast with `batchId`, preallocated buffers, Uint32 index above 65535 vertices) (`src/objects/BatchedMesh.js`) | thin instances: 16 floats/instance, no JS objects, all-or-none draw, picking supported (doc.babylonjs.com thinInstances) | own instancing |
| WebGPU | `WebGPURenderer` (`three/webgpu`): manual says "still in an experimental state although its maturity level has been greatly improved"; auto-falls back to WebGL2; `ShaderMaterial`, `RawShaderMaterial`, `onBeforeCompile` unsupported (port to TSL); `EffectComposer` unsupported (https://threejs.org/manual/pages/webgpurenderer.html). `WebGLRenderer` stays maintained | `WebGPUEngine` + `await initAsync()`; docs say no differences besides initialisation; docs state, in the WebXR section only, that an existing WebGPU scene cannot be switched to WebGL and the engine must be chosen before creating the scene (https://doc.babylonjs.com/setup/support/webGPU); general scope not stated | native |
| Memory (rule of thumb, arithmetic not measured) | STLLoader output 72 B/tri: 1 M tri = 72 MB, 10 M = 720 MB, plus BVH. Indexed+deduped mesh is roughly 24 B/tri | similar | best control; no library overhead |
| Bundle size | npm unpacked 20 MB (tree-shaken app bundle far smaller) | npm unpacked 72 MB, larger baseline engine | smallest |

Reasoning for the decision: a slicer viewer needs custom pipelines (per-triangle painting overlays, cut caps, overhang shading, layer-slider G-code ribbons). In three.js these need `ShaderMaterial`/`onBeforeCompile`, which `WebGPURenderer` does not support, so the practical choice is three.js on `WebGLRenderer`, with TSL/WebGPU as a later opt-in. Babylon covers more built-ins (gizmos, picking) but has no 3MF/STEP path and a heavier engine; the model-specific work (3MF, painting data, BVH) is ours either way. Raw WebGPU means rewriting camera, picking, gizmos, text, lines and loaders, and is not available on much of Linux (next section).

### 2. WebGPU and WebGL inside VS Code webviews

- VS Code pins Electron 43.8.3 (`microsoft/vscode@4ef6bab74:.npmrc`: `target="43.8.3"`, `runtime="electron"`). Electron 43.8.3 ships Chrome 150.0.7871.250, Node 24.22.0, V8 15.0 (https://releases.electronjs.org/releases.json, read 2026-10-25). Electron 45 (Chrome 156) is the newest line. VS Code moves Electron roughly every few releases, so treat the version as a moving floor.
- WebGPU in Chromium: Windows/macOS/ChromeOS since Chrome 113; Linux Intel Gen12+ since Chrome 144, NVIDIA (driver 535.183.01+) on Wayland since Chrome 147; all other Linux GPUs still need `--enable-unsafe-webgpu --ozone-platform=x11 --use-angle=vulkan --enable-features=Vulkan,VulkanFromANGLE` (https://github.com/gpuweb/gpuweb/wiki/Implementation-Status). So on Chrome 150 a large part of Linux (AMD, older Intel, NVIDIA on X11) has no WebGPU by default. Whether Electron applies the same default-on rollout as Chrome (Chrome gates some via field trials) is `(unverified)`.
- Webview context: webviews are an `iframe` with `sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-downloads"` and `allow="cross-origin-isolated; autoplay; local-network-access; clipboard-read; clipboard-write"` (`src/vs/workbench/contrib/webview/browser/webviewElement.ts:430-436`) on the `vscode-webview` scheme, registered `standard, secure` (`src/mainImpl.ts:111-115`). Secure context means `navigator.gpu` is exposed when the engine supports it. I found no VS Code issue or doc stating WebGPU works or fails in a webview (issue search returned only the editor's own GPU renderer, microsoft/vscode#221145). Status: `(unverified)`, needs the probe.
- Flags: VS Code only copies a whitelist of switches from `argv.json` to Electron: `disable-hardware-acceleration`, `force-color-profile`, `disable-lcd-text`, `proxy-bypass-list`, `remote-debugging-port`, and on Linux `force-renderer-accessibility`, `password-store` (`src/mainImpl.ts:253-280`). `enable-unsafe-webgpu` is not among them. A user can start `code --enable-unsafe-webgpu` from a shell `(unverified)`, but an extension cannot set it. Our own VSCodium build could patch this (see Implications).
- WebGL: works wherever Chromium finds a GPU. Chromium deprecated the automatic SwiftShader (software) fallback: context creation fails unless `--enable-unsafe-swiftshader` is passed (https://developer.samsung.com/browser/policy/enable-unsafe-swift-shader.html cites M139; https://groups.google.com/a/chromium.org/g/blink-dev/c/yhFguWS_3pM; exact cut-off per platform `(unverified)`). Risk: GPU-less Linux VMs, containers, some VNC/remote desktops. `disable-hardware-acceleration` in `argv.json` (the documented VS Code workaround for GPU crashes) would therefore also break a WebGL viewer. The viewer must detect context-creation failure and show a clear message.
- `retainContextWhenHidden` keeps a hidden webview alive but "has high memory overhead"; `getState`/`setState` are the recommended persistence, and without either, webview state is lost when the tab is hidden (https://code.visualstudio.com/api/extension-guides/webview). For a GPU-resident multi-hundred-MB mesh, reload on re-show is expensive, so use `retainContextWhenHidden` only for the viewer, and release GPU resources on `dispose`.
- `SharedArrayBuffer`/cross-origin isolation: VS Code toggled COOP/COEP only in the web host; the desktop PR to set headers was closed unmerged (microsoft/vscode#145539, #116715, #137884). `webview/browser/pre/index.html` only sets `vscode-coi=3` if the host page is `crossOriginIsolated`. Assume `SharedArrayBuffer` is unavailable in webviews `(unverified at runtime)`.
- CSP: default must be `default-src 'none'` with explicit allowances; inline scripts need a nonce or external files; workers need `worker-src` and, for blob workers, `blob:` (webview docs; worker specifics `(unverified)`). `GleisonPauloC.gcode-preview` runs three.js InstancedMesh under a strict CSP, which shows it is workable.

### 3. Large-mesh performance

| Strategy | What it gives | Constraints |
|---|---|---|
| Binary STL parse in a worker, transfer `ArrayBuffer`s | UI stays responsive; `nightmesh` parses OBJ/STL/PLY on a separate thread and gates files over 1 GB behind a manual "Draw Model" | transferables work worker<->webview; extension host -> webview `postMessage` of `ArrayBuffer` is "more efficiently transferred" for `engines.vscode >= 1.57`, typed-array views are not recreated (`vscode.d.ts:~10000-10026`) |
| Vertex dedup and indexed geometry | ~3x less GPU memory than STLLoader output | must be written (`BufferGeometryUtils.mergeVertices` in main thread is slow on millions of vertices, unverified) |
| `three-mesh-bvh` | Accelerated raycast/shapecast/painting/lasso selection; `GenerateMeshBVHWorker` builds off-thread; `serialize`/`deserialize`; `refit` for vertex edits. Only quoted figure: 500 rays against an 80k-triangle model at 60 fps (README) | `ParallelMeshBVHWorker` requires `SharedArrayBuffer` (falls back to single worker); static, so topology changes (painting subdivision, cuts) need rebuild; no build-time benchmark found, so measure |
| `BatchedMesh`/`InstancedMesh` | many plate objects and G-code segments in few draw calls | preallocated buffers; per-instance culling only |
| LOD / decimation | `meshoptimizer` 1.3.0 (MIT) WASM simplifier for proxy meshes | simplify only for navigation proxy, never for slicing input |
| G-code | tube geometry via `InstancedMesh` (GleisonPauloC, MIT); `gcode-preview` 2.18.0 (MIT) parses in a worker and renders three.js | millions of segments exceed per-instance budgets; use layer windowing |
| Guard rails | `meshview` rejects binary STL whose declared triangle count exceeds file length and models above 10 M triangles | binary STL is 50 B/tri, so 10 M = 500 MB file |

Realistic limits (derived by arithmetic, not benchmarked): about 1-2 M triangles interactive on integrated GPUs with picking via BVH, 5-10 M possible on discrete GPUs but memory (72 B/tri raw, plus BVH) and BVH build time then dominate. Plan a benchmark on 1, 5, 20 M-triangle STLs as the first implementation task.

### 4. Existing VS Code viewer extensions

Open VSX API (https://open-vsx.org/api/<namespace>/<name>) and READMEs, 2026-10-25. Download counts are Open VSX; the Marketplace shows 211,946 installs for `slevesque.vscode-3dviewer`.

| Extension | Version / last publish | Licence | Formats | Approach (per README/source page) |
|---|---|---|---|---|
| `OwenPKent.meshview` (github.com/owenpkent/meshview, archived) | 0.1.0, 2026-07 | MIT | STL | three.js in webview; `CustomReadonlyEditor`; esbuild bundles for extension host and webview; triangle-count sanity checks; orbit/pan/zoom, wireframe, grid, stats |
| `MBKDevStudio.nightmesh` (github.com/mbKalkan/nightmesh) | 0.3.0, 2026-10-21 | MIT | glTF, GLB, OBJ, STL, PLY | read-only, offline decoders, OBJ/STL/PLY parsed off-thread, >1 GB manual draw, desktop only |
| `AssetToolLabs.mesh-viewer-vscode` (github.com/AssetTool-Labs/mesh-viewer) | 0.6.0, 2026-08 | MIT | STL, OBJ, 3MF, STEP, GLB/glTF, FBX, PLY, USD, splats | three.js custom editor; Draco/meshopt/KTX2; performance HUD |
| `slevesque.vscode-3dviewer` (github.com/stef-levesque/vscode-3dviewer) | 0.2.2, 2021 | MIT | 3ds, dae, fbx, stl, obj | three.js, embeds three.js editor; stale |
| `mtsmfm.vscode-stl-viewer` (github.com/mtsmfm/vscode-stl-viewer) | 0.3.0, 2022 | MIT | STL | stale; approach not stated on the repo page |
| `GleisonPauloC.gcode-preview` (github.com/gleisonpauloc/gcode-preview) | 0.1.0, 2026-03 | MIT | G-code | three.js InstancedMesh tubes, webview with strict CSP, layer slider, live reload, G90/G91, M82/M83, "print recovery" export |
| `thingraph.gcode-viewer` | 1.3.1, 2026-10 | proprietary ("SEE LICENSE IN LICENSE") | G-code, STL, 3MF, STEP, IGES | closed; repo on codeup.aliyun.com |
| `thingraph.cad-viewer` | 1.5.7 | proprietary | many CAD formats | closed |
| `battlecook.omni-viewer` | 0.46.0 | MIT | multi-format | not 3D-specific |

Gaps: none of these edit meshes, read 3MF settings/plate metadata, preview G-code with toolhead simulation, or offer slicer gizmos (painting, cut, measure). All viewers surveyed use three.js. None publicly documented WebGPU. The only 3MF-capable open viewer found is `mesh-viewer-vscode` (read-only). Licences: the MIT ones can be read for patterns; the thingraph ones cannot be reused.

### 5. Custom editor API for binary 3MF/STL

Sources: https://code.visualstudio.com/api/extension-guides/custom-editors, `vscode.d.ts` main@4ef6bab74.

- Providers: `CustomReadonlyEditorProvider` (no undo, no save; right for pure viewing) vs `CustomEditorProvider` (adds `saveCustomDocument`, `saveCustomDocumentAs`, `revertCustomDocument`, `backupCustomDocument`, and the `onDidChangeCustomDocument` event). One `CustomDocument` per file, `dispose` after the last editor closes; `supportsMultipleEditorsPerDocument: true` allows split views.
- Undo/redo: fire `CustomDocumentEditEvent` (with `undo`/`redo` callbacks) to get VS Code's undo stack; `CustomDocumentContentChangeEvent` marks dirty but has no undo. Extension owns the edit history; the webview only sends edit commands.
- Backups: `backupCustomDocument` runs ~1 s after the user stops editing, not with auto-save (`vscode.d.ts:10646-10666`), and must persist the full document state to the supplied URI. For a 3MF this means writing the whole zip (or a delta format of our choice) each time, so keep edit state compact (edit list plus original bytes) rather than serialising meshes.
- Save does not depend on the webview: the doc says save should not require a visible `WebviewPanel`, so the model must live in the extension host (or be reconstructible there). Binary data is written with `workspace.fs.writeFile` using `Uint8Array`.
- Large files: `openCustomDocument` receives only a `Uri`; reading it with `workspace.fs.readFile` loads the whole file into extension-host memory. Alternative for read-only views: the webview fetches the resource itself through `asWebviewUri`, and VS Code streams it to the webview using transferable streams where supported (`webviewElement.ts:871-945`), skipping the extension host `postMessage` path. Extension-host-to-webview `postMessage` is subject to serialisation across processes (copy at the process boundary is inferred, not measured) and to the 1.57+ `ArrayBuffer` handling. Only live (visible or `retainContextWhenHidden`) webviews receive messages (`vscode.d.ts`).
- Cost conclusion: parse in the webview (worker) from the streamed bytes for display; keep 3MF metadata and edit log in the extension host; send only small command messages (transform matrices, triangle-id sets, painting strokes) and transferred buffers for big results.
- WebviewView typed-array transfer was a gap (microsoft/vscode#148429, PR); use `createWebviewPanel`/custom editors for the main viewer.

### 6. Recommendation and architecture sketch

Recommendation: three.js (`WebGLRenderer`) + `three-mesh-bvh` + own TypeScript mesh/3MF core; treat `WebGPURenderer` as a feature-detected later upgrade; skip Babylon and raw WebGPU for R1.

```
Extension host (Node)                              Webview (Chromium 150, sandboxed iframe)
- CustomEditorProvider (3MF, STL)                  - three.js scene, WebGLRenderer, OrbitControls/Arcball
- CustomDocument: original bytes + edit log        - Worker pool: STL/3MF parse, vertex dedup, BVH build,
- Undo/redo (CustomDocumentEditEvent)                 later: meshopt LOD proxy, cut/boolean (manifold-3d WASM)
- backup/save/revert via workspace.fs              - TransformControls, ViewHelper, measure, cut plane
- 3MF zip/XML read-write (settings, plates)        - Painting overlay: per-triangle id sets (BVH shapecast)
- Slicer process / printer I/O (other cards)       - Layer slider + G-code InstancedMesh ribbon (shared viewer)
        ^   small JSON commands, ArrayBuffer transfer   ^
        +------------- postMessage -----------------------+
        bytes for display: webview fetch(asWebviewUri) streamed
```

Responsibilities:
- Extension host: truth for document state, history, persistence, 3MF packaging, anything requiring the filesystem or network. Messages are commands (`setTransform(objectId, matrix)`, `paint(objectId, triangleIds, state)`), so undo/redo, dirty state and backup do not require the webview to be alive.
- Webview: rendering, input, interactive tools, optimistic preview of edits; it re-applies the edit log on reload (webview state loss is documented).
- Painting data model: PrusaSlicer/Orca use `TriangleSelector`, a recursive triangle subdivision tree with brush types `BRUSH`, `BUCKET_FILL`, `SMART_FILL`, `HEIGHT_RANGE` and sphere/circle cursors (`PrusaSlicer@30ef591:src/slic3r-domain/include/Slic3r/Domain/TriangleSelector.hpp:11-21`, `PrusaSlicer@30ef591:src/slic3r/GUI/Gizmos/GLGizmoPainterBase.hpp:138-145`), not vertex colours. Interoperating with 3MF painting metadata means reimplementing that structure; three.js gives only vertex colours and the BVH example.
- Interactions required by the slicers' own GL viewers (list only): PrusaSlicer gizmos Move, Scale, Rotate, Flatten, Cut, Hollow, SLA supports, FDM supports, Seam, Fuzzy skin, Multi-material segmentation, Measure, Emboss, SVG, Simplify (`PrusaSlicer@30ef591:src/slic3r/GUI/Gizmos/GLGizmosManager.hpp:74-88`); OrcaSlicer adds MeshBoolean, Assembly, BrimEars, text, alignment (`OrcaSlicer@09aa0114:.../GLGizmosManager.hpp:88-104`). All need object picking, triangle picking, plane drag, and a render of selection/hover state.

## Comparison

See the tables in Findings 1, 3 and 4. Summary of the decision:

| Option | R1 fit | Main risk |
|---|---|---|
| three.js + WebGLRenderer + BVH | Best: loaders, gizmos, instancing exist; custom shaders allowed | no 3MF writer, no STEP, no painting model |
| three.js + WebGPURenderer | later | experimental; no `ShaderMaterial`; WebGPU absent by default on much of Linux |
| Babylon.js | fine for viewing | no 3MF/STEP loader; large package; engine choice made before scene creation (per WebXR note) |
| Raw WebGPU | poor | everything custom; Linux availability |

## Implications for VSSlicer

- Reuse: three.js, `STLLoader`, `TransformControls`, `ViewHelper`, three-mesh-bvh, `occt-import-js` (LGPL-2.1, load as separate WASM asset), `meshoptimizer`, `gcode-preview` (MIT) as the G-code reference.
- Wrap/replace: `3MFLoader` runs on the main thread and does not read Production/Slice extensions or slicer metadata; write our own 3MF reader/writer in the extension host (also needed because three has no 3MF exporter) and hand the webview typed arrays.
- Reimplement: triangle-subdivision painting model, cut caps, measure, overhang visualisation.
- Skip in R1: WebGPU path, Babylon, mesh sculpting.
- Fallback: detect WebGL context failure and tell the user to enable hardware acceleration (not `disable-hardware-acceleration`); offer no software path.
- If our own VSCodium build is used, we control Electron switches (e.g. `enable-unsafe-webgpu`, `enable-unsafe-swiftshader`) and COOP/COEP, which removes the main platform obstacles; with stock VS Code we cannot.
- Lessons from `meshview` and `nightmesh`: validate declared triangle counts, cap model size, parse off-thread, and bundle decoders offline.

## Licence notes

- three.js MIT; three-mesh-bvh MIT; meshoptimizer MIT; gcode-preview (npm) MIT; three-viewport-gizmo MIT; manifold-3d Apache-2.0; Babylon.js Apache-2.0 (all npm registry, 2026-10-25).
- `occt-import-js` is LGPL-2.1 per npm (README states no licence): dynamic WASM use is probably fine but needs review before bundling `(unverified)`. `web-ifc` is MPL-2.0 (not needed).
- PrusaSlicer, OrcaSlicer, BambuStudio are AGPL-3.0: this report read their gizmo lists and painting data structure only; do not port `TriangleSelector` or gizmo code without deciding project licence.
- Viewer extensions: MIT for meshview, nightmesh, mesh-viewer-vscode, vscode-3dviewer, vscode-stl-viewer, gcode-preview; `thingraph.*` proprietary; `kleinicke.ply-visualizer` declares no licence on Open VSX.

## Open questions

1. Does `navigator.gpu.requestAdapter()` succeed inside a webview in VS Code (Electron 43) on Windows, macOS, Linux Intel/AMD/NVIDIA? Needs a 20-line probe extension and a `chrome://gpu`-equivalent dump (`about:gpu` via Developer Tools).
2. Does stock VS Code allow `Worker` from `blob:`/`asWebviewUri` URLs under the recommended CSP, and is `SharedArrayBuffer` really unavailable in a desktop webview?
3. BVH build time and memory for 1, 5, 20 M triangles in Chrome 150 (no published numbers found).
4. Measured copy cost of extension-host-to-webview `ArrayBuffer` transfer versus webview `fetch(asWebviewUri)` for 100-500 MB files.
5. Exact SwiftShader removal point per platform in Chrome 150-based Electron, and whether VS Code adds the switch.
6. Whether Electron mirrors Chrome's Linux WebGPU default rollout (144/147).
7. Which 3MF extensions our painting/support metadata needs (feeds the 3MF card).
