---
id: 14
title: Project management and fleet tools
type: spike
priority: P1
effort: M
area: [projects, printers]
milestone: R1
owner: worker-sonnet
created: 2026-10-25
---

How slicers model a project and how farm tools manage queues, jobs and history, so we can design the workspace model.

Report: `docs/research/projects-and-fleet.md`. Notes: `.reference/notes/VSS-14-projects-and-fleet.md`.

## Acceptance criteria

- [x] Project models compared: PrusaSlicer (one plate, objects/instances/volumes), Bambu/Orca (plates, objects, per-plate state, project 3MF), Cura (scene, per-model settings, project file); undo/redo and autosave approaches
- [x] Print queue and farm tools analysed: Obico, SimplyPrint, OctoFarm/FDM Monster, Mainsail/Fluidd job queue, Bambu Farm Manager, 3DPrinterOS, Repetier-Server; features, APIs, licences, hosted vs self-hosted
- [x] Job history: what each ecosystem records (Moonraker history API, OctoPrint, Bambu cloud tasks) and what is retrievable
- [x] Mapping of these to a VS Code workspace: folders as projects, files as plates/models, a queue view; what multi-root workspaces give us
- [x] Recommendation on project layout, queue model and history storage

## Tasks

- [x] Read project/plate code in Orca (`PartPlate.cpp`, `Model.cpp`), PrusaSlicer `Model.cpp`, Cura `CuraApplication`/`Scene`
- [x] Survey farm tools' docs and APIs
- [x] Write the report

## Progress

Done. Project models of PrusaSlicer (2.9 and 3.0 multi-bed), Bambu/Orca plates and Cura scene with undo/autosave; farm tools (Obico, SimplyPrint, OctoFarm/FDM Monster, Mainsail/Fluidd job queue, Bambu Farm Manager, 3DPrinterOS, Repetier-Server) with APIs and licences; job history APIs; mapping to VS Code multi-root workspaces; recommendation. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: 3DPrinterOS and Repetier-Server tiers rest on marketing pages; Orca `backup_interval` unit and Uranium undo internals unverified.
