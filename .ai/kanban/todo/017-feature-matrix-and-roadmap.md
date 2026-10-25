---
id: 17
title: Feature matrix and roadmap
type: spike
priority: P0
effort: XL
area: [slicer, platform, projects]
milestone: R1
depends_on: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
created: 2026-10-25
---

Synthesise every R1 report into the cross-slicer feature matrix and the phased implementation roadmap, then run a reviewer pass.

Report: `docs/research/feature-matrix.md` and `.ai/plans/roadmap.md`. Notes: `.reference/notes/VSS-17-feature-matrix-and-roadmap.md`.

## Acceptance criteria

- [ ] `docs/research/feature-matrix.md`: feature × slicer table across PrusaSlicer, SuperSlicer, OrcaSlicer, Bambu Studio, Cura (and notable others), with origin project, and a priority (P0–P3) for VSSlicer with a one-line reason; every row traceable to a feature inventory report
- [ ] `.ai/plans/roadmap.md`: phases ordered testability first (each phase independently testable and usable), then usability, then functionality; each phase lists deliverables, test strategy, dependencies and the research reports it rests on
- [ ] Fork-vs-extension decisions and extension boundaries (which extensions, what each owns, shared APIs between them) stated with reasons from VSS-15
- [ ] Marketplace plan (self-hosted Open VSX vs other) and licence posture from VSS-16 stated
- [ ] Reviewer pass done against `.ai/agents/vsslicer-reviewer.agent.md`; findings fixed or listed as open questions
- [ ] Open questions for the user listed at the end of the roadmap

## Tasks

- [ ] Read all 16 reports
- [ ] Build the matrix
- [ ] Draft the roadmap
- [ ] Reviewer pass and fixes

## Progress

Not started.
