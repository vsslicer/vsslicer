---
id: 302
title: Encode paint layers into the Project on save and keep unknown attributes
type: feature
priority: P2
effort: M
model: sonnet
area: [editor, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP30"
depends_on: [300, 301, 108, 296]
created: 2026-10-25
---

On save, painted volumes are encoded to the channel strings in the worker and handed to the writer; unpainted volumes and unknown channels pass through untouched.

**Code:** `vsslicer/modules/project-extension/src/application/paint/save.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] A painted fixture saves and reopens with equal layers; an edited stroke changes only the strings of the triangles it touched
- [ ] Unknown paint attributes are written back as read
- [ ] Saving a project whose paint was not touched copies the original part bytes

## Tasks

- [ ] Encode on save
- [ ] Pass-through
- [ ] Round-trip test

## Progress

Not started.
