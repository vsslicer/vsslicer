---
id: 5
title: Slicing engine architecture and embedding options
type: spike
priority: P0
effort: L
area: [slicer, platform]
milestone: R1
owner: worker-opus
created: 2026-10-25
---

How we could drive a slicing engine from a VS Code extension host: library, CLI, WASM, or service.

Report: `docs/research/slicing-engine-embedding.md`. Notes: `.reference/notes/VSS-5-slicing-engine-embedding.md`.

## Acceptance criteria

- [x] libslic3r as a library and the PrusaSlicer/Orca CLI (`--export-gcode`, `--slice`, config loading) documented: entry points, inputs, outputs, what GUI-only features are unavailable headless
- [x] CuraEngine CLI (`slice -j ... -s ...`), its Arcus socket protocol, the gRPC plugin system (CuraEngine 5.x plugins) and headless operation documented
- [x] WASM builds surveyed: existing attempts for libslic3r, CuraEngine and Kiri:Moto's JS engine; feasibility, size and performance findings
- [x] Options compared for an extension host: spawn a native CLI, native Node module, WASM in a worker, local service (gRPC/HTTP), with platform packaging implications (macOS/Windows/Linux binaries, signing)
- [x] Progress reporting, cancellation and error handling for each option described
- [x] A recommended embedding strategy with licence consequences flagged (AGPL for libslic3r and Orca, LGPL for CuraEngine, MIT for Kiri:Moto, verify each)

## Tasks

- [x] Read `src/PrusaSlicer.cpp` / `CLI`, Orca's CLI, CuraEngine `src/main.cpp` and `src/communication/`
- [x] Web survey for WASM ports and headless slicer services
- [x] Write the report

## Progress

Done. libslic3r and the Prusa/Orca CLIs, CuraEngine CLI/Arcus/gRPC plugins and headless use, WASM survey (cura-wasm, Kiri:Moto), extension-host options compared with packaging, progress/cancellation/errors per option, recommendation with licence consequences. Corrected premise: CuraEngine is AGPL-3.0-or-later, not LGPL, so a bundled engine ships as a separate AGPL extension behind a process boundary or VSSlicer goes AGPL. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: WASM size/speed unmeasured (no code run); macOS quarantine of VSIX-unpacked binaries unconfirmed.
