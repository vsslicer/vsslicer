---
id: 42
title: Implement data textures with chunking to MAX_TEXTURE_SIZE
type: feature
priority: P0
effort: L
model: opus
area: [webview-kit]
story: US10
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [41]
created: 2026-10-25
---

Per-move attributes in 2D data textures chunked to `MAX_TEXTURE_SIZE`, following the 28-byte-per-move layout (D6; GCP owns the typed arrays, E19).

## Acceptance criteria

- [ ] Move count above `MAX_TEXTURE_SIZE²` renders identically to a reference made with an artificially small limit
- [ ] Layout documented per attribute (position f32×3, width and height f16, role/tool/flags u8, file offset u32, start time f32)
- [ ] Uploads happen once per chunk, never on view changes

## Tasks

- [ ] Define the layout against `gcode-viewer-simulation.md` §6
- [ ] Implement chunked upload
- [ ] Write the small-limit reference test

## Progress

Not started.
