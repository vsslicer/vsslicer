---
id: 123
title: "Define the Importer, Exporter and ProfileStore read ports"
type: feature
priority: P0
effort: M
model: opus
area: [importers, export]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-123
depends_on: [122]
created: 2026-10-25
---

The application ports the core defines and the ecosystem adapters implement, living here so adapters see them without depending on the core: `Importer` (formats, import from files or bytes), `Exporter` (formats, export entities with their native form) and the read side of `ProfileStore` (`get`, `list`, `query`, `resolve`).

**Code:** `vsslicer/modules/profile-api/src/application/ports/` (module: `profile-api`, layer: `application`)

## Acceptance criteria

- [x] `Importer` and `Exporter` declare `formats`, a `canHandle` check and the async import/export methods using `ImportResult` and `Diagnostic`; both are usable with plain bytes so an adapter needs no file system
- [x] `ProfileStore` read interface declares `get`, `list`, `query`, `resolve(printerInstance, material[], process)`, `compatibleMaterials`, `compatibleProcesses` and `onDidChange`
- [x] A contract test suite (`runImporterContract(importer)`, `runExporterContract(exporter)`) is exported; an in-repo fake passes it and a fake that throws on bad input fails it
- [x] No Node or VS Code import in the module (lint)

## Tasks

- [x] Write the port interfaces
- [x] Write the contract suites
- [x] Pass them with fakes

## Progress

Done: ports in `src/application/ports/`: `Importer {formats, canHandle(file), import(files[]) -> ImportResult}` and `Exporter {formats, canHandle(entity), export({entities, native}) -> {files, diagnostics}}` over `SourceFile {path, bytes: Uint8Array}` (no file system); `ProfileFormat` reuses `Vendor.source.format`. `ProfileStore` read side: `get(kind, id)`, `list(kind)`, `query(kind, {vendor?, external_id?})`, `resolve(printerInstanceId, materialIds[], processId) -> {unified, native: Partial<Record<ProfileFormat, {printer, materials[], process}>>}`, `compatibleMaterials(id)`, `compatibleProcesses(id)`, `onDidChange(listener) -> {dispose()}`; all async and serialisable so PRF-59 can proxy it from a worker. Contract suites `runImporterContract(importer, samples?)` / `runExporterContract(exporter, sample?)` are framework-free and reject listing every violation: hostile inputs (empty, invalid UTF-8, truncated JSON, broken INI, self-inherit, empty path) must resolve, never reject or throw synchronously; diagnostics well-formed (severity, file, message, line >= 1); native keys name returned entities; no silent empty result; canHandle never throws. Added a `src/**` lint rule banning `vscode`, Node builtins and `node:*`.
Files: `src/application/ports/{importer,exporter,profile-store,contract,index}.ts`, `test/ports.test.ts`, `test/layers.test.ts` (one test added), `eslint.config.mjs` (module lint config; the rule needed for criterion 4).
Verified: `pnpm lint` pass; `pnpm test` 19 files / 360 tests pass (fake importer/exporter pass the suites; throwing, sync-throwing, silently-dropping and malformed-diagnostic fakes fail with the expected messages; type tests pin formats, byte I/O, the store's exact method set, `get`/`list`/`query` return types, `resolve` parameters, `EntityKind == keyof entitySchemas`; `node:fs`, `fs` and `vscode` imports in src fail the lint); `pnpm build` pass.
Not done / notes: `resolve` returns native forms as data keyed by format, so slicer cards 032/223's `resolve(...).native("orca")` reads `.native["orca-json"]`. No provenance field (E13 adds it). No new DiagnosticCode for export failures. Notes: `.reference/notes/PRF-123-ports.md`.

### Coordinator: shared-file changes
`src/index.ts`: add `export * from './application/ports/index.ts';`
`CHANGELOG.md` (Unreleased, Added): `Importer, Exporter and ProfileStore read ports, and the runImporterContract / runExporterContract suites (PRF-123).`

Review (sp7-rev-d): PASS. Checked the four criteria against the card, US18, E12 and E13 and the consumer cards (PRF-44, 49, 55, 59; SLC 032, 223). Ports are type-only in `src/application/ports/`, import only domain types, no speculative surface; contract suites are framework-free and test both a passing and failing fake. `eslint.config.mjs` override is right for this module: `src/` has no adapters and no Node use (catalogue loaders read JSON through import attributes, not `fs`), and the override keeps the shared `vscode` ban, so nothing is lost; `test/layers.test.ts` proves `node:fs`, `fs` and `vscode` fail. Ran `pnpm lint` (eslint and tsc clean; prettier fails only on `tools/catalogue/generate.ts`, another card), `pnpm test` (361/362, the one failure is `test/catalogue-cura.test.ts`, another card), `pnpm build` ok; prettier clean on the card's files. Follow-ups for the coordinator, not failures: (1) SLC 032 and 223 say `resolve(...).native("orca")` / `.native("prusa")`; with this port they read `.native["orca-json"]` / `.native["prusa-ini"]` and must handle `undefined` (Partial record); update those cards. (2) PRF-49 says `resolve -> {unified, provenance}`; it adds `provenance` to `ResolvedProfile`. (3) The lint ban covers static imports only: dynamic `import('fs')` and the `process`/`Buffer` globals (shared config sets `globals.node`) still pass.
