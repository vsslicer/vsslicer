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
depends_on: [10, 14]
created: 2026-10-25
---

The report leaves moves per byte unknown; the answer decides whether E5 needs far-zoom merging.

## Acceptance criteria

- [ ] Moves per byte measured on the corpus with arc fitting on and off
- [ ] A note in `.reference/notes/` with numbers and the 28 bytes per move projection to 500 MB
- [ ] A decision is proposed on the VSS board: freeze the layout, or add the far-zoom merge to E5

## Tasks

- [ ] Measure each corpus file
- [ ] Project to 500 MB
- [ ] Write the note and propose the decision

## Progress

Not started.
