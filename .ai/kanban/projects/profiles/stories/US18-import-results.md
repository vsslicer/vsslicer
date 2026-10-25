---
id: US18
title: "Every import returns entities, native forms and diagnostics without blocking the editor"
status: reviewed
epic: VSS:E12
---

A developer calling an importer gets an `ImportResult {entities, native, diagnostics}`; imports run in a worker so a large tree never freezes the extension host, and no failure is silent.

## Acceptance criteria

- [ ] `PrusaResearch.ini` and the full Orca tree each import in under 10 s on CI with the host heartbeat never stalling
- [ ] Each failure kind (cycle, unknown parent, malformed line, invalid JSON, unknown type, unreadable folder) has a diagnostic code and a test showing other entities still import
- [ ] Importers return no entity that fails schema validation

## Out of scope

- Persisting results (E13).
