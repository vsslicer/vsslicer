---
id: 70
title: Snapshot the viewer for each dialect
type: chore
priority: P0
effort: M
model: sonnet
area: [viewer]
story: US16
milestone: "VSS:M2"
depends_on: [58, 61, PLT-18, 74]
created: 2026-10-25
---

Playwright snapshots in headless Chromium with software WebGL (CI only) for a fixture from each dialect.

**Code:** `vsslicer/modules/project-extension/test/snapshots/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] Reference images exist for Bambu, Orca, Prusa 2.x, Cura, STL and OBJ and match within a stated tolerance
- [ ] Snapshots regenerate only on the Linux runner

## Tasks

- [ ] Harness wiring
- [ ] Reference images
- [ ] CI job

## Progress

Not started.
