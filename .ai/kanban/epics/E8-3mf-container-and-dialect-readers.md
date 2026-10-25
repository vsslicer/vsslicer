---
id: E8
title: Build the @vsslicer/3mf container and dialect readers
status: reviewed
initiative: I2
project: VWR
order: 1
depends_on: [E8]
rows: ["§9 3MF project with own config dialect", "§9 Open other slicers' 3MF", "§9 Lossless round trip of unknown parts"]
---

`@vsslicer/3mf` is the library every later project feature stands on: it opens a 3MF package, resolves its model and Production sub-models, detects which slicer wrote it, reads that slicer's plates, objects and config into typed structures, and saves an untouched package back byte-for-byte. Users get it through the viewer (E10); other projects get it as an API: E27 adds sliced parts to a `.gcode.3mf`, GCP reads embedded plate G-code, E53 imports embedded presets.

## Scope

In:
- OPC container layer, written new in TypeScript on fflate (MIT) and a permissively licensed streaming XML parser chosen in the first story: `[Content_Types].xml`, `_rels/.rels`, part relationships, Production `p:path` resolution, `requiredextensions` handling, thumbnails. Every part the reader does not understand is kept as raw bytes with its content type and relationships.
- Container write path: save an untouched package byte-identically; add, replace and remove named parts without touching the rest (this is the API E27 needs in I5, before the full model writer of E31).
- Core model reader: objects, components, build items, transforms, base materials and colour groups, metadata. Meshes come out as typed arrays (`Float32Array` vertices, `Uint32Array` triangles) ready for `@vsslicer/mesh` (E9).
- Dialect detection mirroring the slicers' own rules (`3mf.md` Implications): `Application` prefix `BambuStudio-`, the `OrcaSlicer` metadata tag, the Prusa projectfile relationship and the 2.99.1 legacy cut-off, the `Cura/` folder.
- Dialect readers: Bambu/Orca first (`project_settings.config` JSON, embedded `*_settings_N.config` presets, `model_settings.config` plates, objects, parts and instances, `slice_info.config`, `plate_N.json`, `custom_gcode_per_layer.xml`, `layer_config_ranges.xml`, `layer_heights_profile.txt`, `cut_information.xml`); Prusa 2.x (`Slic3r_PE.config`, `Slic3r_PE_model.config` and the per-layer XML); Cura workspace (`Cura/*.cfg` read as raw INI containers). Painting attributes are kept as raw strings per triangle for E52.
- Ported code (D2): the Bambu/Orca key tables and plate-metadata parsing follow `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` and `BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0); Prusa 2.x follows `PrusaSlicer@30ef591:src/slic3r-shared/src/Slic3r/Biz/Config/Legacy/3mf_legacy.cpp` (AGPL-3.0). Each ported file keeps the upstream copyright notice and a `Ported from <repo>@<commit>:<path>` line.
- Heavy work (unzip, XML of large sub-models) runs in a `worker_threads` worker in the extension host and in a Web Worker in the webview; the library is isomorphic.

Out: the model writer and dialect writers (E31); turning dialect config into unified profiles (E53 owns that; this epic hands it the raw config blobs); Prusa 3.0 JSON reader (detected and opened as core plus preserved parts until PrusaSlicer 3.0 reaches beta); Slice, Beam Lattice, Volumetric, Boolean, Displacement and Secure Content extensions (detected; file opens read-only with a notice, lib3mf WASM is not shipped).

## Feature-matrix rows

- §9 3MF project with own config dialect (P0): the read side. Done when Bambu, Orca, Prusa 2.x and Cura projects open into one `Project` structure (plates, objects, parts, instances, per-object config, raw project config). The write side is E31.
- §9 Open other slicers' 3MF (P0): done when fixture projects from each of the four writers are detected correctly and read without loss of plates or objects.
- §9 Lossless round trip of unknown parts (P0): done when open then save of an untouched package is byte-identical for every part, relationship and content type, in every dialect.

## Acceptance criteria

- [ ] The 3MF Consortium `test_suites` core and Production cases (BSD-2-Clause) pass: positive cases parse, negative cases fail with the expected error class; lib3mf WASM run in CI agrees on object, triangle and build-item counts.
- [ ] Open-then-save of an untouched package yields identical bytes per part for fixture projects from Bambu Studio, OrcaSlicer, PrusaSlicer 2.9 and Cura (writer versions recorded with each fixture).
- [ ] Replacing or adding one part (the E27 path) leaves every other part byte-identical.
- [ ] Dialect detection is correct on every fixture, including an Orca file carrying a `BambuStudio-` Application string and a Prusa 3.0 alpha file (detected, opened core-only).
- [ ] Plate, object, instance and per-object metadata read from Bambu/Orca fixtures matches a JSON golden file hand-checked against the upstream GUI.
- [ ] Error classes each have a fixture, a typed error and a user-facing message: corrupt zip, missing root model, malformed XML, unsupported required extension, declared size above the cap (zip bomb), Production path to a missing part.
- [ ] Reading a 500 MB fixture never blocks the extension-host thread for more than 50 ms (measured).
- [ ] Verified only on fixtures (D5): no hardware is involved in this epic.

## Dependencies

- Needs E8 (monorepo, CI, fixture storage, lib3mf WASM in CI).
- Exposes `openPackage(bytes|uri)`, `Package.parts`, `Package.replacePart/addPart/removePart`, `Package.save()`, `readProject(pkg) -> Project` with `dialect`, and the `Project` types (plates, objects, parts, instances, raw config) to E36, E37, E31, E27 (`.gcode.3mf` assembly), E10 (embedded `plate_N.gcode` lookup) and E53 (embedded preset JSON, Prusa INI, Cura containers).

## Risks and spikes

- E10 reads `.gcode.3mf` in I1, before this epic. Spike (first story): publish the container layer as the first increment so E10 uses it; otherwise GCP reads the zip with fflate and migrates.
- Byte-identical save depends on reusing the original compressed entries, not recompressing. Spike: confirm fflate exposes raw entry copy, or write the small local-header copier ourselves.
- Prusa 3.0 JSON layout is alpha. Re-check at beta; a story is added then.
- Fixture provenance: fixtures must be our own exports from upstream releases, not downloaded user models, so their licence is clear.

## Eng review

- Scope challenge: reader and container only; the model writer moved to E31 because I2 needs only untouched save and part replacement. Dialect-to-profile conversion stays with E53 to avoid two owners of the settings mapping.
- Tests: conformance suite catches spec regressions; byte-identity catches recompression and part reordering; goldens catch dialect key drift. Oracle named per criterion.
- Blast radius: a parser crash in a worker is caught and shown per file; it cannot take down the extension host. Zip-bomb cap prevents memory exhaustion.
- Reversibility: read-only, so no user data at risk; a bad dialect reader can be disabled per dialect (falls back to core plus preserved parts).
- Zero silent failures: every error class above has a fixture and a message; unknown parts are kept, never dropped.
- Changed because of the review: added the part-replacement API (E27 needs it in I5) and the extension-host blocking budget.

## Coordinator reconciliation

- Ship the container layer first (add, replace, remove parts on an otherwise untouched package) so the GCP parser (`.gcode.3mf`) in I1 and the SLC output epic in I5 can use it before the writer epic exists.
