---
id: 263
title: Build the port-6000 auth packet and parse the framed JPEGs
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, bambu]
story: US43
milestone: "VSS:M4"
depends_on: [262, 246]
created: 2026-10-25
---

The pure protocol of the A1/P1 camera: the 80-byte auth packet (username `bblp`, access code) and the frame parser (16-byte header with payload size, then a JPEG), following ha-bambulab (MIT) and OpenBambuAPI facts, no GFDL prose.

**Code:** `vsslicer/modules/camera-bambu/src/domain/...` (module: `camera-bambu`, layer: `domain`)

## Acceptance criteria

- [ ] If code is ported, the upstream `ha-bambulab@<commit>:<path>` (commit pinned from `.reference`) is named in the file notice with a `Ported from` line (D2); otherwise written from the documented facts
- [ ] Auth packet bytes equal the documented layout (golden test); the parser handles frames split across chunks, and rejects a bad header size or non-JPEG payload
- [ ] Verified on recorded and synthetic frames only: no A1/P1 hardware (D5)

## Tasks

- [ ] Write packet builder and parser
- [ ] Add golden and chunk-split tests

## Progress

Not started.
