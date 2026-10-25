---
id: 1
title: Slicer landscape and reference clones
type: spike
priority: P0
effort: M
area: [slicer, legal]
milestone: R1
owner: worker-sonnet
created: 2026-10-25
---

Map the slicer ecosystem and populate `.reference/repos/` with shallow clones every other card reads.

Report: `docs/research/slicer-landscape.md`. Notes: `.reference/notes/VSS-1-slicer-landscape.md`.

## Acceptance criteria

- [ ] Shallow clones exist in `.reference/repos/` for PrusaSlicer, OrcaSlicer, Bambu Studio, Cura, CuraEngine, SuperSlicer, Slic3r, Creality Print, ElegooSlicer, Anycubic Slicer Next, Snapmaker Orca and Kiri:Moto (grid-apps), each with its commit hash recorded
- [ ] Lineage tree: who forks whom, since when, and what each fork adds (one paragraph per project)
- [ ] Per project: licence (file cited), last release, commit activity in the past 12 months, primary language and GUI toolkit, build system, platforms
- [ ] Architecture overview per family: engine library vs GUI split, where settings definitions live, how a slice job flows from model to G-code
- [ ] Closed slicers by documentation only: Simplify3D and ideaMaker (and any other notable commercial slicer) with their distinctive features
- [ ] A short recommendation on which codebase(s) are the reference for later cards and why

## Tasks

- [ ] Clone remaining repos (check what the coordinator already cloned); record hashes
- [ ] Read READMEs, LICENSE files, release pages, commit logs
- [ ] Sketch each family's source layout (top-level dirs, engine vs GUI)
- [ ] Web survey of closed slicers
- [ ] Write the report

## Progress

Not started.
