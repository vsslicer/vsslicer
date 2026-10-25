---
id: 16
title: "Activate vsslicer.filament, open the store and export Inventory"
type: feature
priority: P1
effort: M
model: sonnet
area: [ui]
story: US5
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [15, 14, PLT-15]
created: 2026-10-25
---

Activation, the output channel, warnings for store problems and the exported `Inventory`, with the store in `globalStorageUri`.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] An `@vscode/test-electron` test (PLT-15 harness) activates the extension and gets `Inventory` from `exports`; the store directory is under `globalStorageUri`
- [ ] A corrupt line, a missing density and a lock timeout each show a warning and an output-channel entry (injected faults)
- [ ] `extensionKind` is `["ui", "workspace"]` in package.json; the VSIX passes the content assertion
- [ ] Verified on fixtures only; no hardware (D5)

## Tasks

- [ ] Write activate
- [ ] Wire output channel and warnings
- [ ] Integration test

## Progress

Not started.
