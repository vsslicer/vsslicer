# Changelog

## Unreleased

- Added: read Bambu and Orca plates (`Project.plates`: names, lock, instances, thumbnails, G-code part, slice time, weight, filaments, warnings, `plate_N.json` layout); `Instance.plateId` set for Bambu and Orca (VWR-23).
- Fixed: readProject parses the root model once instead of two or three times (readModelOnce, shared by dialect detection, readers and the core fallback) (VWR-401).
- VWR-32: 500 MB 3MF generator (test/large/generate.ts) and run.ts gate: opened through readInNodeWorker with host-thread CPU between event-loop turns under 50 ms, counted through the turn after the worker returns, and peak RSS under 1536 MB (test/large/budget.json). Elapsed time is not gated, so the gate cannot see the host blocked while waiting off-CPU (Atomics.wait, sync I/O).
- Fixed: the worker no longer crashes with a stack overflow when a result holds more than about 125,000 items in one array, set or object (painted Bambu/Orca objects) (VWR-400).
- Bambu and Orca projects expose custom G-code per layer (per plate), layer config ranges, layer height profiles and cut information (Project.customGcodes, layerRanges, layerHeightProfiles, cuts) (VWR-24).

## 0.2.0

- VWR-22: Bambu and Orca objects, parts and instances (`readBambuObjects`, `readModelSettings`): `model_settings.config` object and part metadata, part `subtype` (modifiers, negative volumes, enforcers, blockers), per-object config, one instance per build item; `readModel` keeps raw per-triangle attributes (painting) in `CoreObject.triangleAttributes`, carried to `ModelPart.triangleAttributes`. `createBambuReader` now takes only the dialect.
- VWR-31: run `openPackage` and `readProject` in a `worker_threads` or Web Worker (`readInNodeWorker`, `readInWebWorker`): input copied when it is a partial view, results transferred, one worker per file, typed `WorkerReadError` on a crash, out of memory or a failed post.
- VWR-25: read PrusaSlicer 2.x projects (`readPrusa2`, registered as `prusa2` in `readProject`): objects, volumes (parts, modifiers, negative volumes, blockers) and per-object and per-volume config from `Slic3r_PE_model.config`, and `Slic3r_PE.config` as a raw blob.
- VWR-21: `bambu` and `orca` dialect readers (`createBambuReader`, registered in `readProject`): `project_settings.config` and the embedded presets kept byte for byte in `rawConfig`; `Project.printableArea` from `printable_area`.
- VWR-27: `cura` dialect reader (`createCuraReader`, registered in `readProject`): `Cura/*.cfg` containers raw in `rawConfig`, objects from the core model.
- VWR-20: `readProject(pkg)` dispatches on the detected dialect; a disabled, missing or failing dialect reader falls back to core plus preserved parts with `Project.notices`; a core package keeps its non-model parts in `preserved`. `createReadProject(deps)` builds one with dialect readers.
- VWR-398: `detectDialect` matches part names case-insensitively and with a leading `/`.

## 0.1.3

- VWR-13: `detectDialect(metadata, partNames)` names the writer (bambu, orca, prusa2, prusa3, cura, core) from metadata and part names (a `Cura/` part wins over a foreign `Application`; Prusa versions parse like upstream `semver_parse`, patch optional); the `Dialect` value `prusa` is now `prusa2`.

## 0.1.2

- VWR-394: `[Content_Types].xml`, `.rels` parts and the model scan refuse XML nested deeper than 64 (`MAX_XML_DEPTH`).
- VWR-395: tests no longer assert wall time.

## 0.1.1

- VWR-392: `openZip` refuses a package whose declared inflated sizes sum above `maxTotalBytes` (default 1 GiB, `DEFAULT_MAX_TOTAL_BYTES`), before any inflation.
- VWR-390: `resolveProject` refuses component fan-out above 100,000 parts or 10,000,000 triangles (`MalformedXmlError`).
- VWR-391: the real-file tests use committed fixtures (`test/fixtures/real`, with PROVENANCE); only the large OrcaBadge sample still skips without `.reference`.

## 0.1.0

- VWR-73: first release: the container API (`openPackage`, parts, thumbnails, `save`, `replacePart`, `addPart`, `removePart`, raw-copy writer), core model reading (`readModel`, `resolveProject`, `readProject`) and typed errors.

- VWR-2: module scaffold (`@vsslicer/3mf`, layers `domain`, `application`, `adapters`), with `saxes` 6.0.0 and `fflate` 0.8.3.
- VWR-3: `Package` and `Part` types and the typed `ThreeMfError` classes (domain).
- VWR-4: broken-package fixtures for each error class, and the test zip builder.
- VWR-5: zip reading behind a `ZipArchive` port with a per-entry size cap (ZIP64, data descriptors, raw entry bytes).
- VWR-6: read `[Content_Types].xml` and relationships into the `Package` (OPC adapter).
- VWR-8: `writeZip` saves a zip by copying untouched entries raw and deflating replaced or added ones (ZIP64, archive comment kept).
- VWR-7: `openPackage(bytes)` returns parts, thumbnails, with the required-extension and production-part checks.
- VWR-16: `resolveProject`: components, build items, transforms, base materials and colour groups resolved into a `Project`; Production ids are per part.
- VWR-17: `readProject(pkg)` resolves Production sub-models (`p:path` in components and build items); `openPackage` checks every reachable sub-model for missing parts and required extensions, and opens packages requiring Slice, Beam Lattice, Volumetric, Boolean, Displacement or Secure Content read-only with a `readOnly` notice naming them (`DETECTED_EXTENSIONS`).
