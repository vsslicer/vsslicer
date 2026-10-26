---
id: 348
title: Define the layer-height profile and its saved text form
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [38]
created: 2026-10-25
---

A profile is a list of (z, height) samples with the object height, the printer's minimum and maximum layer height and the first layer height. Reads and writes the `layer_heights_profile.txt` text form (`z;height;z;height...`).

**Code:** `vsslicer/modules/mesh/src/domain/layerheight/profile.ts` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] The fixtures' saved profiles parse and print back to the same text
- [ ] Validation rejects non-increasing z, a height outside the printer limits and a profile that stops short of the object height, each with its own error
- [ ] No I/O in the folder (lint)

## Tasks

- [ ] Types
- [ ] Text form
- [ ] Validation

## Progress

Not started.
