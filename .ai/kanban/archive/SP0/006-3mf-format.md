---
id: 6
title: 3MF format and project dialects
type: spike
priority: P0
effort: M
area: [3mf]
milestone: R1
sprint: SP0
owner: worker-opus
created: 2026-10-25
---

The 3MF core spec and its extensions, the slicer project dialects built on it, and the libraries we could read/write it with.

Report: `docs/research/3mf.md`. Notes: `.reference/notes/VSS-6-3mf-format.md`.

## Acceptance criteria

- [x] 3MF core spec summarised: OPC container, model XML, resources, build items, metadata, thumbnails; versions and conformance
- [x] Extensions summarised: Production, Materials & Properties, Slice, Beam Lattice, Boolean, Displacement, Secure Content, Volumetric; which slicers write/read which
- [x] PrusaSlicer project 3MF dialect documented: `Metadata/Slic3r_PE.config`, `Slic3r_PE_model.config`, custom G-code per layer, painted-geometry storage, layer-height profiles, cut info
- [x] Bambu Studio / OrcaSlicer dialect documented: `Metadata/project_settings.config`, `model_settings.config`, `plate_N.json`, `slice_info.config`, embedded G-code and `.gcode.3mf`, thumbnails, `cut_information`; differences between Bambu and Orca
- [x] Cura 3MF handling summarised (what it writes in metadata, Cura project `.3mf` with `Cura/` settings)
- [x] Libraries surveyed: lib3mf (C++ with bindings, licence), JS/TS options (three.js 3MFLoader, any npm packages), Rust/Go options; recommendation for read and write in an extension
- [x] Every claim cites `repo@commit:path:line` or a URL

## Tasks

- [x] Read `src/libslic3r/Format/3mf.cpp` and `bbs_3mf.cpp`; Cura's `ThreeMFWriter`/`Reader` plugins
- [x] Read 3mf.io spec pages
- [x] Survey libraries; write the report

## Progress

Done. Report `docs/research/3mf.md` covers the core spec, all extensions with a slicer support matrix, the PrusaSlicer 2.x `Slic3r_PE*` dialect (from legacy code kept in the 3.0-alpha12 tree, cross-checked against the 2.9.6 sparse clone) and the new 3.0 JSON project format, the Bambu/Orca `Metadata/*` dialect with their differences, Cura's 3MF handling, and a library survey with a recommendation. Ten 3MF spec repos cloned to `.reference/repos/3mf-spec-*`. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-6.md`): all criteria met, 14+ citations spot-checked, no wrong facts. Open: lib3mf WASM TypeScript types unverified.
