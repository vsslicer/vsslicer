---
id: 5
title: Slicing engine architecture and embedding options
type: spike
priority: P0
effort: L
area: [slicer, platform]
milestone: R1
created: 2026-10-25
---

How we could drive a slicing engine from a VS Code extension host: library, CLI, WASM, or service.

Report: `docs/research/slicing-engine-embedding.md`. Notes: `.reference/notes/VSS-5-slicing-engine-embedding.md`.

## Acceptance criteria

- [ ] libslic3r as a library and the PrusaSlicer/Orca CLI (`--export-gcode`, `--slice`, config loading) documented: entry points, inputs, outputs, what GUI-only features are unavailable headless
- [ ] CuraEngine CLI (`slice -j ... -s ...`), its Arcus socket protocol, the gRPC plugin system (CuraEngine 5.x plugins) and headless operation documented
- [ ] WASM builds surveyed: existing attempts for libslic3r, CuraEngine and Kiri:Moto's JS engine; feasibility, size and performance findings
- [ ] Options compared for an extension host: spawn a native CLI, native Node module, WASM in a worker, local service (gRPC/HTTP), with platform packaging implications (macOS/Windows/Linux binaries, signing)
- [ ] Progress reporting, cancellation and error handling for each option described
- [ ] A recommended embedding strategy with licence consequences flagged (AGPL for libslic3r and Orca, LGPL for CuraEngine, MIT for Kiri:Moto, verify each)

## Tasks

- [ ] Read `src/PrusaSlicer.cpp` / `CLI`, Orca's CLI, CuraEngine `src/main.cpp` and `src/communication/`
- [ ] Web survey for WASM ports and headless slicer services
- [ ] Write the report

## Progress

Not started.
