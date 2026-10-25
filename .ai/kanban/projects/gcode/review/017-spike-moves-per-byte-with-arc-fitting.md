---
id: 17
title: "Spike: moves per byte with arc fitting"
type: spike
priority: P0
effort: M
model: opus
area: [parser]
story: US6
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [10, 14]
created: 2026-10-25
---

The report leaves moves per byte unknown; the answer decides whether E5 needs far-zoom merging.

## Acceptance criteria

- [x] Moves per byte measured on the corpus with arc fitting on and off
- [x] A note in `.reference/notes/` with numbers and the 28 bytes per move projection to 500 MB
- [x] A decision is proposed on the VSS board: freeze the layout, or add the far-zoom merge to E5

## Tasks

- [x] Measure each corpus file
- [x] Project to 500 MB
- [x] Write the note and propose the decision

## Progress

- 2026-10-25 w-gcp17: measured `@vsslicer/gcode-parser@0.8.5` on all 12 text fixtures, defaults and two
  finer tessellations. Corpus mean 33.4k moves/MB; worst without arcs 39.8k; worst with arcs (Bambu
  cylinder-arcs-on, 5.5 chords per G2/G3) 57.1k. At 500 MB: 16.7M / 19.9M / 28.6M moves; worst =
  800 MB at 28 B (914 MB with the E column). Arc fitting raises moves per byte (x1.58 Bambu, x1.07 Orca).
- Note `.reference/notes/GCP-17-moves-per-byte.md`; research `docs/research/gcode-viewer-simulation.md` §6;
  decision proposed `.ai/kanban/decisions/D17-move-layout-and-far-zoom-merge.md` (freeze 28 B, add the
  far-zoom merge to E5 gated on GCP-18). Open: corpus has no large-radius arcs (unverified upper bound).
