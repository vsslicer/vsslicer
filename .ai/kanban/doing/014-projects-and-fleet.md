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

- [ ] Project models compared: PrusaSlicer (one plate, objects/instances/volumes), Bambu/Orca (plates, objects, per-plate state, project 3MF), Cura (scene, per-model settings, project file); undo/redo and autosave approaches
- [ ] Print queue and farm tools analysed: Obico, SimplyPrint, OctoFarm/FDM Monster, Mainsail/Fluidd job queue, Bambu Farm Manager, 3DPrinterOS, Repetier-Server; features, APIs, licences, hosted vs self-hosted
- [ ] Job history: what each ecosystem records (Moonraker history API, OctoPrint, Bambu cloud tasks) and what is retrievable
- [ ] Mapping of these to a VS Code workspace: folders as projects, files as plates/models, a queue view; what multi-root workspaces give us
- [ ] Recommendation on project layout, queue model and history storage

## Tasks

- [ ] Read project/plate code in Orca (`PartPlate.cpp`, `Model.cpp`), PrusaSlicer `Model.cpp`, Cura `CuraApplication`/`Scene`
- [ ] Survey farm tools' docs and APIs
- [ ] Write the report

## Progress

Not started.
