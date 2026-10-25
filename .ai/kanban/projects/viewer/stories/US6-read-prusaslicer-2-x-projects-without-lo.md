---
id: US6
title: "Read PrusaSlicer 2.x projects without loss"
status: reviewed
epic: VSS:E8
---

As a PrusaSlicer user, I want my 2.x project read into the same `Project` structure, so that its objects, volumes and per-object settings open in VSSlicer.

## Acceptance criteria

- [ ] `Slic3r_PE.config` is returned as a raw INI blob; `Slic3r_PE_model.config` objects, volumes and per-object config and the per-layer XML are read
- [ ] Output matches a golden file hand-checked against PrusaSlicer 2.9
- [ ] Ported code names `PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/3mf_legacy.cpp` with notice and `Ported from` line (D2)
- [ ] Verified only on fixtures (D5)

## Out of scope

- Prusa 3.0 JSON reader (US7)
- Config to profile conversion (E12)
