---
id: 309
title: "Add the Timelapses view: list with thumbnails"
type: feature
priority: P2
effort: M
model: sonnet
area: [camera]
story: US48
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [308, 295, 284, 288]
created: 2026-10-25
---

A Timelapses view per printer: name, date, size, state (rendered or not) and a thumbnail where the provider has one (Moonraker, OctoPrint), else an icon; a render action for unrendered sets.

**Code:** `vsslicer/modules/camera-extension/src/presentation/...` (module: `camera-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] View lists entries from Moonraker and OctoPrint recordings and from the Bambu fixture; refresh and empty state work
- [ ] Render action shown only for unrendered sets and only where the provider supports it

## Tasks

- [ ] Add the tree view
- [ ] Add thumbnails and render action
- [ ] Write extension tests

## Progress

Not started.
