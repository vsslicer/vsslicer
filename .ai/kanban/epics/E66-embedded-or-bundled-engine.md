---
id: E66
title: Ship an embedded or bundled engine so slicing works with nothing installed
status: draft
initiative: I10
project: SLC
order: 10
depends_on: [E26, E28, E30, E1]
rows: []
---

A zero-install engine: a user with no OrcaSlicer, Cura or PrusaSlicer installed can still slice. D2 makes this possible (VSSlicer is AGPL-3.0, engines may be bundled, CuraEngine may be driven over Arcus with `Cura.proto` bundled), so the choice between candidates is now an engineering one. This epic starts with a spike that picks the candidate, then ships it behind the same `SlicerEngine` interface. It is for new users and locked-down machines, and later for the `web` target.

## Scope

In:
- Spike first, comparing on the same fixtures (time, peak memory, VSIX size, cancel, progress):
  - CuraEngine upstream Emscripten target (`CMakeLists.txt:340-361` at `47b0388`), single-file ES module, run in a `worker_threads` Worker or a Node child process (Electron run as Node), with `--progress_cb` and `--slice_info_cb` (ENG §3). Uses the CuraEngine settings resolution from E28 unchanged.
  - A bundled native Orca or CuraEngine build in platform-specific VSIXs (ENG §4 option A packaging).
  - PrusaSlicer 3.0's Emscripten target, only if Prusa publishes one.
  - CuraEngine over Arcus (`connect host:port`, extension as TCP server, `protobufjs` with `Cura.proto`), which adds progress and `LayerOptimized` live layers for GCP.
- Build the chosen candidate reproducibly in CI from a pinned engine revision and publish the corresponding source with each release (D2 obligation 4).
- Packaging: the engine lives in `vsslicer.slicer` or a separate `vsslicer.engine-*` extension in the monorepo (D2 removes the separate-repository rule); chosen by VSIX size.

Out: a `web` build of the engine (PLT owns `web` builds; it can follow once the WASM candidate works in a Web Worker), native N-API addons (rejected, ENG §6 item 6), Kiri:Moto (licence headers unresolved).

## Feature-matrix rows

None. The engine's support for §2 rows is recorded as a new capability table (E30).

## Acceptance criteria

- [ ] Spike report in `docs/research/` with measured numbers for each candidate on the I5 fixture set, and a decision record on the VSS board
- [ ] The chosen engine passes the E30 effect tests and the I5 layer-count and estimate checks on its fixtures
- [ ] Cancel: `worker.terminate()` or process kill returns within 2 s; out-of-memory in the engine is reported as an error and never takes down the extension host
- [ ] Every distributed binary or WASM file has its source revision and build recipe published; CI checks the provenance file exists
- [ ] Fixtures only; one H2C print of a fixture sliced by the embedded engine as a sanity check (if the engine has an H2C profile), firmware recorded

## Dependencies

- Needs E26 (interface), E28 (Cura settings resolution, reused by both Cura candidates), E30 (capability table and effect tests), E1 (CI able to build Emscripten or native targets within free runner limits, D5).
- Exposes another `SlicerEngine`; with Arcus, a live layer stream E7 could consume (new API to agree with GCP).

## Risks and spikes

- This spends an innovation token (a WASM engine; the plan-eng-review budget is three for the project). Arcus is a further protocol to own.
- Risk: single-threaded CuraEngine WASM is about 3x slower than native (cura-wasm benchmark, ENG §3); acceptable only as a fallback.
- Risk: a bundled native engine needs macOS signing and notarisation, for which there is no budget (D5); this likely rules out the bundled native candidate on macOS until I11.
- Risk: Electron-as-Node child process from the extension host is unverified (roadmap phase 10).

## Eng review

- Scope challenge: one epic with a decision spike rather than one epic per candidate; only the winner is built. The Arcus adapter is a candidate here, not its own epic, because without a zero-install need it only adds live layers.
- Blast radius: in-process WASM in a worker can still exhaust host memory; the spike must measure it, and a child process is the default if memory is unbounded.
- Reversibility: the embedded engine is a fallback chosen only when no installed engine is found, behind `vsslicer.slicer.embeddedEngine`.
