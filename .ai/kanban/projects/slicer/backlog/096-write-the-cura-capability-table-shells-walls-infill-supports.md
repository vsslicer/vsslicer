---
id: 96
title: "Write the Cura capability table: shells, walls, infill, supports and adhesion"
type: feature
priority: P1
effort: L
model: opus
area: [cura, engine]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [92, 82]
created: 2026-10-25
---

Maps the unified (Orca-named) keys of the geometry groups to Cura keys and value maps, or marks them unsupported. The mapping between Orca and Cura names is a judgement; each entry records its reasoning so reviews can challenge it.

**Code:** `vsslicer/modules/slicer-cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] Every key of these groups in PRF's catalogue has a reviewed entry
- [ ] `renamed` entries include value maps for enums (for example `cross_3d`, `cubicsubdiv`, `lightning`) and are applied when resolving the Cura stack for a unified profile
- [ ] Arc fitting is `unsupported` with a note

## Tasks

- [ ] Skeleton from catalogue
- [ ] Map the groups
- [ ] Reviews notes

## Progress

Not started.
