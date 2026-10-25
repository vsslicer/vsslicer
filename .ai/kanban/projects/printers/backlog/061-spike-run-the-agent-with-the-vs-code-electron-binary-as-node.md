---
id: 61
title: "Spike: run the agent with the VS Code Electron binary as Node and load an adapter by path"
type: spike
priority: P1
effort: M
model: opus
area: [daemon]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [PLT-14, PLT-15, 46, 28]
created: 2026-10-25
---

Decide how the agent runs: `ELECTRON_RUN_AS_NODE=1` with `process.execPath` on macOS, Windows and Linux, versus a `node` on PATH or a bundled Node. Shared with the slicer engine child-process spike (SLC) so they agree.

**Code:** `vsslicer/modules/printer-agent/` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] A note records, per OS with the current VS Code, whether a detached child survives window close and reload, how the socket path behaves, and the chosen runtime with the fallback
- [ ] The same spike loads `printer-bambu`'s adapter by absolute path in the child and opens a fake-broker session
- [ ] Multiple installs (Stable, Insiders, VSCodium) get separate socket names

## Tasks

- [ ] Probe extension
- [ ] Run on three OSes
- [ ] Write the note

## Progress

Not started.
