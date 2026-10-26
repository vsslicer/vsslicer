# Changelog

## Unreleased

- VWR-2: module scaffold (`@vsslicer/3mf`, layers `domain`, `application`, `adapters`), with `saxes` 6.0.0 and `fflate` 0.8.3.
- VWR-3: `Package` and `Part` types and the typed `ThreeMfError` classes (domain).
- VWR-4: broken-package fixtures for each error class, and the test zip builder.
- VWR-5: zip reading behind a `ZipArchive` port with a per-entry size cap (ZIP64, data descriptors, raw entry bytes).
- VWR-6: read `[Content_Types].xml` and relationships into the `Package` (OPC adapter).
