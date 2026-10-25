---
id: 6
title: 3MF format and project dialects
type: spike
priority: P0
effort: M
area: [3mf]
milestone: R1
created: 2026-10-25
---

The 3MF core spec and its extensions, the slicer project dialects built on it, and the libraries we could read/write it with.

Report: `docs/research/3mf.md`. Notes: `.reference/notes/VSS-6-3mf-format.md`.

## Acceptance criteria

- [ ] 3MF core spec summarised: OPC container, model XML, resources, build items, metadata, thumbnails; versions and conformance
- [ ] Extensions summarised: Production, Materials & Properties, Slice, Beam Lattice, Boolean, Displacement, Secure Content, Volumetric; which slicers write/read which
- [ ] PrusaSlicer project 3MF dialect documented: `Metadata/Slic3r_PE.config`, `Slic3r_PE_model.config`, custom G-code per layer, painted-geometry storage, layer-height profiles, cut info
- [ ] Bambu Studio / OrcaSlicer dialect documented: `Metadata/project_settings.config`, `model_settings.config`, `plate_N.json`, `slice_info.config`, embedded G-code and `.gcode.3mf`, thumbnails, `cut_information`; differences between Bambu and Orca
- [ ] Cura 3MF handling summarised (what it writes in metadata, Cura project `.3mf` with `Cura/` settings)
- [ ] Libraries surveyed: lib3mf (C++ with bindings, licence), JS/TS options (three.js 3MFLoader, any npm packages), Rust/Go options; recommendation for read and write in an extension
- [ ] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [ ] Read `src/libslic3r/Format/3mf.cpp` and `bbs_3mf.cpp`; Cura's `ThreeMFWriter`/`Reader` plugins
- [ ] Read 3mf.io spec pages
- [ ] Survey libraries; write the report

## Progress

Not started.
