---
id: E5
title: Ship the vsslicer.gcode preview and simulation editor
status: reviewed
initiative: I1
project: GCP
order: 3
depends_on: [E5, E6, E4]
rows: ["§10 Layer and feature preview", "§10 Standalone viewer for any G-code file", "§10 Time-interpolated toolhead simulation", "§10 50–500 MB files"]
---

The user-facing heart of I1: a custom editor in `vsslicer.gcode` that opens any `*.gcode`,
`*.bgcode` or `*.gcode.3mf` file, from any slicer, without slicing anything, and shows it in 3D
layer by layer and move by move, coloured by feature, speed, width, flow, fan, temperature,
layer time or tool. A timeline scrubs a time-interpolated toolhead through the print using E4's
firmware-aware timing, which no slicer does today. Files up to 500 MB open inside the memory
budget, because the text never becomes a `TextDocument`.

## Scope

In:
- `CustomReadonlyEditorProvider` for the three file types (`supportsMultipleEditorsPerDocument`
  false), parse and plan in the E3/E2 worker, move buffers transferred to the webview as
  `ArrayBuffer`s through E4's transport. `retainContextWhenHidden` on, GPU resources freed on
  dispose; webview state (camera, layer, mode) saved with `setState`.
- Renderer: libvgcode's model **ported** from PrusaSlicer@30ef591 `src/libvgcode/` (AGPL-3.0) to
  WebGL2 GLSL and TypeScript on E4's core: one instanced segment template, per-move
  attributes in data textures, visibility as a contiguous range plus role/travel/tool filters,
  colouring in the shader from per-move scalars and a palette texture (mode switch = uniform
  change). Provenance lines on every ported file.
- Controls: layer range slider, move slider within a layer, feature and travel toggles, colour
  mode and legend, orbit/pan/zoom, top/iso/front views, per-layer time from E4.
- Simulation: a timeline over E4's start times; play, pause, speed multiplier, step; the toolhead
  marker interpolated inside a move from the trapezoid at time t (`trapezoidsFor` window); the
  extruded path drawn up to the toolhead.
- Side panel: thumbnails, object labels (hover highlights the object), summary (filament, weight,
  cost, slicer estimate next to ours), diagnostics list with "go to offset", and a lazily read
  G-code text pane around the current move (lines read from disk by file offset).
- Plate picker for `.gcode.3mf`.
- Failure UI: no WebGL2 context (clear message naming `disable-hardware-acceleration` and
  software rendering), context lost (rebuild from the cached buffers), worker crash or memory cap
  (error panel with retry; the extension host is unaffected).

Out: the G-code language (E6), the public API and live follow (E7), editing G-code from the
preview, WebGPU (D6: WebGL2 only), true nozzle path with input shaping, section planes and
shadows (Orca desktop-only extras), toolpaths export (E51), the `web` build (I10, see notes).

## Feature-matrix rows

- **§10 Layer and feature preview (P0).** Done when every colour mode renders the E3 corpus and
  matches the Playwright snapshots.
- **§10 Standalone viewer for any G-code file (P0).** Done when double-clicking a fixture from
  each of the five slicers opens it in the custom editor with no other extension installed.
- **§10 Time-interpolated toolhead simulation (P0).** Done when the toolhead position at time t
  matches the planner's trapezoid within 0.01 mm in unit tests and the timeline plays the corpus.
- **§10 50–500 MB files (P0).** Done when a 500 MB synthetic file opens through the custom editor
  inside the budget (about 28 bytes per move on the CPU side, under about 1 GB total across host,
  worker, webview and GPU) on a CI runner with a GPU or SwiftShader enabled.

## Acceptance criteria

- [ ] Playwright/Chromium pixel snapshots of each colour mode, layer range and travel toggle on
      corpus files; a shader change that moves pixels beyond tolerance fails the run
- [ ] Interpolation unit tests: accel, cruise and decel phases, zero-length moves, moves shorter
      than the accel distance, arcs (segments from E3), pauses (G4) and tool changes
- [ ] `@vscode/test-electron`: open a file larger than 50 MB through the custom editor; assert it
      is not opened as a `TextDocument` and the host thread is never blocked over 100 ms
- [ ] Memory test at 50, 200 and 500 MB records peak host, worker and webview memory; budget
      regressions fail CI
- [ ] Failure tests: forced WebGL2 failure shows the message; `WEBGL_lose_context` restores the
      view; a killed worker shows the error panel and other extensions keep working
- [ ] Scrubbing the move slider updates only the visibility range (no geometry re-upload),
      asserted by counting buffer uploads
- [ ] The H2C `.gcode.3mf` fixture opens by plate; nothing here needs the printer itself

## Dependencies

- Needs E5 (`ParsedFile`, diagnostics), E6 (`Timing`, `trapezoidsFor`), E4 (WebGL2
  core, data-texture chunking, ArrayBuffer transport, CSP helper), E3 (Playwright, test
  electron, packaging).
- Uses the E4 spike decisions on postMessage throughput and the WebGPU probe.
- Exposes the editor that E51's `open` and `follow` drive (internal API: `PreviewSession` with
  `reveal(position)`, `setPlate`).

## Risks and spikes

- ArrayBuffer transfer cost host to webview for 400 MB of buffers is unmeasured: if the E4
  spike shows it is slow, fall back to `fetch(asWebviewUri)` of a cache file written by the worker.
- Data-texture size limits (`MAX_TEXTURE_SIZE`) per GPU: chunk textures; test on a 16k limit.
- Above about 20M moves the budget fails: spike far-zoom level of detail (merge collinear
  segments, drop out-of-range travels) only if the E3 moves-per-byte spike says it is needed.
- CI without a GPU: Chromium needs `--enable-unsafe-swiftshader` for snapshots; confirm on free
  GitHub runners early.

## Eng review

- Scope: four rows and the largest epic, 5 to 6 sprints. Splitting simulation into its own epic
  was considered; rejected because the timeline, the move slider and the toolhead marker are one
  control and share the visibility range. If it runs past 6 sprints, the side panel's G-code text
  pane and object hover are the first to move to a follow-up story set.
- Boring technology: raw WebGL2 on E4, no three.js; worker_threads; no WebGPU or WASM, so no
  innovation tokens spent.
- Blast radius: the webview and worker are separate from the host; the only host work is
  forwarding buffers. A broken renderer breaks the preview only.
- Reversibility: the editor is registered with `priority: "default"` for `*.bgcode` and
  `*.gcode.3mf`, and `"option"` for `*.gcode` behind a setting until 0.1 is stable, so a user can
  always fall back to the text editor.
- Zero silent failures: every diagnostic from E3 and every flag from E4 (assumed limits,
  estimate, invisible macros) is visible in the side panel.
