---
id: 26
title: "Spike: RRF lookahead and arc segmentation in the RRF 3.6 source"
type: spike
priority: P1
effort: S
model: opus
area: [planner]
story: US9
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [19]
created: 2026-10-25
---

RRF lookahead depth and arc segmentation are unverified.

## Acceptance criteria

- [x] A note in `.reference/notes/` cites the RRF 3.6 source (repo@commit:path:line) for lookahead and arc segmentation
- [x] The note says whether RRF results may drop the lower-confidence label

## Tasks

- [x] Clone RRF source
- [x] Read lookahead and arcs
- [x] Write the note

## Progress

Done 2026-10-25 (w-rrf). RRF tag 3.6.3 @ aebf629 cloned to `.reference/repos/RepRapFirmware`.
Raw note `.reference/notes/GCP-26-rrf-planner.md`; distilled spec `docs/research/rrf-planner.md`.
Lookahead = DDA ring (40/60 moves, M595), backward/forward pass on each new move; junction =
per-drive |du|*v <= M566 jerk, same speed both sides, start from rest; moves of different type
(printing/travel/E-only) never join under jerk policy 0. Arcs: fixed constants (0.005 mm
deviation, 0.02-1 mm, 200 seg/s), not M669 S/T. Verdict: keep the lower-confidence label
(reasons in the report). RRF is GPL-3.0: GCP-27 writes from the spec, no code ported.
