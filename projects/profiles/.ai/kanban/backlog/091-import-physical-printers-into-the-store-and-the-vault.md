---
id: 91
title: Import physical printers into the store and the vault
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US36
milestone: "VSS:M2"
depends_on: [84, 136]
created: 2026-10-25
---

The use case: instance entity into the store, credential into the vault, diagnostics for what could not import, sources untouched. It consumes `InstanceImport` results from the registered importers.

**Code:** `vsslicer/modules/profiles/src/application/instances/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] With fake importers returning `InstanceImport`s, entities land in the store and credentials in the fake vault under new `secret_ref`s; the entity files hold no credential
- [ ] Re-running the import is idempotent (no duplicate instances or secrets)
- [ ] An instance with an unknown host type has no connection and a diagnostic; the real-source run is the extension's leak-scan test

## Tasks

- [ ] Write the use case
- [ ] Idempotency
- [ ] Tests

## Progress

Not started.
