---
id: 77
title: "Spike: do Orca, Bambu Studio and the Orca CLI still load a project whose Application is VSSlicer-x"
type: spike
priority: P1
effort: M
model: opus
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [9, 10, SLC-30]
created: 2026-10-25
---

Detection in Bambu Studio and Orca relies on `Application` starting `BambuStudio-` (`3mf.md` section 4). This spike finds out whether a VSSlicer-written file keeps its plates and settings in each tool, before the writer fixes the rule.

**Code:** `vsslicer/modules/core/3mf/docs/application-string-spike.md` (module: `3mf`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] A table records, for `BambuStudio-x`, `OrcaSlicer-x` and `VSSlicer-x`, whether the Orca GUI, Bambu Studio GUI and the pinned Orca CLI load plates, objects and settings of a Bambu fixture (versions recorded)
- [ ] The check in `bbs_3mf.cpp` that reads `Application` is quoted with `repo@commit:path`
- [ ] A recommendation is written: keep `VSSlicer-`, or ask the owner to choose between interop and the never-claim-another-vendor rule; the card lists the owner question if either GUI refuses the file
- [ ] Verified in the GUIs by hand and the CLI on a fixture; no printer

## Tasks

- [ ] Rewrite `Application` in copies of the Bambu and Orca fixtures with `replacePart`
- [ ] Open each copy in each tool and in the CLI
- [ ] Write the table and recommendation

## Progress

Not started.
