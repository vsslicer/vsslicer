---
id: 122
title: "Define ImportResult, Diagnostic and the printer-instance import result types"
type: feature
priority: P0
effort: S
model: sonnet
area: [importers]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-a
depends_on: [1, 2]
created: 2026-10-25
---

The shared result shape every ecosystem adapter returns and the core consumes: `ImportResult {entities, native, diagnostics}`, one diagnostic type, and an instance import result that carries a credential separately from the entity.

**Code:** `vsslicer/modules/profile-api/src/domain/import-result/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] `Diagnostic` has severity, code, file, line and message; the codes of the epic (cycle, unknown parent, malformed line, invalid JSON, unknown type, unreadable folder, credential-missing) exist as a closed union
- [x] `InstanceImport {entity, credential?}` keeps the credential outside the entity type (type test: the entity type has no credential field)
- [x] Type tests fail if a field is dropped

## Tasks

- [x] Write the types
- [x] Add the type tests

## Progress

Done: `Severity`, `DiagnosticCode` (closed union of the 7 epic codes), `Diagnostic` (line optional: folder-level problems have none), `ImportedEntity` (union of the entity types), `ImportResult {entities, native: Record<string, unknown>, diagnostics}`, `InstanceImport {entity: PrinterInstance, credential?: string}`.
Files: `src/domain/import-result/import-result.ts`, `src/domain/import-result/index.ts`, `test/import-result.test.ts`.
Verified: `pnpm lint && pnpm test && pnpm build` pass; deleting `line` from Diagnostic makes `pnpm test` fail with TS2344/TS2339.
Not done: nothing.

### Coordinator: shared-file changes
`src/index.ts`: add `export type * from './domain/import-result/index.ts';`

Review (sp7-rev-prf): PASS. Checked `src/domain/import-result/{import-result,index}.ts` and `test/import-result.test.ts` against the criteria. Diagnostic has severity, code, file, optional line and message; DiagnosticCode is a closed union of the 7 epic codes; InstanceImport {entity: PrinterInstance, credential?} and PrinterInstance has no credential field (its `connection.secret_ref` is a key, not the secret). Domain layer imports only `../entities`. No shared files touched (`src/index.ts` unchanged; the export goes through the coordinator). Mutation probe in /private/tmp/claude-501/sp7w.DRAE/prf122 (copied types, typechecked with the module's tsc): dropping line or native, making file or entities optional, making credential required, and adding a code all fail to compile. `pnpm lint`, `pnpm test` (279) and `pnpm build` pass. Non-blocking: retyping `Diagnostic.code` to `string` still compiles, so the test's comment overclaims ("retyped fails"). `expectTypeOf<Diagnostic['code']>().toEqualTypeOf<DiagnosticCode>()` would fix that. The ImportedEntity union members are not pinned either.
