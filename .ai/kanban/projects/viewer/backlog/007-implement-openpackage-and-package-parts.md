---
id: 7
title: Implement openPackage and Package.parts
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [6]
created: 2026-10-25
---

The first public increment: `openPackage(bytes)` returns a `Package` with parts, thumbnails and the required-extension check. Published early so GCP and SLC can use it instead of a private zip reader.

**Code:** `vsslicer/modules/3mf/src/application/openPackage.ts` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [ ] `openPackage(bytes)` returns every part with content type and relationships, thumbnails listed
- [ ] `requiredextensions` is read; an unsupported one produces the typed error with the extension name
- [ ] An unknown part appears in `Package.parts` with raw bytes
- [ ] Exported from the package entry point and its signature recorded for E3 and E27 to consume

## Tasks

- [ ] Implement the use case
- [ ] Thumbnail listing
- [ ] Required-extension check
- [ ] Export and document

## Progress

Not started.
