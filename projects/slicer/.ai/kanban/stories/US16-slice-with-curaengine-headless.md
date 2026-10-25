---
id: US16
title: "Slice with CuraEngine headless"
status: reviewed
epic: VSS:E28
---

As a user, I want to slice a plate with CuraEngine and the same progress, cancel and error behaviour as Orca, so that engine choice is a setting and not a different workflow.

## Acceptance criteria

- [ ] The headless contract (`-j`/`-e` versus `-r`, defaults, per-extruder settings) is decided by a spike that reads `CommandLine.cpp` at the pinned revision and runs fixtures; the resolved-JSON route is used if confirmed
- [ ] Plates are exported to STL per object by `@vsslicer/mesh` (CuraEngine reads no 3MF); the adapter always uses `-o`
- [ ] Progress comes from the 'Starting <stage>...' lines as coarse stages; cancel kills the process
- [ ] Exit 1, exit 2 and SIGFPE map to typed errors; cancel, bad-model and bad-argument paths each produce a distinct message (stub and real engine tests)
- [ ] `CuraEngine` implements `SlicerEngine` and passes the shared contract suite

## Out of scope

- Arcus transport and live layers (E66)
- gRPC plugins
- WASM build
