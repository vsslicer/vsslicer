---
id: US6
title: "Slice from other extensions through one engine-neutral interface"
status: reviewed
epic: VSS:E26
---

As an extension author (and as the other SLC epics), I want one documented `SlicerEngine` interface and a `Slicer.slice(job)` entry point with a fake engine, so that engines, tasks and tests plug in without knowing which engine runs.

## Acceptance criteria

- [ ] `SlicerEngine`, `SliceJob`, the event stream and the typed errors are published from `slicer-api`, documented, with semver-checked exports
- [ ] `Slicer.slice(job)` and `Slicer.capabilities(engine)` are exported from the `vsslicer.slicer` extension for other extensions
- [ ] A fake engine and a shared contract test suite exist; both real adapters pass the same contract suite
- [ ] An engine registry lists the registered adapters and the setting `vsslicer.slicer.engine` picks one

## Out of scope

- Prusa and embedded engines (E65, E66)
