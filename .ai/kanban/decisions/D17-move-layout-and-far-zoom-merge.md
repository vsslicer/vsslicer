---
id: D17
title: "Freeze the 28-byte move record; add the far-zoom merge to E5, gated on GCP-18"
status: proposed
date: 2026-10-25
cards: [GCP-17, GCP-18]
---

## Context

E3 says the moves-per-byte spike decides between freezing the move layout and adding the
far-zoom merge to E5 (`epics/E3-gcode-streaming-parser.md:96-97`). E5's budget breaks above
about 20M moves (`epics/E5-preview-simulation-editor.md:90`). GCP-17 measured
`@vsslicer/gcode-parser@0.8.5` on the golden corpus (`.reference/notes/GCP-17-moves-per-byte.md`,
summary in `docs/research/gcode-viewer-simulation.md` §6):

- Without arcs, a 500 MB file holds 16.7M moves on average and 19.9M at worst.
- With arc fitting at the default tessellation (0.05 mm, 15°), it holds up to 28.6M moves:
  800 MB of move records at 28 B, or 914 MB with the extrusion column.
- A finer tessellation gives 46M to 57M moves.

## Decision (proposed)

**Recommended default:**

- Freeze `MOVE_STRIDE = 28`. The size of a record does not depend on how many moves there are.
- Add the far-zoom merge to E5 as a P1 story: merge collinear segments, arc chords included, and
  drop travels out of range. Plan it only if GCP-18's 500 MB arc-heavy run goes over the RSS
  budget.
- Keep the parser defaults `arcTolerance` 0.05 and `arcMaxAngle` 15.

## Alternatives

- **Freeze the layout and skip the merge.** This works for files without arcs. Arc-fitted round
  prints of 500 MB would go over the 20M-move budget.
- **Shrink the record** (f16 positions relative to each layer, for example). That saves memory
  for every file, but it changes the gcode-api contract that GCP has already published.
- **Tessellate more coarsely in the preview.** This gives fewer moves, but the preview would no
  longer match what the planner simulates.

## What changes if the owner picks differently

If the merge is dropped, E5 loses that story and the 500 MB arc-heavy case is documented as
unsupported. If the record is shrunk, gcode-api needs a minor release, and the parser and E5
consumers need updating.
