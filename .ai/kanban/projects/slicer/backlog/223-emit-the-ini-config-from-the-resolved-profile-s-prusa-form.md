---
id: 223
title: "Emit the INI config from the resolved profile's Prusa form"
type: feature
priority: P2
effort: M
model: sonnet
area: [prusa]
story: US66
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [7, 217, PRF-135, PRF-140, PRF-141]
created: 2026-10-25
---

Takes `ProfileStore.resolve(...).native("prusa")` and the job overrides and writes the INI config for `--load`; keys the Prusa form lacks are reported, not dropped.

**Code:** `vsslicer/modules/slicer-prusa/src/domain/...` (module: `slicer-prusa`, layer: `domain`)

## Acceptance criteria

- [ ] Snapshot tests of the emitted INI for the Prusa fixture profile tuples of PRF
- [ ] Custom G-code, `post_process` and `gcode_substitutions` are written as the profile has them (substitutions stay on so the engine applies them)
- [ ] An override of an unknown key is reported, not applied

## Tasks

- [ ] Read native form
- [ ] Overrides
- [ ] Snapshots

## Progress

Not started.
