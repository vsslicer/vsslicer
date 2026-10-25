---
id: 123
title: "Define the Importer, Exporter and ProfileStore read ports"
type: feature
priority: P0
effort: M
model: opus
area: [importers, export]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [122]
created: 2026-10-25
---

The application ports the core defines and the ecosystem adapters implement, living here so adapters see them without depending on the core: `Importer` (formats, import from files or bytes), `Exporter` (formats, export entities with their native form) and the read side of `ProfileStore` (`get`, `list`, `query`, `resolve`).

**Code:** `vsslicer/modules/profile-api/src/application/ports/` (module: `profile-api`, layer: `application`)

## Acceptance criteria

- [ ] `Importer` and `Exporter` declare `formats`, a `canHandle` check and the async import/export methods using `ImportResult` and `Diagnostic`; both are usable with plain bytes so an adapter needs no file system
- [ ] `ProfileStore` read interface declares `get`, `list`, `query`, `resolve(printerInstance, material[], process)`, `compatibleMaterials`, `compatibleProcesses` and `onDidChange`
- [ ] A contract test suite (`runImporterContract(importer)`, `runExporterContract(exporter)`) is exported; an in-repo fake passes it and a fake that throws on bad input fails it
- [ ] No Node or VS Code import in the module (lint)

## Tasks

- [ ] Write the port interfaces
- [ ] Write the contract suites
- [ ] Pass them with fakes

## Progress

Not started.
