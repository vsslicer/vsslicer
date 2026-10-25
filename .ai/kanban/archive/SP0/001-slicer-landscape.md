---
id: 1
title: Slicer landscape and reference clones
type: spike
priority: P0
effort: M
area: [slicer, legal]
milestone: R1
sprint: SP0
owner: worker-sonnet
created: 2026-10-25
---

Map the slicer ecosystem and populate `.reference/repos/` with shallow clones every other card reads.

Report: `docs/research/slicer-landscape.md`. Notes: `.reference/notes/VSS-1-slicer-landscape.md`.

## Acceptance criteria

- [x] Shallow clones exist in `.reference/repos/` for PrusaSlicer, OrcaSlicer, Bambu Studio, Cura, CuraEngine, SuperSlicer, Slic3r, Creality Print, ElegooSlicer, Anycubic Slicer Next, Snapmaker Orca and Kiri:Moto (grid-apps), each with its commit hash recorded
- [x] Lineage tree: who forks whom, since when, and what each fork adds (one paragraph per project)
- [x] Per project: licence (file cited), last release, commit activity in the past 12 months, primary language and GUI toolkit, build system, platforms
- [x] Architecture overview per family: engine library vs GUI split, where settings definitions live, how a slice job flows from model to G-code
- [x] Closed slicers by documentation only: Simplify3D and ideaMaker (and any other notable commercial slicer) with their distinctive features
- [x] A short recommendation on which codebase(s) are the reference for later cards and why

## Tasks

- [x] Clone remaining repos (check what the coordinator already cloned); record hashes
- [x] Read READMEs, LICENSE files, release pages, commit logs
- [x] Sketch each family's source layout (top-level dirs, engine vs GUI)
- [x] Web survey of closed slicers
- [x] Write the report

## Progress

Done. Report `docs/research/slicer-landscape.md`: twelve shallow clones in `.reference/repos/` with hashes, lineage tree, per-project table (licence from LICENSE files, releases, 12-month activity from the GitHub API, toolkit, build, platforms), per-family architecture, closed slicers (Simplify3D, ideaMaker, Lychee, Chitubox) from documentation, and the reference-codebase recommendation. Noted that PrusaSlicer master (30ef591) is 3.0.0-alpha12 with a restructured tree. Reviewed (`.ai/local/reviews/VSS-1.md`): all hashes and licences match; a wrong citation line and three unverified toolkit cells were fixed and re-verified. Open: Simplify3D/ideaMaker licence terms rest on secondary sources; Slic3r Linux support is inferred.
