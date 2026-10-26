# Changelog

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
