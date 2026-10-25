# 3MF format and project dialects

Researched 2026-10-25 for card VSS-6. The report covers the 3MF core spec and its extensions, the project dialects that PrusaSlicer, Bambu Studio, OrcaSlicer and Cura build on it, and the libraries that could read and write it from a VS Code extension.

**Code analysed.** Shallow clones under `.reference/repos/`:

| Repo | Commit | Version | Licence |
|---|---|---|---|
| PrusaSlicer | 30ef591 (2026-09-21) | `3.0.0-alpha12` (`PrusaSlicer@30ef591:version.inc:6`) | AGPL-3.0 |
| BambuStudio | 79df7ae | `02.08.04.57` (`BambuStudio@79df7ae:version.inc:16`) | AGPL-3.0 |
| OrcaSlicer | 09aa0114 | `SoftFever_VERSION 2.5.0-dev`, `SLIC3R_VERSION 02.08.01.55` (`OrcaSlicer@09aa0114:version.inc:10,17`) | AGPL-3.0 |
| Cura | 5bea2f8 (2026-10-09) | — | LGPL-3.0 (`Cura@5bea2f8:LICENSE:1`) |
| libSavitar (read on GitHub) | main c513049 (2026-07-20) | — | LGPL-3.0 (`gh api repos/Ultimaker/libSavitar`) |
| 3MF spec repos `3mf-spec-<name>` | see the Findings table | — | BSD-2-Clause |

**Abbreviations used in citations:**
- **PS** = `PrusaSlicer@30ef591:src/slic3r-shared/`
- **B** = `BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp`, and **Bh** is the matching `.hpp`
- **O** = `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp`, and **Oh** is the matching `.hpp`
- **CW** = `Cura@5bea2f8:plugins/3MFWriter/`, **CR** = `Cura@5bea2f8:plugins/3MFReader/`
- **core.md** = `3mf-spec-core@997b385:3MF Core Specification.md`

**PrusaSlicer layout change.** At this revision `src/libslic3r/Format/3mf.cpp` no longer exists. PrusaSlicer 3.0 has split the 3MF code across:
- `PS/src/Slic3r/Biz/Format/3mf.cpp`
- `PS/src/Slic3r/Biz/Format/3mf/*.cpp`
- `PS/src/Slic3r/Biz/Config/Legacy/3mf_legacy.cpp`, which holds the 2.x format

**Who did what.** The Bambu/Orca code reading and the web survey of libraries were each delegated to a sub-agent and spot-checked afterwards. The checked lines are listed in the notes file `.reference/notes/VSS-6-3mf-format.md`.

## Findings

### 1. Core spec: OPC container, model XML, resources, build, metadata, thumbnails, versions, conformance

**Versions.** The Core spec is at 1.4.0, Published, 2025-02-06.
- History: 1.0 (2015-04-29); 1.2 added MustPreserve, metadata groups and overlapping order; 1.3.0 (2021-10-07) added triangle sets and mirror; 1.4.0 removed the deprecated mirror (`3mf-spec-core@997b385:3MF Core Specification.md:62-73`).
- 3mf.io calls 1.3.0 "the ISO-aligned version" and names the standard ISO/IEC 25422:2025 (https://3mf.io/spec/).

**Container.** A 3MF file is a ZIP that follows the Open Packaging Conventions (OPC):
- Entries are Deflate or stored. Consumers MUST support ZIP64 and streaming. Producers SHOULD write plain ZIP when the data fits (`core.md:150-156`).
- `[Content_Types].xml` maps extensions to content types. The model part is `application/vnd.ms-package.3dmanufacturing-3dmodel+xml` (`core.md:1362-1368`).
- `_rels/.rels` carries the StartPart relationship `http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel`, which points to the root model. By convention the root model is `/3D/3dmodel.model`.

**Parts and relationships.** Table 2-1 lists them (`core.md:166-200`):
- one required 3D Model part;
- optional Core Properties, Digital Signature, PrintTicket, Package and Object Thumbnail (JPEG/PNG, always referenced through the thumbnail relationship), 3D Texture, and custom parts.

**Preservation rules.**
- **MustPreserve relationship:** custom OPC parts SHOULD be kept by editing consumers only if a MustPreserve relationship references them. Otherwise consumers SHOULD NOT keep them (`core.md:228-246`).
- **No slicer uses it:** none of PrusaSlicer, Bambu Studio, OrcaSlicer or Cura marks its `Metadata/` parts with MustPreserve. `rg -il mustpreserve` over their 3MF code finds nothing. So a strictly conformant editor would drop slicer project data. An editor that wants to round-trip these files has to keep unknown parts on purpose.

**Model XML.**
- `<model unit= xml:lang= requiredextensions= recommendedextensions=>` contains `<metadata>*`, `<resources>` and `<build>` (`core.md:400-424`).
- Units: micron, millimeter (the default), centimeter, inch, foot, meter.
- Elements must be defined before they are referenced. This keeps a forward-only parser possible (`core.md:404`).
- A consumer MUST NOT process a model that requires extensions it lacks (`core.md:413`, `core.md:316-326`).

**Resources.**
- `<object id type name partnumber thumbnail pid pindex>`, where type is one of model, solidsupport, support, surface, other (`core.md:543-548`).
- An object contains either a `<mesh>` (`<vertices><vertex x y z>`, `<triangles><triangle v1 v2 v3 pid p1 p2 p3>`, plus optional `t:trianglesets` in the 2021/07 namespace) or `<components><component objectid transform>` (`core.md:565-770`).
- `<basematerials>` with `<base name displaycolor>` is in core (`core.md:775-820`).

**Build.**
- `<build><item objectid transform partnumber>` (`core.md:489-509`).
- Transforms are 3x4 affine matrices written as 12 numbers (`core.md:387-398`).

**Metadata.**
- `<metadata name preserve type>`.
- Well-known names: Title, Designer, Description, Copyright, LicenseTerms, Rating, CreationDate, ModificationDate, Application.
- Any other name MUST carry a declared namespace prefix, and names must not repeat (`core.md:426-470`).
- Bambu Studio writes non-prefixed names such as `Origin`, `DesignerUserId` and `ProfileTitle` (B:7368-7418). Orca writes a non-prefixed `OrcaSlicer` (O:7311-7312). Strictly read, both are non-conformant.

**Conformance.**
- Consumers MUST NOT error on conforming files. Producers MUST NOT create or introduce non-conformance (`core.md:120-134`).
- The Consortium publishes `test_suites` (BSD-2, v2.4.1 of 2026-04-29). It has suites for Core 1.4.0, Production, Materials, Slice, Beam Lattice, Secure Content, Boolean and Displacement, with no Volumetric suite (https://github.com/3MFConsortium/test_suites).

### 2. Extensions, and which slicers use them

Namespaces and versions below come from each spec repo's header (`3mf-spec-<name>@<commit>:<file>.md`, lines 1-20 and the namespace declarations). 3mf.io lists slightly older numbers in some places: Production 1.1.2, Secure Content 1.0.2, Boolean 1.1.0, Volumetric 0.8.0 (https://3mf.io/spec/).

| Extension | Version (repo commit) | Namespace | What it adds |
|---|---|---|---|
| Production | 1.2 (e7b7a5a) | `.../production/2015/06` (+ `alternatives/2021/04`) | Objects in separate model parts via `p:path`; `p:UUID` on build, items, objects and components |
| Materials & Properties | 1.2.1 (d4d42dd) | `.../material/2015/02` | colorgroup, texture2d/texture2dgroup, compositematerials, multiproperties, PBR display properties |
| Slice | 1.0.2 (16f3635) | `.../slice/2015/07` | 2D slice stacks (polygons per Z) beside or instead of meshes, optionally in separate parts |
| Beam Lattice | 1.2.0 (563c864) | `.../beamlattice/2017/02` (+ `balls/2020/07`) | Beams with circular cross-section between mesh vertices |
| Boolean Operations | 1.1.1 (7b70e6e) | `http://schemas.3mf.io/3dmanufacturing/booleanoperations/2023/07` | union, difference and intersection of mesh objects on a base object |
| Displacement | 1.0.0 (0e2d3fc) | `http://schemas.3mf.io/3dmanufacturing/displacement/2023/10` | Displacement-map textures on meshes |
| Secure Content | 1.0.3 (0d5d53f) | `.../securecontent/2019/04` + keystore relationship `.../2019/04/keystore` | Encrypted OPC parts; key management left to the ecosystem |
| Volumetric (+ Implicit) | 1.0.0 in repo (7596852) | `http://schemas.3mf.io/3dmanufacturing/volumetric/2022/01`, `.../implicit/2023/12` | Level-set geometry and spatially varying properties; a level-set user MUST mark it required |
| Toolpath | 1.0 Release Candidate (fe99fe2); 3mf.io lists 1.0.0 of 2026-09-17 | `http://schemas.3mf.io/3dmanufacturing/toolpath/2026/03` | Per-layer motion and exposure (laser-focused; deposition planned) |

Where no full URI is given, the prefix is `http://schemas.microsoft.com/3dmanufacturing`. Extension intros: Production `3MF Production Extension.md:74-80`; Slice `:75-80`; Beam Lattice `:69-75`; Boolean `:79-85`; Displacement `:81-87`; Secure Content `:65-70`; Volumetric `:105-110`; Toolpath `:144-150`.

**Which slicers read and write which.** Derived from `rg` for the namespace URIs and the element names in each slicer's 3MF code.

| Extension | PrusaSlicer 3.0-alpha | Bambu Studio | OrcaSlicer | Cura (Savitar) |
|---|---|---|---|---|
| Core basematerials | R (PS/src/Slic3r/Biz/Format/3mf/Model3mf.cpp:94) | — | — | — |
| Triangle sets (core 1.3) | R (Model3mf.hpp:138) | — | — | — |
| Mirroring (1.3, removed in 1.4) | R (Model3mf.hpp:150) | — | — | — |
| Production | R, and W as an option that defaults to off (PS/include/Slic3r/Biz/Format/3mf.hpp:32-34; Model3mf.cpp:1942) | R/W; normal saves split the model (B:7314-7316; `BambuStudio@79df7ae:src/slic3r/GUI/Plater.cpp:20550`) | R/W (O:7198) | — |
| Materials | — | R `m:colorgroup` into paint colours, only for non-Bambu files (B:198-199, B:4180-4206) | R `m:colorgroup` (O:258) | R/W `m:texture2d`, `m:texture2dgroup` (libSavitar `src/TextureData.cpp:17-68`; CW/ThreeMFWriter.py:160-178) |
| Secure Content | — | enum flag only, no implementation (Bh:168,178) | same | — |
| Slice, Beam Lattice, Boolean, Displacement, Volumetric, Toolpath | — | — | — | — |

*Legend: R = read, W = write, — = no reference found.*

- **Library support:** lib3mf supports every extension (section 6). three.js reads Materials (partial) and Beam Lattice.
- **Toolpath and Slice:** no FDM slicer uses either. All of them carry G-code as an opaque custom part instead.

### 3. PrusaSlicer project dialect

PrusaSlicer 3.0 writes a new format and reads 2.x files through a separate legacy loader. Released 2.x versions write the `Slic3r_PE*` layout the card names.

**Format switch.**
- The new reader sees the `Application` metadata. If it starts with `PrusaSlicer-` and the version is ≤ 2.99.1, it stops the XML parse and raises `legacy_loader_required` (PS/src/Slic3r/Biz/Format/3mf/Model3mf.cpp:150, 916-950; PS/src/Slic3r/Biz/Format/3mf.cpp:671-672).
- The file is then handed to `load_3mf_legacy` (PS/src/Slic3r/Biz/FileLoadingLogic.cpp:595).
- `store_3mf_legacy` is only called from tests (PS/test/Slic3r/Biz/Config/ConfigLegacyTests.cpp:408,442). So 3.0 no longer writes 2.x files, apart from the MMU dual-write below.

**3.x layout** (`store_3mf`, PS/src/Slic3r/Biz/Format/3mf.cpp:783-847):
- `_rels/.rels` has the StartPart and thumbnail relationships, plus a new relationship `http://schemas.prusa3d.cz/package/2024/relationships/metadata/projectfile` (PS/src/Slic3r/Biz/Format/3mf/Relations.cpp:21-25).
- `[Content_Types].xml` lists rels, model, png and json; svg is added when present; the gcode entry is commented out (3mf.cpp:78-104).
- `Metadata/thumbnail.png` (3mf.cpp:62).
- `3D/3dmodel.model`. Namespaces: core, plus `p:` with `requiredextensions="p"` when Production is on, plus `slic3rpe` (`http://schemas.slic3r.org/3mf/2017/06`) when dual-writing (Model3mf.cpp:78-81, 1658, 1969-1979). With Production on, meshes go to `3D/Objects/mesh_*` (Model3mf.cpp:1677).
- `Metadata/PrusaSlicer3_project.json` (PS/include/Slic3r/Biz/Format/ProjectFileConstants.hpp:7-13):
  - Top-level keys: `project` (`id`, `version`), `objects`, `config_containers`, `virtual_extruders` (PS/src/Slic3r/Biz/Format/3mf/PrusaFile.cpp:1603, 1700-1745).
  - Each `objects[]` entry has `id`, `object_uuid`, `volumes[]`, `instances[]`, `object_settings`, `layerHeightProfile`, `ranges[]` (`zRange`, `configuration`), `cutId`, `slaSupportPoints`, `slaDrainHoles` (PrusaFile.cpp:1399-1408, 1269-1270).
  - Each `volumes[]` entry has `id`, `object_uuid`, `type`, `volume_settings`, `textConfiguration`, `shape`, `source` and `cutInfo` (PrusaFile.cpp:1036-1043).
  - Each `instances[]` entry has `ord`, `item_uuid` and `printable` (PrusaFile.cpp:1335-1337).
  - `config_containers[]` holds a preset and its config, plus `beds[]` with `position_x/y`, `wipe_tower{x,y,rotation_angle}`, and `custom_gcode{mode, gcodes[{gcode{type, extruder, print_z, …}}]}`. These are per-bed custom G-code entries: colour change, pause, custom (PrusaFile.cpp:1720-1780).
- `Metadata/Slic3r_facets_annotation.json` holds the painted geometry (PrusaFile.cpp:641-764):
  - Per volume there are four facet sets: `mmSegmentationFacets`, `supportedFacets`, `seamFacets` and `fuzzySkinFacets`, each with a `*Version` key.
  - Each painted triangle is stored as `{triangle: <index>, dividing: <TriangleSelector string>}`.
  - Version 2 allows up to 255 states. The writer uses the lowest version the data needs (PrusaFile.cpp:665-677).
- **Dual write:** when painting fits version 1 and Production is off, MMU painting is also written as inline `slic3rpe:mmu_segmentation` triangle attributes, so 2.x readers still see it (Model3mf.cpp:1931-1940).
- **Cut info** is in the object/volume JSON: `cutId`/`checkSum`/`connectorsCnt`, connector `type` (plug, dowel or snap), `rTolerance`, `hTolerance` (PrusaFile.cpp:979-1009).
- **Other inputs:** it also reads Materialise build tickets, `3D/Metadata/BuildTicket.mbt` from NX (3mf.cpp:65). Bambu, Orca and other non-Prusa 3MFs load as geometry only, with the dialog "The 3MF file does not contain PrusaSlicer configuration" (`PrusaSlicer@30ef591:doc/3mf-import-matrix.md:24,39`).

**2.x layout** (legacy, PS/src/Slic3r/Biz/Config/Legacy/3mf_legacy.cpp). File names are at :123-137. Model namespace is core plus `xmlns:slic3rpe` (:3442).

| File | Format | Content |
|---|---|---|
| `Metadata/Slic3r_PE.config` | `; key = value` lines after a `; generated by` header; adds `; wipe_tower_x/_y/_rotation_angle` | Full print, filament and printer config (:4063-4090) |
| `Metadata/Slic3r_PE_model.config` | XML `<config><object id instances_count><metadata type="object" key value/><volume firstid lastid><metadata type="volume" key value/>…` | Per-object and per-volume settings. Volumes share one mesh per object and are split by triangle-index ranges; keys include `name`, `volume_type`, `matrix`, `source_*` and the mesh stats (:156-205, :4101-4175) |
| `Metadata/Slic3r_PE_layer_heights_profile.txt` | `object_id=N\|z;h;z;h…` lines | Variable layer height (:3867-3895) |
| `Metadata/Prusa_Slicer_layer_config_ranges.xml` | `objects/object@id/range@min_z,max_z/option@opt_key` | Height-range modifiers (:3907-3940) |
| `Metadata/Prusa_Slicer_custom_gcode_per_print_z.xml` | `custom_gcodes_per_print_z@bed_idx/code@print_z,type,extruder,color,extra,gcode` | Per-layer colour change, pause and custom G-code (:4238-4285) |
| `Metadata/Prusa_Slicer_cut_information.xml` | `objects/object@id/cut_id@id,check_sum,connectors_cnt` + `connectors/connector@volume_id,type,r_tolerance,h_tolerance` | Cut info (:3804-3850) |
| `Metadata/Prusa_Slicer_wipe_tower_information.xml` | XML | Wipe tower position per bed (:136, :4374) |
| `Metadata/Slic3r_PE_sla_support_points.txt`, `Slic3r_PE_sla_drain_holes.txt` | text | SLA data (:133-134) |
| `Metadata/Prusa_Slicer_full_spectrum.json` | JSON | Virtual extruders (PS/include/Slic3r/Biz/Format/VirtualExtruder.hpp:13) |
| Paint attributes on `<triangle>` | `slic3rpe:custom_supports`, `slic3rpe:custom_seam`, `slic3rpe:mmu_segmentation`, `slic3rpe:fuzzy_skin` (hex TriangleSelector strings) | Painted geometry (:176-179) |
| `slic3rpe:text`, `slic3rpe:shape` | elements in the model config | Emboss text and SVG (:210, :234) |

### 4. Bambu Studio and OrcaSlicer dialect

Bambu Studio forked PrusaSlicer's 3MF code into a new `bbs_3mf.cpp`. OrcaSlicer inherits it. The PrusaSlicer file names are commented out there (B:168-169, 182-183). Prusa files go through the separate `3mf.cpp` loader (`BambuStudio@79df7ae:src/libslic3r/Format/3mf.cpp:72-79, 286-339`).

**Archive contents (Bambu Studio):**

| Path | Format | Content |
|---|---|---|
| `[Content_Types].xml` | OPC | rels, model and png, plus `gcode` = `text/x.gcode` (B:161, 7062-7071) |
| `_rels/.rels` | OPC | rel-1 points to the model and rel-2 to the thumbnail. rel-4 and rel-5 are `http://schemas.bambulab.com/package/2021/cover-thumbnail-middle` and `-small` (B:7192-7234) |
| `3D/3dmodel.model` | core + `xmlns:BambuStudio="http://schemas.bambulab.com/package/2021"` + `p:` with `requiredextensions="p"` | Root model with build items. In split mode each object is `<components><component p:path="/3D/Objects/object_N.model" p:UUID transform>` (B:7314-7316, 7637-7670, 7946-7963) |
| `3D/_rels/3dmodel.model.rels`, `3D/Objects/object_<id>.model` | OPC / 3MF | Sub-model parts (B:154, 7470-7473, 7574) |
| `Metadata/project_settings.config` | **JSON** despite the `.config` name | Full project config, written by `save_to_json(…"project_settings"…)` (B:171, 8211-8218) |
| `Metadata/process_settings_N.config`, `filament_settings_N.config`, `machine_settings_N.config` | JSON | Embedded presets (B:186-189, 8222-8238) |
| `Metadata/model_settings.config` | XML `<config>` | `<object id>` holds `<metadata key value>` entries (name, extruder and other per-object settings). Its `<part id subtype>` children carry `name`, `matrix`, `source_*`, per-volume config and `<mesh_stat>`. `<plate>` carries `plater_id`, `plater_name`, `locked`, `bed_type`, `print_sequence`, `spiral_mode`, `filament_maps`, `gcode_file`, `thumbnail_file`, `thumbnail_no_light_file`, `top_file`, `pick_file`, `pattern_bbox_file` and `<model_instance object_id instance_id identify_id>`. `<assemble><assemble_item object_id instance_id transform offset>` (B:247-389, 8334-8691) |
| `Metadata/_rels/model_settings.config.rels` | OPC | Points to each `plate_N.gcode` with type `http://schemas.bambulab.com/package/2021/gcode`; only written with G-code (B:173, 8638-8639) |
| `Metadata/slice_info.config` | XML | `<header>` with `X-BBL-Client-Type`=slicer and `X-BBL-Client-Version`. Per `<plate>`: index, printer_model_id, nozzle_diameters, prediction (s), weight, `<filament id tray_info_idx type color used_m used_g>`, `<object identify_id name skipped>`, `<warning>`, `<layer_filament_lists>`, `<pause_list>` (B:8774-9014) |
| `Metadata/plate_N.gcode` + `.gcode.md5` | text | Per-plate G-code, with an upper-case hex MD5 (Bh:25, B:6905-6941, 9026-9072) |
| `Metadata/plate_N.png`, `plate_N_small.png` (128 px), `plate_no_light_N.png`, `top_N.png`, `pick_N.png` | PNG | Plate thumbnails, top view, and the object-ID picking render (Bh:26-29, B:6666-6745, 7136) |
| `Metadata/plate_N.json` | JSON | `filament_ids`, `filament_colors`, `is_seq_print`, `first_extruder`, `nozzle_diameter`, `bed_type`, `bbox_objects[{id,bbox,area,layer_height,name}]` (Bh:31, B:7170-7178; `BambuStudio@79df7ae:src/libslic3r/GCode/ThumbnailData.hpp:57-101`) |
| `Metadata/layer_heights_profile.txt` | `object_id=N\|…` | as in Prusa 2.x (B:179, 7982-7991) |
| `Metadata/layer_config_ranges.xml` | XML | as in Prusa 2.x (B:180, 8009-8033) |
| `Metadata/custom_gcode_per_layer.xml` | XML `custom_gcodes_per_layer/plate/plate_info@id`, `layer@top_z,type,extruder,color,extra,gcode`, `mode@value` | Per-plate, per-layer G-code (B:184, 9095-9122) |
| `Metadata/cut_information.xml` | XML | Prusa 2.x shape, plus connector `radius` and `height` (B:190, 8706-8733) |
| `Metadata/brim_ear_points.txt` | text | Brim ears (B:181, 8075-8089) |
| `Metadata/filament_sequence.json` | JSON `{"plate_N":{"sequence":[…]}}` | Filament order (B:175, 9209-9230) |
| `Metadata/assembly_*.json` | JSON | Assembly view (Bambu Studio only; B:176-178) |
| `Auxiliaries/**` | any | User attachments; `.thumbnails/thumbnail_3mf.png` and the middle/small images are the cover thumbnails (B:165-167, 185, 9147-9197) |
| `3D/*.svg` | SVG | Emboss shapes (B:2606-2607) |

**Model metadata** (B:7368-7418):
- Title, Designer, DesignerUserId, DesignerCover, Description, Copyright, License, ProfileTitle/Cover/Description.
- `CreationDate` and `ModificationDate`.
- MakerLab keys.
- `Application = BambuStudio-<SLIC3R_VERSION>` and `BambuStudio:3mfVersion = 1`.

The reader marks a file as Bambu's own (`m_is_bbl_3mf`) only when `Application` starts with `BambuStudio-` (B:4325-4331).

**Painted geometry.**
- Paint is stored as attributes on `<triangle>`: `paint_supports`, `paint_seam`, `paint_color` (multi-material) and `paint_fuzzy_skin`, plus the Bambu-only `face_property` (B:316-321, read at 4174-4179, written at 7864-7905).
- These are the same TriangleSelector strings as Prusa's `slic3rpe:*` attributes, under different names. bbs_3mf has no aliases for the Prusa names.

**Sliced files (`.gcode.3mf`).**
- Export uses `SplitModel|WithGcode|SkipModel` (`BambuStudio@79df7ae:src/slic3r/GUI/Plater.cpp:23303`).
- SkipModel drops the object meshes, plate instances and assemble data (B:7511, 7543, 8343, 8594, 8641).
- Still written: `plate_N.gcode` and its `.md5`, `model_settings.config` and its `.rels`, thumbnails, `slice_info.config`, `plate_N.json` and `filament_sequence.json` (B:6905-6975).
- The printer protocol for this file is out of scope here.

**Encryption.** Neither project implements it. There is only a `SecureContentExt` enum flag (Bh:168, 178).

**OrcaSlicer differences:**

| Area | Bambu Studio | OrcaSlicer |
|---|---|---|
| `Application` | `BambuStudio-02.08.04.57` | Also `BambuStudio-` + SLIC3R_VERSION (02.08.01.55), plus a non-prefixed `<metadata name="OrcaSlicer">2.5.0-dev` (O:7276, 7311-7312) |
| slice_info header | X-BBL-Client-* | Adds an `OrcaSlicer-Version` item (O:8729) |
| Dates and user | Written | `CreationDate`, `ModificationDate` and `DesignerUserId` left empty for privacy (O:7244, 7256-7258) |
| Emboss | `BambuStudioShape`, `text_info` | `slic3rpe:shape`, `slic3rpe:text` (the Prusa format); legacy `text_info` still read (O:450, 474, 5055-5070) |
| Extra files | assembly_*.json | `Metadata/orca_cad.bin` (also reads `SnapOrca_cad.bin`), `Metadata/texture_displacement/<id>_<slot>.png` + `.json`, `Metadata/plate_N.statistics.json` (O:236-239, 2046-2059, 8281-8292, 9067-9070; Oh:35) |
| Paint | 4 `paint_*` attributes + `face_property` | Same 4, plus `paint_texture_0`…`_7` (O:355-363) |
| Object/part keys | `face_count`, MakerLab keys, AMS/pause lists | `auto_drop`, `precise_seam_type`, `imex_parallel_mode`, `imex_head_filament_map` (O:353, 381-386, 428) |
| Mesh object type | `other` for parts that are not model parts | Always `model` (B:7777 vs O:7671-7676) |
| Save modes | — | `MinimalPublished` and `WithStatistics`. A "published" file drops slicer identity and gets `orca_published*` keys (Oh:179-199, O:7264-7283) |
| Detection | `is_bbl_3mf` when `Application` starts `BambuStudio-` | `is_bbl_3mf` also for `OrcaSlicer-` or when the `OrcaSlicer` tag is present; the tag sets `is_orca_3mf`, giving From_Orca (O:1540-1551, 4171-4187; `OrcaSlicer@09aa0114:src/libslic3r/Model.cpp:550-554`) |
| Third-party config | Ignored when `Application` is missing (B:2039-2050) | That check is disabled (O:1978-1989) |

Because of the `BambuStudio-` Application string, Bambu Studio loads an Orca project as one of its own. It most likely ignores the Orca-only parts, since their names do not appear in its code (unverified at runtime).

### 5. Cura 3MF handling

**Plain 3MF (ThreeMFWriter).**
- **Libraries:** XML is written through pySavitar, Ultimaker's LGPL-3 C++ library (CW/ThreeMFWriter.py:34, 376); the ZIP itself is written with Python `zipfile` (:259).
- **Namespaces:** core plus `cura` = `http://software.ultimaker.com/xml/cura/3mf/2015/10` (CW/ThreeMFWriter.py:66-70; libSavitar `src/Namespace.cpp:12-16`).
- **Per-object settings:**
  - Changed per-object settings, or a selected subset, are written as `cura:<setting_key>`, together with `cura:print_order` and `cura:drop_to_buildplate` (CW/ThreeMFWriter.py:183-207).
  - Savitar serialises them as `<object><metadatagroup><metadata name="cura:infill_sparse_density">value</metadata>` (libSavitar `src/Scene.cpp:118-135`).
  - The old non-conformant `<settings><setting key>` form is still read (libSavitar `src/SceneNode.cpp:90-100`).
- **Model metadata:** scene metadata is copied. `Application` is kept if it is already set, otherwise Cura's name is written; `CreationDate` and `ModificationDate` are set (:317-330).
- **Coordinates:** Cura swaps Y and Z and moves the origin from the bed centre to the corner by machine_width/2 and machine_depth/2 (:332-348). The reader converts units to mm (CR/ThreeMFReader.py:344-369).
- **Thumbnail:** `Metadata/thumbnail.png` with the thumbnail relationship; a Cura logo is stamped on it (CW/Cura3mfVariant.py:87-107; ThreeMFWriter.py:294-300).
- **Textures:** paint textures go to `3D/Textures/<id>.png` with relationship type `…/2013/01/3dtexture`, written as Materials `m:texture2d`/`m:texture2dgroup` (ThreeMFWriter.py:58-61, 160-178; libSavitar `src/TextureData.cpp:53-68`).
- **Package list:** `Cura/packages.json` lists the material and plugin packages used (:59, 311-313).

**Project 3MF (ThreeMFWorkspaceWriter)** adds a `Cura/` folder of INI-style container files (CW/ThreeMFWorkspaceWriter.py):
- `Cura/<container id>.<suffix>` for the global stack and every container in it, then each extruder stack and its containers (:67-79, 171).
  - Suffixes: `global.cfg` (`Cura@5bea2f8:cura/Settings/GlobalStack.py:367`), `extruder.cfg` (`cura/Settings/ExtruderStack.py:198`), `xml.fdm_material` (`plugins/XmlMaterialProfile/__init__.py:35`).
  - Instance containers (quality, user, variant and definition_changes) use Uranium's `inst.cfg` (unverified: defined in Uranium, not in this repo).
- `Cura/preferences.cfg` holds `general/visible_settings`, `cura/active_mode`, `cura/categories_expanded` and `metadata/setting_version` (:96-106).
- `Cura/version.ini` has a `[versions]` section with `cura_version`, `build_type` and `is_debug_mode` (:109-118).
- `<plugin_id>/plugin_metadata.json` (:140-151).

**Universal Cura Project (UCP).**
- It has the same extension, `.3mf`, with MIME type `application/x-ucp`, and adds `Cura/user-settings.json` (CW/__init__.py:20-50; ThreeMFWorkspaceWriter.py:27, 82-85).
- The reader recognises UCP by that file, and needs `Cura/preferences.cfg` to treat a file as a project at all (CR/ThreeMFWorkspaceReader.py:219-225, 560-572).

### 6. Libraries

The facts in this section come from the delegated web survey. It used the GitHub API, the npm registry and downloads API, crates.io, PyPI and jsDelivr, all checked 2026-10-25.

| Library | Language | Licence | Latest | R/W | Extension coverage | Notes |
|---|---|---|---|---|---|---|
| lib3mf (https://github.com/3MFConsortium/lib3mf) | C++ | BSD-2-Clause | v2.5.0, 2026-02-24 | R/W | Materials, Production, Beam Lattice (+balls), Triangle Sets, Slice, Secure Content, Volumetric/Implicit; Boolean and Displacement on develop (2.6) (https://raw.githubusercontent.com/3MFConsortium/lib3mf/develop/Include/Model/Classes/NMR_ModelConstants.h) | Bindings for C, C++, C#, Go, Java 8/9, NodeJS, Pascal, Python and WASM (https://github.com/3MFConsortium/lib3mf/tree/master/Autogenerated/Bindings). The Node binding is a node-gyp addon on the raw V8 API, not N-API, that loads the shared library at runtime; it is not on npm (https://github.com/3MFConsortium/lib3mf/blob/master/Autogenerated/Bindings/NodeJS/lib3mf_nodeaddon.cc) |
| `@3mfconsortium/lib3mf` (WASM) (https://www.npmjs.com/package/@3mfconsortium/lib3mf) | WASM + JS | BSD-2-Clause | 2.5.0-fix.2 (2026-02-25); 2.6.0-alpha.2 (2026-07-14) | R/W | Same as lib3mf | About 2.4 MB, ESM and CJS, async init, Emscripten `CWrapper` with manual frees; about 91 downloads a week; TypeScript types unverified (https://github.com/3MFConsortium/lib3mf_wasm) |
| three.js `3MFLoader` (https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/3MFLoader.js) | JS | MIT | r186 (2026-09-24) | R | Core, base materials, colour groups, textures, Beam Lattice; implicit parsed only; no Production `p:path` | Needs DOMParser and fflate, so it runs in the webview |
| `@babylonjs/serializers` 3MF (https://cdn.jsdelivr.net/npm/@babylonjs/serializers@9.32.0/3MF/3mfSerializer.d.ts) | TS | Apache-2.0 | 9.32.0 | W | meshes, instances, material split | Tied to Babylon |
| manifold-3d (https://www.npmjs.com/package/manifold-3d) | WASM + JS | Apache-2.0 | 3.5.4 (2026-09-25) | R/W | Mesh and build items, through glTF-Transform (https://cdn.jsdelivr.net/npm/manifold-3d@3.5.4/lib/import-3mf.js) | Uses fast-xml-parser, fflate and `@jscadui/3mf-export` |
| `@jscadui/3mf-export` | JS | MIT | 0.5.0 (2023) | W | core mesh, components, thumbnail | Dependency-free string builder; you supply the zip |
| `@jscad/3mf-serializer` / `-deserializer` | JS | MIT | 2.1.17 / 3.0.0-alpha.0 | W / R | core, colours | The deserializer README says full documents are not supported |
| `three-3mf-exporter` (https://www.npmjs.com/package/three-3mf-exporter) | JS | MIT | 45.2.1 | W | Multi-material, "Bambu Studio compatible" | Uses jszip and fast-xml-parser |
| fast-3mf-loader (https://github.com/Innovgame/fast-3mf-loader) | TS | MIT | 0.0.8 | R | core, Production paths, colours, textures | Early stage; browser only |
| `threemf` (Rust) (https://crates.io/crates/threemf) | Rust | 0BSD | 0.8.1 | R/W | Core mesh ("functionality is limited") | |
| `threemf2` (https://github.com/vshashi01/threemf2) | Rust | MIT or Apache-2.0 | 0.4.1 | R/W | Core 1.3, triangle sets, Production, Beam Lattice, Boolean, Slice, Materials, Displacement | |
| `lib3mf` crate (https://crates.io/crates/lib3mf) | Rust | MIT | 0.1.7 | R/W | Materials, Production, Slice, Secure Content (test keys only) | Not the Consortium library; its README says it is mostly AI-generated |
| go3mf (https://github.com/hpinc/go3mf) | Go | BSD-2-Clause | v0.24.2 (2023-02-10) | R/W | Core, Production, Slice, Beam Lattice, Materials; passes unknown extensions through | Stale since 2023 |
| trimesh (https://github.com/mikedh/trimesh/blob/main/trimesh/exchange/threemf.py) | Python | MIT | 5.2.0 | R/W | mesh, components, `p:UUID` | |

npm returns 404 for the bare names `3mf`, `threemf`, `3mf-parser` and `lib3mf` (https://registry.npmjs.org/-/v1/search?text=3mf&size=40).

None of these libraries know any slicer dialect. Every slicer-specific part (`Metadata/*.config`, `*.json`, G-code) is a custom OPC part to them. lib3mf exposes such parts as "attachments" (unverified for the WASM API surface). The JS options expose nothing beyond what you read from the zip yourself.

**Recommendation for a VS Code extension:**
- **Container layer, read and write:** own a thin TypeScript layer on fflate (MIT) for the zip and a streaming XML parser (fast-xml-parser or saxes) for the model. It should:
  - read `[Content_Types].xml`, `_rels/.rels` and `3D/_rels/*.rels`;
  - resolve Production `p:path`;
  - keep every unknown part byte-for-byte on save.

  This is the only way to round-trip Bambu, Orca, Prusa and Cura projects, because none of them uses MustPreserve. It runs in both the extension host and the webview, including on vscode.dev.
- **Dialect parsers:** build small typed adapters on top of that layer. Bambu/Orca `project_settings.config` is JSON. Prusa 3.x is `PrusaSlicer3_project.json`. Prusa 2.x `Slic3r_PE.config` is `; key = value`. Cura uses INI files under `Cura/`.
- **Full spec coverage:** load `@3mfconsortium/lib3mf` (WASM, BSD-2) lazily when a file declares extensions the TS layer does not handle (Slice, Beam Lattice, Volumetric, Boolean, Displacement, Secure Content), and for validation. Avoid the native Node addon, which needs a rebuild for every Electron ABI and does not work in the webview.
- **Viewer:** three.js `3MFLoader` is fine for a first preview in the webview. Adding Production `p:path` support is a small patch, or the TS container layer can feed resolved meshes to three.js directly.
- **Conformance tests:** use `3MFConsortium/test_suites` (BSD-2) as fixtures, plus sample projects from each slicer.

## Comparison

| Aspect | PrusaSlicer 2.x | PrusaSlicer 3.0-alpha | Bambu Studio | OrcaSlicer | Cura |
|---|---|---|---|---|---|
| Project config | `Metadata/Slic3r_PE.config` (`; k = v`) | `Metadata/PrusaSlicer3_project.json` `config_containers` | `Metadata/project_settings.config` (JSON) + embedded preset JSONs | as Bambu | `Cura/*.global.cfg`, `*.extruder.cfg`, `*.inst.cfg` (INI) |
| Per-object settings | `Slic3r_PE_model.config` XML | project JSON `objects[]` | `model_settings.config` XML | as Bambu + Orca keys | `cura:` metadata in `<metadatagroup>` |
| Plates / beds | one bed (wipe tower in config) | `config_containers[].beds[]` | `<plate>` in model_settings + `plate_N.*` files | as Bambu | single build plate |
| Painted geometry | `slic3rpe:*` triangle attributes | `Slic3r_facets_annotation.json` (+ MMU dual-write) | `paint_*` triangle attributes | `paint_*` + `paint_texture_*` | textures (`3D/Textures`) |
| Variable layer height | `Slic3r_PE_layer_heights_profile.txt` | `layerHeightProfile` in JSON | `layer_heights_profile.txt` | as Bambu | — |
| Custom G-code per layer | `Prusa_Slicer_custom_gcode_per_print_z.xml` | `beds[].custom_gcode` | `custom_gcode_per_layer.xml` (per plate) | as Bambu | — |
| Cut info | `Prusa_Slicer_cut_information.xml` | `cutId`/`cutInfo` in JSON | `cut_information.xml` | as Bambu | — |
| Embedded G-code | no | no | `Metadata/plate_N.gcode` (+ md5), `.gcode.3mf` | as Bambu | no (UFP is separate) |
| Thumbnails | `Metadata/thumbnail.png` | same | `plate_N.png`, `_small`, `no_light`, `top_N`, `pick_N`, cover thumbnails via `Auxiliaries/.thumbnails` | as Bambu | `Metadata/thumbnail.png` |
| Production ext | read | optional write, off by default | write (split model) | write | — |
| Identity | `Application=PrusaSlicer-2.x` | `PrusaSlicer-3.x` + projectfile relationship | `Application=BambuStudio-…`, `BambuStudio:3mfVersion` | `BambuStudio-…` + `OrcaSlicer` tag | `cura` namespace, `Cura/version.ini` |

## Implications for VSSlicer

- **Container layer:** build our own small TypeScript 3MF container and model layer that preserves unknown parts. It should not drop parts that lack MustPreserve, because every slicer dialect depends on them (section 1). This layer is our own code, so no licence is inherited.
- **Dialect detection:**
  - Detect the dialect from `Application`, the `OrcaSlicer` tag, the Prusa projectfile relationship, and whether `Cura/` exists.
  - Mirror the slicers' own rules: Prusa ≤ 2.99.1 is legacy (PS/.../Model3mf.cpp:150). Bambu checks the `BambuStudio-` prefix (B:4325). Orca checks its tag (O:4171-4187).
- **Read support first:** Bambu/Orca (`project_settings.config` JSON, `model_settings.config`, plates, `slice_info`) and Prusa 2.x. Prusa 3.0 is still alpha and its JSON layout may change.
- **Writing:** emit core plus Production with our own `Metadata/` namespace, and add a MustPreserve relationship for our parts. Never claim another vendor's `Application`; Orca does this, which breaks detection.
- **Sliced G-code inside the 3MF:** follow the Bambu `.gcode.3mf` layout (plate G-code, md5, `slice_info`, `plate_N.json`, thumbnails). Bambu printers expect that layout; the protocol itself is covered by its own card.
- **Libraries:** lib3mf WASM as an optional heavy path. three.js `3MFLoader` for the first viewer. Do not reuse slicer code (AGPL).

## Licence notes

- **AGPL-3.0:** PrusaSlicer, Bambu Studio and OrcaSlicer. We documented their file formats from the code, and file formats are not copyrightable code. Copying `bbs_3mf.cpp` or `3mf.cpp` logic verbatim would bring in AGPL, so reimplement from this description instead.
- **LGPL-3.0:** Cura and libSavitar. Reading the format is fine. Linking Savitar would bring LGPL obligations, and it is C++, so it is not relevant to us.
- **BSD-2-Clause:** the 3MF specs, test_suites, lib3mf and the lib3mf WASM package, so they are safe to bundle, with attribution.
- **Permissive JS options:** three.js (MIT), fflate (MIT), fast-xml-parser (MIT), Babylon (Apache-2.0), manifold-3d (Apache-2.0).

## Open questions

- Prusa 3.0's JSON layout is alpha (3.0.0-alpha12), so its stability is unknown. We should check again at beta and look at a real file.
- Whether `@3mfconsortium/lib3mf` ships TypeScript types, and whether its API exposes attachments, so that we can access custom parts (unverified).
- Whether Bambu printers accept `.gcode.3mf` files produced without `slice_info.config` or `plate_N.json`. This needs a hardware test and belongs to the printer-protocol card.
- Toolpath extension 1.0 (2026): will any FDM slicer adopt it in place of embedded G-code? None does at the analysed commits.
- The PrusaSlicer 2.x version still in wide use. This report used the 2.x legacy code as preserved in the 3.0 tree. Released 2.9.x code was not cloned, so small differences are possible.
