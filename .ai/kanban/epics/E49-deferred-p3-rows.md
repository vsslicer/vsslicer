---
id: E49
title: "Deferred P3 rows: Scripting and plugin API, Engine-pipeline plugin hooks"
status: draft
initiative: I10
project: PLT
order: 7
depends_on: []
rows: ["§16 Scripting and plugin API", "§7 Engine-pipeline plugin hooks"]
---

Holds the platform rows of the feature matrix that are P3 and have no delivery plan. Both are about letting third parties extend VSSlicer the way PrusaSlicer 3.0 (Lua), SuperSlicer (AngelScript), Orca (pipeline plugins) and Cura (Python plugins, engine gRPC slots) do. The matrix's reason for both is the same: VS Code extensions are already VSSlicer's plugin model, so a second scripting system adds cost without a demonstrated need.

## Scope

- **In:** nothing until an owner decision reopens a row.
- **Out:** an embedded scripting runtime, a plugin loader, and hooks inside an engine's pipeline.

## Feature-matrix rows

- §16 Scripting and plugin API (P3): waits because any VS Code extension can already call VSSlicer's exported APIs (`GcodePreview`, `ProjectModel`, `ProfileStore`, `PrinterRegistry`, `Slicer`; roadmap "Extension boundaries"), which covers what Cura's Python plugins and Kiri:Moto's modules are used for. Reopen if users ask for scripts that run without writing an extension.
- §7 Engine-pipeline plugin hooks (P3): waits because VSSlicer drives external engines as processes (D2 item 3, I5), so it cannot insert steps inside Orca's or CuraEngine's pipeline without modifying the engine; post-processing scripts (SLC) cover the output side. Reopen when an embedded engine (SLC, I10) exists and a hook is requested, since only an in-process engine makes pipeline hooks possible.

## Acceptance criteria

- [ ] An owner decision reopens a row.

## Dependencies

- None while deferred. A reopened row would depend on the exported APIs of each extension (scripting) or on SLC's embedded-engine epic (pipeline hooks).

## Risks and spikes

- None while deferred.

## Eng review

- Scope challenge: deferring both is the smallest correct plan, since neither row has a user need the extension API does not already meet. Kept as one epic because both rows answer the same question, "a plugin model besides VS Code extensions?".
