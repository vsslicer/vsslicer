---
id: 244
title: "Spike: CuraEngine Emscripten build in a worker and in a Node child process"
type: spike
priority: P2
effort: L
model: opus
area: [embedded]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [243, 1, 64]
created: 2026-10-25
---

Builds the upstream CuraEngine Emscripten target (`CMakeLists.txt:340-361` at `47b0388`) as a single-file ES module and runs it in a `worker_threads` Worker and as a Node child process (Electron run as Node), with `--progress_cb` and `--slice_info_cb`, on the I5 fixtures with the settings resolved by `cura-settings`.

**Code:** `vsslicer/modules/slicer-embedded/` (module: `slicer-embedded`, layer: n/a (spike))

## Acceptance criteria

- [ ] Measured per fixture and mode: wall time, peak memory, size of the module, cancel latency, progress granularity; numbers in the spike notes
- [ ] A child process run from an Electron-as-Node extension host is tried (roadmap phase 10 unverified item) and the result recorded
- [ ] Out-of-memory behaviour with an oversized fixture is recorded for both modes

## Tasks

- [ ] Build the target
- [ ] Run in Worker and child
- [ ] Measure
- [ ] Write notes

## Progress

Not started.
