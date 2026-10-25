---
id: 17
title: Feature matrix and roadmap
type: spike
priority: P0
effort: XL
area: [slicer, platform, projects]
milestone: R1
owner: worker-opus
depends_on: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
created: 2026-10-25
---

Synthesise every R1 report into the cross-slicer feature matrix and the phased implementation roadmap, then run a reviewer pass.

Report: `docs/research/feature-matrix.md` and `.ai/plans/roadmap.md`. Notes: `.reference/notes/VSS-17-feature-matrix-and-roadmap.md`.

## Acceptance criteria

- [x] `docs/research/feature-matrix.md`: feature × slicer table across PrusaSlicer, SuperSlicer, OrcaSlicer, Bambu Studio, Cura (and notable others), with origin project, and a priority (P0–P3) for VSSlicer with a one-line reason; every row traceable to a feature inventory report
- [x] `.ai/plans/roadmap.md`: phases ordered testability first (each phase independently testable and usable), then usability, then functionality; each phase lists deliverables, test strategy, dependencies and the research reports it rests on
- [x] Fork-vs-extension decisions and extension boundaries (which extensions, what each owns, shared APIs between them) stated with reasons from VSS-15
- [x] Marketplace plan (self-hosted Open VSX vs other) and licence posture from VSS-16 stated
- [x] Reviewer pass done against `.ai/agents/vsslicer-reviewer.agent.md`; findings fixed or listed as open questions
- [x] Open questions for the user listed at the end of the roadmap

## Tasks

- [x] Read all 16 reports
- [x] Build the matrix
- [x] Draft the roadmap
- [x] Reviewer pass and fixes

## Progress

Done. `docs/research/feature-matrix.md`: 16 domain tables (feature × PrusaSlicer, SuperSlicer, Bambu Studio, OrcaSlicer, Cura, notable others) with settings counts per slicer, one Origin per row, P0–P3 priority with reason, and the source report and section on every row; lineage counted once. `.ai/plans/roadmap.md`: 11 phases ordered testability first, each with goal, deliverables, test strategy, dependencies, source reports and licence posture; fork-vs-extension decision and extension boundaries (AGPL engines behind a process boundary, no web build of the engine extension, CuraEngine via CLI, clean-room motion planners), marketplace plan (self-hosted Open VSX) and Apache-2.0 posture with contested points; 36 owner questions. Reviewer pass by a reviewer worker (`.ai/local/reviews/VSS-17.md`): 20 findings, all fixed by the synthesis worker, re-reviewed PASS; one summary-table oracle line fixed by the coordinator. Two report contradictions resolved in the matrix (Orca vendor count 70; engine boundary follows `licensing.md`).
