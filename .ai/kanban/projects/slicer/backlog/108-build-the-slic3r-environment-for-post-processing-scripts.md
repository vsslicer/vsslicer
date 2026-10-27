---
id: 108
title: Build the `SLIC3R_*` environment for post-processing scripts
type: feature
priority: P1
effort: M
model: sonnet
area: [postprocess]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP25"
depends_on: [100]
created: 2026-10-25
---

Pure function from the resolved config to the environment Orca gives scripts: `SLIC3R_PP_OUTPUT_NAME`, `SLIC3R_PP_HOST` and every config key as `SLIC3R_<KEY>`, following the key-name transformation Orca uses (`features-bambustudio-orcaslicer.md` section 6).

**Code:** `vsslicer/modules/apps/slicer/src/domain/...` (module: `slicer-extension`, layer: `domain`)

## Acceptance criteria

- [ ] Output equals the recorded environment of the pinned Orca for the fixture preset (set and values)
- [ ] Vector and multi-line values are encoded as Orca encodes them
- [ ] Documented difference to Prusa 3.0's stubbed export

## Tasks

- [ ] Key-name rule
- [ ] Value encoding
- [ ] Compare with the recording

## Progress

Not started.
