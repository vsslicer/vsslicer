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

- [x] `openPackage(bytes)` returns every part with content type and relationships, thumbnails listed
- [x] `requiredextensions` is read; an unsupported one produces the typed error with the extension name
- [x] An unknown part appears in `Package.parts` with raw bytes
- [x] Exported from the package entry point and its signature recorded for E3 and E27 to consume

## Tasks

- [ ] Implement the use case
- [ ] Thumbnail listing
- [ ] Required-extension check
- [ ] Export and document

## Progress

Done. `openPackage(bytes)` (src/openPackage.ts, edge wiring) returns `OpenedPackage` = `Package` + `thumbnails`. The use case is `createOpenPackage(deps)` in src/application/openPackage.ts (application layer takes zip/OPC/scan as ports; the edge file wires fflate + saxes adapters, since application may not import adapters). New adapter src/adapters/opc/modelScan.ts: one SAX pass over the root model for `requiredextensions` (prefix resolved to namespace) and `p:path`. Supported: core, materials, production; others throw UnsupportedRequiredExtensionError(namespace). Missing p:path part throws MissingProductionPartError. Thumbnails = image/png|jpeg parts under Metadata/.
Eager, not lazy: readPackage inflates every part (each capped per entry), and the root model must be parsed anyway. Lazy bytes need a Part change (getter) and readPackage change; deferred to VWR-32 if the 500 MB target needs it. Only the root model is scanned for p:path (nested models checked on load).
Verified: pnpm lint, build, test pass (test/openPackage.test.ts: all 6 broken fixtures give their codes, unknown part bytes, thumbnails, extension check). Not done: signature doc beyond JSDoc and exports.
Files: src/openPackage.ts, src/application/openPackage.ts, src/adapters/opc/modelScan.ts, src/index.ts (exports), test/openPackage.test.ts. No lockfile change, no earlier files changed except index.ts.
Changelog: - VWR-7: `openPackage(bytes)` returns parts, thumbnails, with the required-extension and production-part checks.

Review passed (vwr7-reviewer): lint, build, 44 tests green. Probed openPackage on all 215 .3mf under .reference/repos: 212 open (Bambu, Orca, Prusa, all declare only requiredextensions="p" or none); the 3 refusals are the spec booleans/displacement samples, correctly typed unsupported-required-extension. Supported list (core, materials, production) matches docs/research/3mf.md section 2 (slicers use only production). All 6 broken fixtures give their typed codes. src/openPackage.ts sits outside the lint layers (patterns are src/<layer>/**), so it is unlinted but acts as composition root, acceptable. Root-model-only p:path acceptable (shortcut commented). Added the missing VWR-7 line to CHANGELOG.md. Notes: part-name matching is case-sensitive (OPC names are case-insensitive), minor; UTF-16 models would mis-decode in scanModel, minor.
