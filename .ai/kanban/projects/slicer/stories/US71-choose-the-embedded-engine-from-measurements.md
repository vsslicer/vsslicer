---
id: US71
title: "Choose the embedded engine from measurements"
status: reviewed
epic: VSS:E66
---

As the owner, I want the embedded-engine candidates measured on the same fixtures, so that the choice rests on numbers.

## Acceptance criteria

- [ ] Spikes measure time, peak memory, VSIX size, cancel and progress for CuraEngine WASM, a bundled native engine, PrusaSlicer 3.0 WASM (only if Prusa publishes one) and CuraEngine over Arcus, on the I5 fixture set
- [ ] A report in `docs/research/` holds the numbers and a decision record is added on the VSS board
- [ ] The spike checks Electron-as-Node child process from the extension host and macOS signing for the native candidate

## Out of scope

- A `web` build of the engine (PLT)
- Native N-API addons
- Kiri:Moto
